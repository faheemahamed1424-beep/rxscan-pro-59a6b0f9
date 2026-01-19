import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Check, Plus, Info, ShieldCheck, Loader2, Package, Pill } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { useMedicineValidation, DrugInfo } from "@/hooks/useMedicineValidation";

interface MedicineData {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  fdaInfo?: DrugInfo;
}

const MedicineDetails = () => {
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<MedicineData | null>(null);
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const { validateMedicine, isValidating } = useMedicineValidation();

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedMedicine');
    if (stored) {
      const parsed = JSON.parse(stored);
      setMedicine(parsed);
      
      // If FDA info was passed from Results page, use it
      if (parsed.fdaInfo) {
        setDrugInfo(parsed.fdaInfo);
      } else {
        // Otherwise fetch it
        fetchDrugInfo(parsed.name);
      }
    }
  }, []);

  const fetchDrugInfo = async (name: string) => {
    const info = await validateMedicine(name);
    if (info) {
      setDrugInfo(info);
    }
  };

  if (!medicine) {
    return (
      <div className="page-container bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = drugInfo?.brandName || medicine.name;
  const genericName = drugInfo?.genericName || medicine.name;

  return (
    <div className="page-container bg-background">
      <PageTransition>
        {/* Header with Medicine Card */}
        <div className="gradient-bg px-6 pt-12 pb-20 rounded-b-[2.5rem]">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Medicine Details</h1>
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Pill className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
                <p className="text-primary font-semibold">{medicine.dosage}</p>
                {genericName !== displayName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Generic: {genericName}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {drugInfo?.validated && (
                    <span className="status-badge status-success flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      FDA Verified
                    </span>
                  )}
                  {drugInfo?.drugClass && drugInfo.drugClass !== 'Not classified' && (
                    <span className="status-badge bg-muted text-muted-foreground">
                      {drugInfo.drugClass}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="px-6 -mt-8 space-y-6">
          {isValidating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-muted/50"
            >
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading FDA information...</span>
            </motion.div>
          )}

          {/* What it treats / Indications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-solid rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">What it treats</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {drugInfo?.indications && drugInfo.indications !== 'See package insert' && drugInfo.indications !== 'Consult your healthcare provider'
                ? drugInfo.indications 
                : `${displayName} is prescribed for ${medicine.frequency} for ${medicine.duration}. ${medicine.instructions}. Consult your doctor for specific indications.`
              }
            </p>
          </motion.div>

          {/* Active Ingredients */}
          {drugInfo?.activeIngredients && drugInfo.activeIngredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-card-solid rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">Active Ingredients</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {drugInfo.activeIngredients.slice(0, 5).map((ingredient, index) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-secondary/10 text-secondary-foreground text-sm">
                    {ingredient}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Dosage Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-solid rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Your Prescribed Dosage</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
                <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{medicine.dosage}</p>
                  <p className="text-sm text-muted-foreground">
                    {medicine.frequency} • {medicine.duration}
                  </p>
                </div>
              </div>
              
              {drugInfo?.dosageForms && drugInfo.dosageForms.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">Available forms:</p>
                  <div className="flex flex-wrap gap-2">
                    {drugInfo.dosageForms.slice(0, 4).map((form, index) => (
                      <span key={index} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                        {form}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Warnings & Precautions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card-solid rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground">Warnings & Precautions</h3>
            </div>
            <div className="space-y-3">
              {drugInfo?.warnings && drugInfo.warnings.length > 0 ? (
                drugInfo.warnings.map((warning, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-3 rounded-xl bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-sm text-foreground">{warning}</p>
                  </motion.div>
                ))
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <p className="text-sm text-foreground">
                      ⚠️ Always take as prescribed by your doctor
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-sm text-foreground">
                      💊 Complete the full course even if feeling better
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Side Effects */}
          {drugInfo?.sideEffects && drugInfo.sideEffects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card-solid rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <span className="text-lg">💊</span>
                </div>
                <h3 className="font-semibold text-foreground">Possible Side Effects</h3>
              </div>
              <div className="space-y-2">
                {drugInfo.sideEffects.slice(0, 4).map((effect, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    • {effect}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Drug Interactions */}
          {drugInfo?.interactions && drugInfo.interactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="glass-card-solid rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <span className="text-lg">⚡</span>
                </div>
                <h3 className="font-semibold text-foreground">Drug Interactions</h3>
              </div>
              <div className="space-y-2">
                {drugInfo.interactions.slice(0, 3).map((interaction, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    • {interaction}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Storage Instructions */}
          {drugInfo?.storageInstructions && drugInfo.storageInstructions !== 'Store as directed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-4 rounded-2xl bg-muted/50"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">📦 Storage:</span> {drugInfo.storageInstructions}
              </p>
            </motion.div>
          )}

          {/* Manufacturer */}
          {drugInfo?.manufacturer && drugInfo.manufacturer !== 'Not available' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-center text-xs text-muted-foreground"
            >
              Manufactured by: {drugInfo.manufacturer}
            </motion.div>
          )}

          {/* Add to Reminders Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/reminders")}
            className="w-full btn-gradient flex items-center justify-center gap-3 text-lg mb-6"
          >
            <Plus className="w-5 h-5" />
            Add to Reminders
          </motion.button>
        </div>
      </PageTransition>

      <BottomNav />
    </div>
  );
};

export default MedicineDetails;
