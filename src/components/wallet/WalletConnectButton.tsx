"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { LogOut, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetBalance } from "@/api/wallet/useGetBalance";
import { Button } from "@/components/ui/button";
import { tokens } from "@/config/constants";
import { useUserWallet } from "@/hooks/useUserWallet";
import { useWalletUIStore } from "@/store/useWalletUIStore";
import { formatBalance, truncateAddress } from "@/utils";

export function WalletConnectButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { openModal } = useWalletUIStore();
  const { address } = useUserWallet();
  const { data: balance } = useGetBalance(address);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by doing a skeleton-like render initially
  if (!mounted) {
    return (
      <Button
        disabled
        className="font-bold tracking-wide w-48 opacity-50 relative overflow-hidden group"
      >
        <span className="invisible">Loading...</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
      </Button>
    );
  }

  if (connected && publicKey) {
    const keyString = publicKey.toBase58();
    const truncatedKey = truncateAddress(keyString);
    const formattedBalance = balance ? formatBalance(balance, tokens.usdc.decimals) : "0.00";

    return (
      <div className="flex items-center gap-2 h-10">
        <div className="h-full px-4 flex items-center bg-surface-container-high rounded-md border border-primary text-primary font-mono text-sm font-bold shadow-[0_0_10px_rgba(159,251,6,0.1)] gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary animate-pulse"></div>
            {truncatedKey}
          </div>
          <div className="w-[1px] h-4 bg-primary/30" />
          <div className="text-foreground">
            {formattedBalance} <span className="text-primary text-xs">USDC</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-full border-surface-container-highest hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors shrink-0"
          onClick={() => disconnect()}
          title="Disconnect Wallet"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={openModal}
      className="font-bold tracking-wide shadow-[0_0_15px_rgba(159,251,6,0.2)] hover:shadow-[0_0_20px_rgba(159,251,6,0.4)] flex items-center gap-2 h-10"
    >
      <Wallet className="size-4" />
      CONNECT WALLET
    </Button>
  );
}
