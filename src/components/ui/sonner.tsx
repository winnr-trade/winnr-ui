"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans rounded-none border border-border bg-surface-container-low text-foreground shadow-2xl",
          description: "text-muted-foreground text-xs",
          actionButton:
            "bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px]",
          cancelButton:
            "bg-muted text-muted-foreground font-bold uppercase tracking-widest text-[10px]",
          success: "border-l-4 border-l-emerald-500 text-emerald-500",
          error: "border-l-4 border-l-destructive text-destructive",
          info: "border-l-4 border-l-blue-500 text-blue-500",
          warning: "border-l-4 border-l-yellow-500 text-yellow-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
