import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Check, Plus, Info } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";

const MedicineDetails = () => {
  const navigate = useNavigate();

  const dosageInfo = [
    { age: "Adult (18+)", dosage: "500mg", frequency: "Twice daily", isRecommended: true },
    { age: "Child (6-17)", dosage: "250mg", frequency: "Twice daily", isRecommended: false },
    { age: "Infant (2-5)", dosage: "125mg", frequency: "Once daily", isRecommended: false },
  ];

  const precautions = [
    { icon: "⚠️", text: "Penicillin allergy - Do not take if allergic", severity: "high" },
    { icon: "🍺", text: "Avoid alcohol during treatment", severity: "medium" },
    { icon: "🤰", text: "Consult doctor if pregnant or breastfeeding", severity: "medium" },
    { icon: "💊", text: "Complete full course even if feeling better", severity: "low" },
  ];

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
                <span className="text-3xl">💊</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">Amoxicillin</h2>
                <p className="text-primary font-semibold">500mg Capsule</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="status-badge status-success">Antibiotic</span>
                  <span className="status-badge bg-muted text-muted-foreground">Rx Required</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="px-6 -mt-8 space-y-6">
          {/* What it treats */}
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
              Amoxicillin is a penicillin-type antibiotic used to treat bacterial infections 
              including respiratory tract infections, ear infections, urinary tract infections, 
              skin infections, and dental abscesses.
            </p>
          </motion.div>

          {/* Dosage by Age */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-solid rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Dosage by Age</h3>
            </div>
            <div className="divide-y divide-border">
              {dosageInfo.map((item, index) => (
                <motion.div
                  key={item.age}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`p-4 flex items-center justify-between ${
                    item.isRecommended ? "bg-success/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.isRecommended && (
                      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{item.age}</p>
                      <p className="text-sm text-muted-foreground">{item.frequency}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">{item.dosage}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Precautions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card-solid rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground">Precautions</h3>
            </div>
            <div className="space-y-3">
              {precautions.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`p-3 rounded-xl flex items-start gap-3 ${
                    item.severity === "high"
                      ? "bg-destructive/10 border border-destructive/20"
                      : item.severity === "medium"
                      ? "bg-warning/10 border border-warning/20"
                      : "bg-muted/50"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-sm text-foreground">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Add to Reminders Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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
