import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Info, Bell, Save, ArrowLeft, AlertCircle, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { ScanResult, Medicine } from "@/hooks/usePrescriptionScan";
import { useSavePrescription } from "@/hooks/usePrescriptions";
import { useMedicineValidation, DrugInfo } from "@/hooks/useMedicineValidation";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [validatedMedicines, setValidatedMedicines] = useState<Map<string, DrugInfo>>(new Map());
  const savePrescription = useSavePrescription();
  const { validateMedicine, isValidating } = useMedicineValidation();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('scanResult');
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setScanResult(parsed);
        
        // Validate each medicine against FDA database
        if (parsed.medicines && parsed.medicines.length > 0) {
          validateAllMedicines(parsed.medicines);
        }
      } catch (e) {
        console.error('Failed to parse scan result:', e);
      }
    }
  }, []);

  const validateAllMedicines = async (medicines: Medicine[]) => {
    const results = new Map<string, DrugInfo>();
    
    for (const med of medicines) {
      const info = await validateMedicine(med.name);
      if (info) {
        results.set(med.name.toLowerCase(), info);
      }
    }
    
    setValidatedMedicines(results);
  };

  const medicines = scanResult?.medicines || [];
  const confidence = scanResult?.confidence || 0;

  const getValidationStatus = (medicineName: string) => {
    const info = validatedMedicines.get(medicineName.toLowerCase());
    if (!info) return null;
    return info.validated;
  };

  const getValidationInfo = (medicineName: string) => {
    return validatedMedicines.get(medicineName.toLowerCase());
  };

  const handleSave = async () => {
    if (!scanResult || medicines.length === 0) return;

    try {
      await savePrescription.mutateAsync({
        medicines: medicines.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
        })),
        confidence_score: confidence,
        raw_text: scanResult.rawText || "",
      });

      toast({
        title: "Saved!",
        description: "Prescription saved to your account",
      });

      sessionStorage.removeItem('scanResult');
      sessionStorage.removeItem('scannedImage');
      navigate("/prescriptions");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save prescription",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (medicine: Medicine) => {
    const validationInfo = getValidationInfo(medicine.name);
    sessionStorage.setItem('selectedMedicine', JSON.stringify({
      ...medicine,
      fdaInfo: validationInfo
    }));
    navigate("/medicine-details");
  };

  return (
    <div className="page-container bg-background">
      <PageTransition>
        {/* Success Header */}
        <div className="gradient-bg px-6 pt-12 pb-16 rounded-b-[2.5rem]">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/upload")}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"
            >
              {medicines.length > 0 ? (
                <CheckCircle2 className="w-12 h-12 text-white" />
              ) : (
                <AlertCircle className="w-12 h-12 text-white" />
              )}
            </motion.div>
            <h1 className="text-2xl font-bold text-white">
              {medicines.length > 0 ? "Analysis Complete!" : "No Medicines Detected"}
            </h1>
            <p className="text-white/80 mt-2">
              {medicines.length > 0 
                ? `${medicines.length} medicine${medicines.length > 1 ? 's' : ''} detected • ${confidence}% confidence`
                : "Try uploading a clearer image"
              }
            </p>
          </motion.div>
        </div>

        {/* Results Card */}
        <div className="px-6 -mt-8">
          {medicines.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-solid rounded-3xl overflow-hidden"
            >
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Detected Medicines</h2>
                {isValidating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating...</span>
                  </div>
                )}
              </div>

              <div className="divide-y divide-border">
                {medicines.map((medicine, index) => {
                  const validationStatus = getValidationStatus(medicine.name);
                  const fdaInfo = getValidationInfo(medicine.name);
                  
                  return (
                    <motion.div
                      key={medicine.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground text-lg">
                              {medicine.name}
                            </h3>
                            {validationStatus === true && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
                                <ShieldCheck className="w-3 h-3" />
                                FDA Verified
                              </div>
                            )}
                            {validationStatus === false && (
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
                                <ShieldAlert className="w-3 h-3" />
                                Not Found
                              </div>
                            )}
                          </div>
                          <span className="text-primary font-medium">{medicine.dosage}</span>
                          {fdaInfo?.validated && fdaInfo.genericName && fdaInfo.genericName !== medicine.name && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Generic: {fdaInfo.genericName}
                            </p>
                          )}
                          {fdaInfo?.validated && fdaInfo.drugClass && fdaInfo.drugClass !== 'Not classified' && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">
                              {fdaInfo.drugClass}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleViewDetails(medicine)}
                          className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                        >
                          <Info className="w-5 h-5 text-primary" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                          <p className="text-sm font-medium text-foreground">{medicine.frequency}</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Duration</p>
                          <p className="text-sm font-medium text-foreground">{medicine.duration}</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3 text-center">
                          <p className="text-xs text-muted-foreground mb-1">When</p>
                          <p className="text-sm font-medium text-foreground">{medicine.instructions}</p>
                        </div>
                      </div>

                      {/* FDA Warnings */}
                      {fdaInfo?.validated && fdaInfo.warnings && fdaInfo.warnings.length > 0 && (
                        <div className="mt-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                          <p className="text-xs font-medium text-destructive mb-1">⚠️ FDA Warnings</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {fdaInfo.warnings[0]}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-solid rounded-3xl p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No medicines found
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                The AI couldn't detect any medicines in the uploaded image. 
                Try uploading a clearer photo of your prescription.
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="btn-gradient px-6 py-3 rounded-xl font-medium"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Action Buttons */}
          {medicines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-3 mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/reminders")}
                className="action-card flex flex-col items-center gap-2 py-4"
              >
                <Bell className="w-6 h-6 text-warning" />
                <span className="text-sm font-medium text-foreground">Set Reminders</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: savePrescription.isPending ? 1 : 1.02 }}
                whileTap={{ scale: savePrescription.isPending ? 1 : 0.98 }}
                onClick={handleSave}
                disabled={savePrescription.isPending}
                className="action-card flex flex-col items-center gap-2 py-4 gradient-bg"
              >
                {savePrescription.isPending ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Save className="w-6 h-6 text-white" />
                )}
                <span className="text-sm font-medium text-white">
                  {savePrescription.isPending ? "Saving..." : "Save Prescription"}
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* Confidence Info */}
          {medicines.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">ℹ️</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    {confidence >= 80 ? "High Accuracy" : confidence >= 50 ? "Moderate Accuracy" : "Low Accuracy"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Medicines are validated against the FDA OpenFDA database. Always verify with your pharmacist.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Raw Text (Debug) */}
          {scanResult?.rawText && (
            <motion.details
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4"
            >
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                View extracted text
              </summary>
              <div className="mt-2 p-4 rounded-xl bg-muted/50 text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                {scanResult.rawText}
              </div>
            </motion.details>
          )}
        </div>
      </PageTransition>

      <BottomNav />
    </div>
  );
};

export default Results;
