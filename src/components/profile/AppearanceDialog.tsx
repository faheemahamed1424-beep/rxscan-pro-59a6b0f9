import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AppearanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Theme = "light" | "dark" | "system";

export const AppearanceDialog = ({ open, onOpenChange }: AppearanceDialogProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "system";
  });
  const [reducedMotion, setReducedMotion] = useState(
    localStorage.getItem("reducedMotion") === "true"
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    
    if (selectedTheme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", systemDark);
    } else {
      root.classList.toggle("dark", selectedTheme === "dark");
    }
    
    localStorage.setItem("theme", selectedTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} mode`,
    });
  };

  const handleReducedMotion = (enabled: boolean) => {
    setReducedMotion(enabled);
    localStorage.setItem("reducedMotion", String(enabled));
    document.documentElement.classList.toggle("reduce-motion", enabled);
    toast({
      title: enabled ? "Reduced Motion Enabled" : "Animations Enabled",
      description: enabled ? "Animations have been reduced" : "Full animations restored",
    });
  };

  const themeOptions = [
    { value: "light" as Theme, icon: Sun, label: "Light" },
    { value: "dark" as Theme, icon: Moon, label: "Dark" },
    { value: "system" as Theme, icon: Monitor, label: "System" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Appearance</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-foreground">Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <option.icon className={`w-6 h-6 ${
                    theme === option.value ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <span className={`text-sm font-medium ${
                    theme === option.value ? "text-primary" : "text-foreground"
                  }`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label htmlFor="reducedMotion" className="text-foreground">Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">Minimize animations</p>
              </div>
            </div>
            <Switch
              id="reducedMotion"
              checked={reducedMotion}
              onCheckedChange={handleReducedMotion}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
