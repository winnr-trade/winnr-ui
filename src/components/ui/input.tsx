import * as React from "react";

import { cn } from "@/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full bg-input px-4 pt-2 pb-1 text-sm text-foreground transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground outline-none focus-visible:bg-muted focus-visible:border-b-2 focus-visible:border-b-primary disabled:cursor-not-allowed disabled:opacity-50 font-sans border-b-2 border-transparent",
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
