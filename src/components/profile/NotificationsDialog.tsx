import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, BellRing, Clock, Pill } from "lucide-react";

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationsDialog = ({ open, onOpenChange }: NotificationsDialogProps) => {
  const { permission, requestPermission, isGranted, isDenied } = useNotifications();
  const [settings, setSettings] = useState({
    medicineReminders: true,
    refillAlerts: true,
    dailySummary: false,
    soundEnabled: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("notificationSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem("notificationSettings", JSON.stringify(newSettings));
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Permission Status */}
          <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isGranted ? "bg-success/10" : "bg-warning/10"
                }`}>
                  {isGranted ? (
                    <BellRing className="w-5 h-5 text-success" />
                  ) : (
                    <Bell className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {isGranted ? "Enabled" : isDenied ? "Blocked in browser" : "Not enabled"}
                  </p>
                </div>
              </div>
              {!isGranted && !isDenied && (
                <button
                  onClick={handleEnableNotifications}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="medicineReminders" className="text-foreground">Medicine Reminders</Label>
                  <p className="text-xs text-muted-foreground">Get reminded when it's time to take medicine</p>
                </div>
              </div>
              <Switch
                id="medicineReminders"
                checked={settings.medicineReminders}
                onCheckedChange={() => handleToggle("medicineReminders")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="refillAlerts" className="text-foreground">Refill Alerts</Label>
                  <p className="text-xs text-muted-foreground">Notify when medicine supply is low</p>
                </div>
              </div>
              <Switch
                id="refillAlerts"
                checked={settings.refillAlerts}
                onCheckedChange={() => handleToggle("refillAlerts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellRing className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="dailySummary" className="text-foreground">Daily Summary</Label>
                  <p className="text-xs text-muted-foreground">Receive a daily medication overview</p>
                </div>
              </div>
              <Switch
                id="dailySummary"
                checked={settings.dailySummary}
                onCheckedChange={() => handleToggle("dailySummary")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <Label htmlFor="soundEnabled" className="text-foreground">Sound</Label>
                  <p className="text-xs text-muted-foreground">Play sound with notifications</p>
                </div>
              </div>
              <Switch
                id="soundEnabled"
                checked={settings.soundEnabled}
                onCheckedChange={() => handleToggle("soundEnabled")}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
