import type * as React from "react";
import { cn } from "@/utils";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {}

export function Display({ className, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        "font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Heading({ className, ...props }: TypographyProps) {
  return (
    <h2
      className={cn(
        "font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function Body({ className, ...props }: TypographyProps) {
  return (
    <p
      className={cn(
        "font-body text-base text-foreground leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export function Data({ className, ...props }: TypographyProps) {
  return (
    <span
      className={cn("font-sans text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
