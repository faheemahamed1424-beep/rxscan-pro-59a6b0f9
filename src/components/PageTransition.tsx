import { motion } from "framer-motion";
import { ReactNode, forwardRef } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }
);

PageTransition.displayName = "PageTransition";
