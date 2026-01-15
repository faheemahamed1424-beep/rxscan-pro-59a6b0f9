import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { usePrescriptionScan, ScanResult } from "@/hooks/usePrescriptionScan";
import { toast } from "sonner";

interface ProcessingStep {
  id: number;
  label: string;
  status: "pending" | "processing" | "completed" | "error";
}

const Processing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scanPrescription, isScanning, progress, currentStep, error, result } = usePrescriptionScan();
  
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 1, label: "Image preprocessing", status: "processing" },
    { id: 2, label: "OCR text extraction", status: "pending" },
    { id: 3, label: "Text parsing", status: "pending" },
    { id: 4, label: "Medicine identification", status: "pending" },
  ]);
  const [eta, setEta] = useState(15);
  const [hasStartedScan, setHasStartedScan] = useState(false);

  // Get image from location state or sessionStorage
  const imageBase64 = location.state?.imageBase64 || sessionStorage.getItem('scannedImage');

  useEffect(() => {
    if (!imageBase64) {
      toast.error('No image found. Please upload a prescription first.');
      navigate('/upload');
      return;
    }

    // Check if we already have a result from the upload page
    const storedResult = sessionStorage.getItem('scanResult');
    if (storedResult) {
      // Result already exists, just animate through and navigate
      animateToCompletion();
      return;
    }

    // Start the actual scan if we haven't already
    if (!hasStartedScan) {
      setHasStartedScan(true);
      startScan();
    }
  }, [imageBase64, hasStartedScan]);

  const animateToCompletion = async () => {
    const stepDelays = [400, 800, 1200, 1600];
    
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDelays[i] - (i > 0 ? stepDelays[i-1] : 0)));
      setSteps(prev => prev.map((s, idx) => ({
        ...s,
        status: idx <= i ? 'completed' : idx === i + 1 ? 'processing' : 'pending'
      })));
      setEta(Math.max(0, 15 - (i + 1) * 4));
    }

    setTimeout(() => navigate('/results'), 500);
  };

  const startScan = async () => {
    try {
      const scanResult = await scanPrescription(imageBase64);
      
      // Store result for the results page
      sessionStorage.setItem('scanResult', JSON.stringify(scanResult));
      
      // Mark all steps as completed
      setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
      
      setTimeout(() => navigate('/results'), 500);
    } catch (err) {
      console.error('Scan failed:', err);
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i < currentStep ? 'completed' : i === currentStep ? 'error' : 'pending'
      })));
      toast.error('Failed to scan prescription. Please try again.');
      setTimeout(() => navigate('/upload'), 2000);
    }
  };

  // Update steps based on currentStep from hook
  useEffect(() => {
    if (currentStep > 0) {
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i < currentStep - 1 ? 'completed' : i === currentStep - 1 ? 'processing' : 'pending'
      })));
      setEta(Math.max(0, 15 - currentStep * 4));
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
      <PageTransition>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          {/* Animated Scanner */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-white/20"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full border-4 border-white/30"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80" />
            </motion.div>
            <div className="absolute inset-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="text-3xl">🔬</span>
            </div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-white mb-2">Analyzing Prescription</h1>
            <p className="text-white/70">AI is extracting medicine information</p>
          </motion.div>

          {/* Progress Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-6"
          >
            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Overall Progress</span>
                <span className="text-primary font-semibold">{progress}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full gradient-bg rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      step.status === "completed"
                        ? "bg-success text-white"
                        : step.status === "processing"
                        ? "bg-primary text-white"
                        : step.status === "error"
                        ? "bg-destructive text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {step.status === "completed" ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="w-4 h-4" />
                        </motion.div>
                      ) : step.status === "processing" ? (
                        <motion.div
                          key="loader"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: 360 }}
                          transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <motion.span key="number" className="text-sm">
                          {step.id}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex-1">
                    <span
                      className={`text-sm font-medium ${
                        step.status === "pending"
                          ? "text-muted-foreground"
                          : step.status === "error"
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.status === "processing" && (
                      <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      step.status === "completed"
                        ? "text-success"
                        : step.status === "processing"
                        ? "text-primary"
                        : step.status === "error"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.status === "completed"
                      ? "✅"
                      : step.status === "processing"
                      ? "🔄"
                      : step.status === "error"
                      ? "❌"
                      : "⏳"}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* ETA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 pt-4 border-t border-border text-center"
            >
              <span className="text-muted-foreground">Estimated time: </span>
              <span className="text-foreground font-semibold">{eta}s</span>
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </PageTransition>
    </div>
  );
};

export default Processing;
