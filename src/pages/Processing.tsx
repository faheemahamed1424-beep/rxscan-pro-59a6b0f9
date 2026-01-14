import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

interface ProcessingStep {
  id: number;
  label: string;
  status: "pending" | "processing" | "completed";
  progress?: number;
}

const Processing = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 1, label: "Image preprocessing", status: "processing", progress: 0 },
    { id: 2, label: "OCR text extraction", status: "pending" },
    { id: 3, label: "Text parsing", status: "pending" },
    { id: 4, label: "Medicine identification", status: "pending" },
  ]);
  const [eta, setEta] = useState(12);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const simulateProcessing = () => {
      let currentStep = 0;
      let progress = 0;

      const interval = setInterval(() => {
        progress += 8;
        setOverallProgress(Math.min(progress, 100));

        if (progress >= 25 && currentStep === 0) {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === 0
                ? { ...s, status: "completed" }
                : i === 1
                ? { ...s, status: "processing", progress: 0 }
                : s
            )
          );
          currentStep = 1;
        } else if (progress >= 55 && currentStep === 1) {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === 1
                ? { ...s, status: "completed" }
                : i === 2
                ? { ...s, status: "processing" }
                : s
            )
          );
          currentStep = 2;
        } else if (progress >= 80 && currentStep === 2) {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === 2
                ? { ...s, status: "completed" }
                : i === 3
                ? { ...s, status: "processing" }
                : s
            )
          );
          currentStep = 3;
        } else if (progress >= 100) {
          setSteps((prev) =>
            prev.map((s) => ({ ...s, status: "completed" }))
          );
          clearInterval(interval);
          setTimeout(() => navigate("/results"), 500);
        }

        setEta(Math.max(0, 12 - Math.floor(progress / 8)));
      }, 300);

      return interval;
    };

    const interval = simulateProcessing();
    return () => clearInterval(interval);
  }, [navigate]);

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
            <p className="text-white/70">Please wait while we process your image</p>
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
                <span className="text-primary font-semibold">{overallProgress}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
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
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.status === "completed"
                      ? "✅"
                      : step.status === "processing"
                      ? "🔄"
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
          </motion.div>
        </motion.div>
      </PageTransition>
    </div>
  );
};

export default Processing;
