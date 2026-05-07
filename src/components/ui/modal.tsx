"use client";

import type * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

interface ModalProps {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ title, description, isOpen, onClose, children, className }: ModalProps) {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent
        className={cn(
          "max-w-md bg-surface-container border-border rounded-none shadow-2xl",
          className,
        )}
      >
        {(title || description) && (
          <DialogHeader className="mb-4">
            {title && (
              <DialogTitle className="text-xl font-heading font-bold text-white tracking-tight">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm font-sans text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className="mt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
