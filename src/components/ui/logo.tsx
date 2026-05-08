import { cn } from "@/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src="/logo.svg"
        alt="Winnr"
        className="block md:hidden h-7 w-auto"
      />
      <img
        src="/logo-wide.svg"
        alt="Winnr"
        className="hidden md:block h-7 w-auto"
      />
    </div>
  );
}

