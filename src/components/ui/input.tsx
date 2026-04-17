import * as React from "react";

import { cn } from "@/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full bg-surface-container-high rounded-md px-4 text-base text-foreground transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary border border-border disabled:cursor-not-allowed disabled:opacity-50 font-sans",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
