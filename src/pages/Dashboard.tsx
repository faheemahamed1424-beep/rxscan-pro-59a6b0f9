import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Bell, FileText, Settings, Clock, ChevronRight, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { useNotifications } from "@/hooks/useNotifications";

const actionCards = [
  {
    icon: "📸",
    label: "Scan Prescription",
    description: "Upload & analyze",
    path: "/upload",
    gradient: "from-primary/10 to-accent/10",
    iconBg: "bg-primary/10",
  },
  {
    icon: "🔔",
    label: "Reminders",
    description: "Manage schedule",
    path: "/reminders",
    gradient: "from-warning/10 to-warning/5",
    iconBg: "bg-warning/10",
  },
  {
    icon: "📋",
    label: "My Prescriptions",
    description: "View history",
    path: "/prescriptions",
    gradient: "from-success/10 to-success/5",
    iconBg: "bg-success/10",
  },
  {
    icon: "⚙️",
    label: "Settings",
    description: "App preferences",
    path: "/settings",
    gradient: "from-secondary/10 to-secondary/5",
    iconBg: "bg-secondary/10",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const { permission, requestPermission, isSupported } = useNotifications();

  // Get user's first name from email
  const userName = user?.email?.split("@")[0] || "there";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // Get recent prescriptions (last 3)
  const recentPrescriptions = prescriptions.slice(0, 3);

  return (
    <div className="page-container bg-background">
      <PageTransition>
        {/* Header with soft gradient */}
        <div className="bg-gradient-to-br from-primary via-primary to-accent px-6 pt-12 pb-24 rounded-b-[2.5rem] relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Welcome back,</p>
                <h1 className="text-2xl font-bold text-white mt-1">
                  Hi {displayName}! 👋
                </h1>
              </div>
              {isSupported && permission !== "granted" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={requestPermission}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  Enable Alerts
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Action Cards Grid */}
        <div className="px-6 -mt-14 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {actionCards.map((card, index) => (
              <motion.button
                key={card.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(card.path)}
                className={`bg-card rounded-2xl p-5 text-left border border-border shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300`}
              >
                <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <h3 className="font-semibold text-foreground text-sm">{card.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
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
              <h2 className="text-base font-semibold text-foreground">Recent Prescriptions</h2>
              <button
                onClick={() => navigate("/prescriptions")}
                className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              </div>
            ) : recentPrescriptions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10 bg-card rounded-2xl border border-dashed border-border"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground text-sm">No prescriptions yet</p>
                <button
                  onClick={() => navigate("/upload")}
                  className="text-primary font-medium mt-2 hover:underline text-sm"
                >
                  Scan your first prescription
                </button>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {recentPrescriptions.map((prescription, index) => (
                  <motion.div
                    key={prescription.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    onClick={() => navigate("/medicine-details")}
                    className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <span className="text-lg">💊</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">
                          {prescription.medicines[0]?.name || "Prescription"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {prescription.medicines.length} medicine{prescription.medicines.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {new Date(prescription.scan_date).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="px-6 mt-8 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-card rounded-2xl p-5 border border-border shadow-sm"
          >
            <h3 className="font-semibold text-foreground text-sm mb-4">Your Health Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="stat-card">
                <div className="text-2xl font-bold text-primary">{prescriptions.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Total Scans</p>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold text-success">
                  {prescriptions.reduce((acc, p) => acc + p.medicines.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Medicines</p>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold text-accent">
                  {prescriptions.length > 0 
                    ? Math.round(prescriptions.reduce((acc, p) => acc + (p.confidence_score || 0), 0) / prescriptions.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
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
