"use client";

import { ChevronDown, Copy, LogOut, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetBalance } from "@/api/wallet/getBalance";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tokens } from "@/config/constants";
import { useAgentWallet } from "@/hooks/useAgentWallet";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useWalletUIStore } from "@/store/useWalletUIStore";
import { formatBalance, truncateAddress } from "@/utils";

export function WalletConnectButton() {
  const { address, connected, publicKey, disconnect } = useMainWallet();
  const { openModal } = useWalletUIStore();
  const { data: balance } = useGetBalance({ address });
  const { isActive: isAgentActive, enableTrading, isRegistering } = useAgentWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      toast.success("Address copied to clipboard");
    }
  };

  // Prevent hydration mismatch by doing a skeleton-like render initially
  if (!mounted) {
    return (
      <Button
        disabled
        className="font-bold tracking-wide w-48 opacity-50 relative overflow-hidden group border-border rounded-none"
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
      <DropdownMenu>
        <DropdownMenuTrigger
          nativeButton={false}
          render={
            <div className="flex items-center h-10 cursor-pointer group">
              <div className="h-full px-4 flex items-center bg-surface-container rounded-none border border-border text-white font-mono text-sm font-bold shadow-none gap-3 group-hover:bg-surface-container-highest transition-colors">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-none bg-emerald-500 animate-pulse"></div>
                  {truncatedKey}
                </div>
                <div className="w-[1px] h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-white">{formattedBalance}</span>
                  <span className="text-muted-foreground text-[10px] font-sans font-bold uppercase tracking-widest">
                    USDC
                  </span>
                </div>
                <ChevronDown className="size-4 text-muted-foreground group-hover:text-white transition-colors" />
              </div>
            </div>
          }
        />
        <DropdownMenuContent
          align="end"
          className="w-64 bg-surface-container-low border-border rounded-none p-1 shadow-2xl animate-in fade-in slide-in-from-top-1"
        >
          <div className="px-3 py-2 border-b border-border mb-1">
            <span className="text-[9px] font-sans font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Connected Wallet
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-mono text-white">{truncatedKey}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-white"
                onClick={copyAddress}
              >
                <Copy className="size-3" />
              </Button>
            </div>
          </div>

          {!isAgentActive && (
            <>
              <DropdownMenuItem
                className="flex items-center gap-3 px-3 py-3 text-[10px] font-sans font-bold uppercase tracking-widest cursor-pointer hover:bg-surface-container focus:bg-surface-container text-white transition-colors rounded-none outline-none"
                onClick={enableTrading}
                disabled={isRegistering}
              >
                <ShieldCheck
                  className={`size-4 ${isRegistering ? "animate-pulse" : "text-emerald-500"}`}
                />
                <div className="flex flex-col gap-0.5">
                  <span>{isRegistering ? "Enabling Trading..." : "Enable Trading"}</span>
                  {!isRegistering && (
                    <span className="text-[8px] text-muted-foreground normal-case tracking-normal font-normal">
                      Authorizes session-based trading
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
            </>
          )}

          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-3 text-[10px] font-sans font-bold uppercase tracking-widest cursor-pointer hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white transition-colors rounded-none outline-none group"
            onClick={() => disconnect()}
          >
            <LogOut className="size-4 text-muted-foreground group-hover:text-white" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={openModal}
      className="font-bold tracking-wide shadow-none hover:shadow-none flex items-center gap-2 h-10 border-border rounded-none"
    >
      <Wallet className="size-4" />
      CONNECT WALLET
    </Button>
  );
}
