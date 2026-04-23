import Link from "next/link";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { Logo } from "@/components/ui/logo";

export function TopNav() {
  return (
    <nav className="flex items-center justify-between px-6 bg-background pt-4 border-b border-border">
      <div className="flex items-center gap-12 h-10">
        <Link href="/" className="flex items-center gap-2 pb-4 hover:opacity-80 transition-opacity">
          <Logo className="w-8 h-8 text-primary" />
          <span className="text-xl font-heading font-extrabold text-foreground tracking-tight lowercase">
            winnr
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 h-full">
          <Link
            href="/"
            className="text-xs font-sans font-bold text-foreground border-b-2 border-primary h-full flex items-center tracking-widest uppercase transition-all"
          >
            Markets
          </Link>
          <Link
            href="/vault"
            className="text-xs font-sans font-bold text-muted-foreground hover:text-foreground h-full flex items-center border-b-2 border-transparent tracking-widest uppercase transition-all"
          >
            Vault
          </Link>
          <Link
            href="/ranks"
            className="text-xs font-sans font-bold text-muted-foreground hover:text-foreground h-full flex items-center border-b-2 border-transparent tracking-widest uppercase transition-all"
          >
            Ranks
          </Link>
          <Link
            href="/feed"
            className="text-xs font-sans font-bold text-muted-foreground hover:text-foreground h-full flex items-center border-b-2 border-transparent tracking-widest uppercase transition-all"
          >
            Feed
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-6 pb-4">
        {/* Note: WalletConnectButton will be restyled globally via Button component */}
        <WalletConnectButton />
      </div>
    </nav>
  );
}
