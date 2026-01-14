import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "solid" | "gradient";
}

export const GlassCard = ({ children, className, variant = "default" }: GlassCardProps) => {
  const variants = {
    default: "glass-card",
    solid: "glass-card-solid",
    gradient: "gradient-bg text-primary-foreground",
  };

  return (
    <div className={cn("rounded-2xl p-6", variants[variant], className)}>
      {children}
    </div>
  );
};
