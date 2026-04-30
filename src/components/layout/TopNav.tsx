"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

export function TopNav() {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    // Exact match for root, or startsWith for other paths (like /portfolio or /stake)
    const isActive = path === "/" ? pathname === "/" : pathname.startsWith(path);

    if (isActive) {
      return "text-xs font-sans font-bold text-foreground border-b-2 border-primary h-full flex items-center tracking-widest uppercase transition-all";
    }

    return "text-xs font-sans font-bold text-muted-foreground hover:text-foreground h-full flex items-center border-b-2 border-transparent tracking-widest uppercase transition-all";
  };

  return (
    <nav className="flex items-center justify-between px-6 h-18 bg-background border-b border-border">
      <div className="flex items-center gap-20 h-full">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Logo className="w-8 h-8 text-primary" />
          <span className="text-xl font-heading font-extrabold text-foreground tracking-tight lowercase">
            winnr
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-10 h-full">
          <Link href="/" className={getLinkClasses("/")}>
            Markets
          </Link>
          <Link href="/portfolio" className={getLinkClasses("/portfolio")}>
            Portfolio
          </Link>
          <Link href="/stake" className={getLinkClasses("/stake")}>
            Stake
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {/* Note: WalletConnectButton will be restyled globally via Button component */}
        <WalletConnectButton />
      </div>
    </nav>
  );
}
