import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, FileText, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HelpSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqs = [
  {
    question: "How do I scan a prescription?",
    answer: "Tap the 'Scan' button on the dashboard, then either take a photo of your prescription or upload an existing image. Our AI will analyze and extract the medicine details automatically."
  },
  {
    question: "How accurate is the scan?",
    answer: "Our AI-powered scanner has high accuracy rates, but we recommend always verifying the extracted information with your actual prescription. The confidence score shown indicates how certain the AI is about the extraction."
  },
  {
    question: "How do I set up medicine reminders?",
    answer: "Go to the Reminders page from the bottom navigation. You can enable notifications for each medicine to receive timely reminders. Make sure to allow notifications when prompted."
  },
  {
    question: "Is my medical data secure?",
    answer: "Yes, your data is encrypted and stored securely. We use industry-standard security practices and never share your personal health information with third parties."
  },
  {
    question: "Can I export my prescription history?",
    answer: "Currently, you can view all your scanned prescriptions in the Prescriptions tab. Export functionality will be available in a future update."
  },
  {
    question: "What do I do if a medicine is not recognized?",
    answer: "If a medicine isn't recognized correctly, you can manually edit the details after scanning. We continuously improve our database to recognize more medicines."
  },
];

export const HelpSupportDialog = ({ open, onOpenChange }: HelpSupportDialogProps) => {
  const handleContactSupport = (method: string) => {
    if (method === "email") {
      window.location.href = "mailto:support@rxscanner.app?subject=Support Request";
    } else {
      toast({
        title: "Coming Soon",
        description: "Live chat support will be available soon!",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* FAQs */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Frequently Asked Questions
            </h3>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="border rounded-xl px-4"
                >
                  <AccordionTrigger className="text-left text-sm hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Options */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Contact Us</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleContactSupport("email")}
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm">Email Support</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleContactSupport("chat")}
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Live Chat</span>
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Resources</h3>
            <div className="space-y-2">
              <button className="w-full p-3 rounded-xl border hover:bg-muted transition-colors flex items-center justify-between">
                <span className="text-sm text-foreground">User Guide</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="w-full p-3 rounded-xl border hover:bg-muted transition-colors flex items-center justify-between">
                <span className="text-sm text-foreground">Privacy Policy</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="w-full p-3 rounded-xl border hover:bg-muted transition-colors flex items-center justify-between">
                <span className="text-sm text-foreground">Terms of Service</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
