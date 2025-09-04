"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onClose: () => void;
}

export function Toast({
  id,
  title,
  description,
  action,
  duration = 3000,
  onClose,
}: ToastProps) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}
      className={cn(
        "group pointer-events-auto relative flex w-full flex-col overflow-hidden rounded-md border border-border bg-background p-4 shadow-lg transition-all hover:shadow-xl",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
      )}
    >
      {/* Close button - positioned absolutely in top-right corner */}
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-muted"
        onClick={onClose}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Content section - text and icon */}
      <div className="flex items-start space-x-3 mb-3 pr-8">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div className="grid gap-1 flex-1">
          <div className="text-sm font-semibold leading-tight">{title}</div>
          {description && (
            <div className="text-sm opacity-90 leading-tight">
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Action button section - full width at bottom */}
      {action && (
        <div className="w-full">
          <Button
            size="sm"
            onClick={action.onClick}
            className="w-full h-9 px-3 text-xs bg-primary hover:bg-primary/90"
          >
            <ShoppingCart className="h-3 w-3 mr-2" />
            {action.label}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  return (
    <div className="toast-container fixed top-20 z-[150] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px]">
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </div>
  );
}
