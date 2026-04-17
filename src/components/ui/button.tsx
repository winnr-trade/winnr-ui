"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-base font-sans font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary-container hover:brightness-110 shadow-sm",
        secondary:
          "bg-secondary text-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-white hover:brightness-110 shadow-sm",
        inverted:
          "bg-white text-black hover:bg-white/90",
        outline:
          "bg-transparent border border-border text-foreground hover:bg-surface-bright/20",
        ghost: "hover:bg-surface-container-high hover:text-foreground text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        pill: "rounded-full bg-surface-container text-muted-foreground hover:bg-surface-container-high hover:text-white data-[active=true]:bg-primary data-[active=true]:text-black",
        tech: "rounded-sm bg-white/5 border border-white/5 text-muted-foreground hover:border-white/20 hover:text-white data-[active=true]:bg-surface-container-highest data-[active=true]:border-primary/50 data-[active=true]:text-primary",
        tab: "rounded-none bg-transparent text-muted-foreground hover:text-primary/70 border-b border-transparent data-[active=true]:border-primary data-[active=true]:text-primary",
        tabWhite: "rounded-none bg-transparent text-muted-foreground hover:text-white/70 border-b border-transparent data-[active=true]:border-white data-[active=true]:text-white",
        outcome: "rounded-sm bg-transparent text-muted-foreground hover:text-white data-[active=true]:bg-primary data-[active=true]:text-black",
        wallet: "bg-surface-container hover:bg-surface-container-lowest border border-transparent hover:border-primary/20 hover:shadow-[0_0_15px_rgba(172,234,211,0.15)] group",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-10 text-lg",
        icon: "size-10",
        pill: "px-5 py-2.5 text-[10px] tracking-widest uppercase",
        xs: "px-3 py-1.5 text-[9px] tracking-widest uppercase",
        tab: "px-0 text-[10px] tracking-widest uppercase",
        outcome: "h-12 w-full text-[10px] tracking-widest uppercase",
        wallet: "h-16 w-full p-4 rounded-sm flex items-center justify-start gap-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
