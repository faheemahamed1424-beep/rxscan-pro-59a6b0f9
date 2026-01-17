import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, FileText, Bell, User } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/prescriptions", label: "Prescriptions", icon: FileText },
  { path: "/reminders", label: "Reminders", icon: Bell },
  { path: "/profile", label: "Profile", icon: User },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border shadow-lg"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around py-3 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              </div>
              <span className={`text-xs font-medium ${isActive ? "text-primary" : ""}`}>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/8 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};
