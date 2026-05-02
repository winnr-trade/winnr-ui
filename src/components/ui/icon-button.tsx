import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { type VariantProps } from "class-variance-authority";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Pick<VariantProps<typeof import("@/components/ui/button").buttonVariants>, "variant"> {
  icon: React.ElementType;
  iconClassName?: string;
  size?: "default" | "sm" | "lg" | "xs"; // Custom mapping for icon sizes
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "default", icon: Icon, iconClassName, ...props }, ref) => {
    const sizeMap = {
      default: "size-10",
      sm: "size-8",
      lg: "size-12",
      xs: "size-6",
    };

    const iconSizeMap = {
      default: "size-5",
      sm: "size-4",
      lg: "size-6",
      xs: "size-3.5",
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(sizeMap[size], "p-0 flex items-center justify-center", className)}
        {...props}
      >
        <Icon className={cn(iconSizeMap[size], iconClassName)} />
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
