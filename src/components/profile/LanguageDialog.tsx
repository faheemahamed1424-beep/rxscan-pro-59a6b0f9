import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface LanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const languages = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
];

export const LanguageDialog = ({ open, onOpenChange }: LanguageDialogProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("language") || "en-US";
  });

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    localStorage.setItem("language", code);
    const lang = languages.find(l => l.code === code);
    toast({
      title: "Language Updated",
      description: `Language changed to ${lang?.name}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Language</DialogTitle>
        </DialogHeader>
        <div className="py-4 max-h-[400px] overflow-y-auto">
          <div className="space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-colors ${
                  selectedLanguage === lang.code
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-muted border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`font-medium ${
                    selectedLanguage === lang.code ? "text-primary" : "text-foreground"
                  }`}>
                    {lang.name}
                  </span>
                </div>
                {selectedLanguage === lang.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
