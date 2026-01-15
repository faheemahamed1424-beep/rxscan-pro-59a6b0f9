import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Bell, FileText, Settings, Clock, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { usePrescriptions } from "@/hooks/usePrescriptions";

const actionCards = [
  {
    icon: "📸",
    label: "Scan Prescription",
    description: "Upload & analyze",
    path: "/upload",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: "🔔",
    label: "Reminders",
    description: "Manage schedule",
    path: "/reminders",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: "📋",
    label: "My Prescriptions",
    description: "View history",
    path: "/prescriptions",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: "⚙️",
    label: "Settings",
    description: "App preferences",
    path: "/settings",
    color: "from-purple-500 to-indigo-600",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: prescriptions = [], isLoading } = usePrescriptions();

  // Get user's first name from email
  const userName = user?.email?.split("@")[0] || "there";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // Get recent prescriptions (last 3)
  const recentPrescriptions = prescriptions.slice(0, 3);

  return (
    <div className="page-container bg-background">
      <PageTransition>
        {/* Header */}
        <div className="gradient-bg px-6 pt-12 pb-20 rounded-b-[2.5rem]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-white/80 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white mt-1">
              Hi {displayName}! 👋
            </h1>
          </motion.div>
        </div>

        {/* Action Cards Grid */}
        <div className="px-6 -mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {actionCards.map((card, index) => (
              <motion.button
                key={card.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(card.path)}
                className="action-card text-left"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="font-semibold text-foreground">{card.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Recent Prescriptions */}
        <div className="px-6 mt-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
          <div className="flex items-center justify-between mb-4">
              <h2 className="section-header mb-0">Recent Prescriptions</h2>
              <button
                onClick={() => navigate("/prescriptions")}
                className="text-primary text-sm font-medium flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : recentPrescriptions.length === 0 ? (
              <div className="text-center py-8 glass-card-solid rounded-2xl">
                <p className="text-muted-foreground">No prescriptions yet</p>
                <button
                  onClick={() => navigate("/upload")}
                  className="text-primary font-medium mt-2 hover:underline"
                >
                  Scan your first prescription
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrescriptions.map((prescription, index) => (
                  <motion.div
                    key={prescription.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    onClick={() => navigate("/medicine-details")}
                    className="medicine-row cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-lg">💊</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {prescription.medicines[0]?.name || "Prescription"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {prescription.medicines.length} medicine{prescription.medicines.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="status-badge status-success">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(prescription.scan_date).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="px-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass-card-solid rounded-2xl p-6"
          >
            <h3 className="font-semibold text-foreground mb-4">Your Stats</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{prescriptions.length}</div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {prescriptions.reduce((acc, p) => acc + p.medicines.length, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Medicines</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {prescriptions.length > 0 
                    ? Math.round(prescriptions.reduce((acc, p) => acc + (p.confidence_score || 0), 0) / prescriptions.length)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </motion.div>
        </div>
      </PageTransition>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
