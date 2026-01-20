import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Moon,
  Globe,
  Heart
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { PersonalInfoDialog } from "@/components/profile/PersonalInfoDialog";
import { NotificationsDialog } from "@/components/profile/NotificationsDialog";
import { PrivacySecurityDialog } from "@/components/profile/PrivacySecurityDialog";
import { AppearanceDialog } from "@/components/profile/AppearanceDialog";
import { LanguageDialog } from "@/components/profile/LanguageDialog";
import { HelpSupportDialog } from "@/components/profile/HelpSupportDialog";

type DialogType = "personal" | "notifications" | "privacy" | "appearance" | "language" | "help" | null;

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: prescriptions = [] } = usePrescriptions();
  const [openDialog, setOpenDialog] = useState<DialogType>(null);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "No email";

  const totalMedicines = prescriptions.reduce((acc, p) => acc + p.medicines.length, 0);
  const avgAccuracy = prescriptions.length > 0
    ? Math.round(prescriptions.reduce((acc, p) => acc + (p.confidence_score || 0), 0) / prescriptions.length)
    : 0;

  const menuItems = [
    { icon: User, label: "Personal Information", description: "Name, email, phone", dialog: "personal" as DialogType },
    { icon: Bell, label: "Notifications", description: "Reminder preferences", dialog: "notifications" as DialogType },
    { icon: Shield, label: "Privacy & Security", description: "Password, 2FA", dialog: "privacy" as DialogType },
    { icon: Moon, label: "Appearance", description: "Theme settings", dialog: "appearance" as DialogType },
    { icon: Globe, label: "Language", description: localStorage.getItem("language") === "en-US" ? "English (US)" : localStorage.getItem("language") || "English (US)", dialog: "language" as DialogType },
    { icon: HelpCircle, label: "Help & Support", description: "FAQs, contact us", dialog: "help" as DialogType },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="page-container bg-background">
      <PageTransition>
        {/* Header */}
        <div className="gradient-bg px-6 pt-12 pb-20 rounded-b-[2.5rem]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mx-auto mb-4 flex items-center justify-center border-4 border-white/30">
              <span className="text-4xl">👤</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-white/70">{userEmail}</p>
          </motion.div>
        </div>

        {/* Stats Card */}
        <div className="px-6 -mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-solid rounded-2xl p-5"
          >
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{prescriptions.length}</div>
                <p className="text-sm text-muted-foreground">Prescriptions</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{totalMedicines}</div>
                <p className="text-sm text-muted-foreground">Medicines</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{avgAccuracy}%</div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Health Tip */}
        <div className="px-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-sm">Health Tip of the Day</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Take medications at the same time daily for best results
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Menu Items */}
        <div className="px-6 mt-6">
          <div className="glass-card-solid rounded-2xl overflow-hidden">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                onClick={() => setOpenDialog(item.dialog)}
                className="w-full p-4 flex items-center gap-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-6 mt-6">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="w-full p-4 rounded-2xl bg-destructive/10 text-destructive font-medium flex items-center justify-center gap-3 hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </motion.button>
        </div>

        {/* App Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-6 mb-4"
        >
          Rx Scanner v1.0.0
        </motion.p>
      </PageTransition>

      <BottomNav />

      {/* Dialogs */}
      <PersonalInfoDialog 
        open={openDialog === "personal"} 
        onOpenChange={(open) => !open && setOpenDialog(null)} 
      />
      <NotificationsDialog 
        open={openDialog === "notifications"} 
        onOpenChange={(open) => !open && setOpenDialog(null)} 
      />
      <PrivacySecurityDialog 
        open={openDialog === "privacy"} 
        onOpenChange={(open) => !open && setOpenDialog(null)} 
      />
      <AppearanceDialog 
        open={openDialog === "appearance"} 
        onOpenChange={(open) => !open && setOpenDialog(null)} 
      />
      <LanguageDialog 
        open={openDialog === "language"} 
        onOpenChange={(open) => !open && setOpenDialog(null)} 
      />
      <HelpSupportDialog 
        open={openDialog === "help"} 
        onOpenChange={(open) => !open && setOpenDialog(null)} 
      />
    </div>
  );
};

export default Profile;
