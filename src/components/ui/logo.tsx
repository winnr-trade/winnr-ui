import Image from "next/image";
import { cn } from "@/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logo.svg"
        alt="Winnr"
        width={25}
        height={28}
        className="block md:hidden h-7 w-auto"
      />
      <Image
        src="/logo-wide.svg"
        alt="Winnr"
        width={88}
        height={28}
        className="hidden md:block h-7 w-auto"
      />
    </div>
  );
}
