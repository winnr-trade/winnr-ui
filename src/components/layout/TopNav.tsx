import { Search } from "lucide-react";
import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

export function TopNav() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-background border-b border-surface-container">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-heading font-bold text-primary tracking-tight">
            WINNR
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 translate-y-[1px]">
          <Link
            href="/"
            className="text-sm font-sans font-medium text-primary border-b-2 border-primary pb-[1.125rem] -mb-[1.125rem] transition-colors"
          >
            Markets
          </Link>
          <Link
            href="/vault"
            className="text-sm font-sans font-medium text-muted-foreground hover:text-primary transition-colors pb-[1.125rem] -mb-[1.125rem]"
          >
            Vault
          </Link>
          <Link
            href="/ranks"
            className="text-sm font-sans font-medium text-muted-foreground hover:text-primary transition-colors pb-[1.125rem] -mb-[1.125rem]"
          >
            Ranks
          </Link>
          <Link
            href="/feed"
            className="text-sm font-sans font-medium text-muted-foreground hover:text-primary transition-colors pb-[1.125rem] -mb-[1.125rem]"
          >
            Feed
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search markets..."
            className="w-full h-10 bg-surface-container rounded-md pl-10 pr-4 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground border border-transparent focus:border-primary/50 transition-all text-foreground"
          />
        </div>
        <WalletConnectButton />
      </div>
    </nav>
  );
}
