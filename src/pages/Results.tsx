import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Info, Bell, Save, ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";

const medicines = [
  {
    id: 1,
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "Twice daily",
    duration: "7 days",
    instructions: "After meals",
  },
  {
    id: 2,
    name: "Paracetamol",
    dosage: "650mg",
    frequency: "3x daily",
    duration: "3 days",
    instructions: "As needed for fever",
  },
];

const Results = () => {
  const navigate = useNavigate();

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
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Analysis Complete!</h1>
            <p className="text-white/80 mt-2">
              2 medicines detected • 92% confidence
            </p>
          </motion.div>
        </div>

        {/* Results Card */}
        <div className="px-6 -mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-solid rounded-3xl overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold text-foreground">Detected Medicines</h2>
            </div>

            <div className="divide-y divide-border">
              {medicines.map((medicine, index) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {medicine.name}
                      </h3>
                      <span className="text-primary font-medium">{medicine.dosage}</span>
                    </div>
                    <span className="text-2xl">💊</span>
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
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-3 mt-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/medicine-details")}
              className="action-card flex flex-col items-center gap-2 py-4"
            >
              <Info className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Details</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/reminders")}
              className="action-card flex flex-col items-center gap-2 py-4"
            >
              <Bell className="w-6 h-6 text-warning" />
              <span className="text-sm font-medium text-foreground">Reminders</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/prescriptions")}
              className="action-card flex flex-col items-center gap-2 py-4 gradient-bg"
            >
              <Save className="w-6 h-6 text-white" />
              <span className="text-sm font-medium text-white">Save</span>
            </motion.button>
          </motion.div>

          {/* Confidence Info */}
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
                <h4 className="font-medium text-foreground text-sm">High Accuracy</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Our AI analyzed your prescription with 92% confidence. Always verify with your pharmacist.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </PageTransition>

      <BottomNav />
    </div>
  );
};

export default Results;
