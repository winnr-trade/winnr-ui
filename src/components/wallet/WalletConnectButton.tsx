"use client";

import { ChevronDown, Coins, Copy, LogOut, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetBalance } from "@/api/wallet/getBalance";
import { useMintTestFunds } from "@/api/wallet/mintTestFunds";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { tokens } from "@/config/constants";
import { useAgentWallet } from "@/hooks/useAgentWallet";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useWalletUIStore } from "@/store/useWalletUIStore";
import { formatBalance, truncateAddress } from "@/utils";

export function WalletConnectButton() {
  const { address, connected, publicKey, disconnect } = useMainWallet();
  const { openModal } = useWalletUIStore();
  const { data: balance } = useGetBalance({ address: address ?? undefined });
  const { isActive: isAgentActive, enableTrading, isRegistering } = useAgentWallet();
  const mintTestFunds = useMintTestFunds();
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

  const handleMintTestUSDC = () => {
    if (!address) return;
    mintTestFunds.mutate(address);
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
              <div className="h-full px-4 flex items-center bg-surface-container-low border border-border/50 text-white font-mono text-xs font-bold gap-4 hover:bg-surface-container-high hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="relative">
                    <div className="size-2 rounded-full bg-emerald-500 animate-breathe shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  </div>
                  <span className="tracking-tight">{truncatedKey}</span>
                </div>

                <div className="w-[1px] h-3 bg-border/50" />

                <div className="flex items-center gap-2 relative z-10">
                  <span className="text-white tabular-nums">{formattedBalance}</span>
                  <span className="text-muted-foreground text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
                    USDC
                  </span>
                </div>

                <ChevronDown className="size-3.5 text-muted-foreground group-hover:text-white group-hover:translate-y-0.5 transition-all" />
              </div>
            </div>
          }
        />
        <DropdownMenuContent
          align="end"
          className="w-72 bg-surface-container/90 backdrop-blur-xl border-border/50 rounded-none p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="px-4 py-4 border-b border-border/30 mb-1 bg-white/[0.02]">
            {!isAgentActive ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-[0.3em]">
                    SESSION INACTIVE
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/50">{truncatedKey}</span>
                    <IconButton
                      icon={Copy}
                      size="xs"
                      variant="ghost"
                      className="text-muted-foreground hover:text-white"
                      onClick={copyAddress}
                    />
                  </div>
                </div>
                <Button
                  onClick={enableTrading}
                  disabled={isRegistering}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-bold text-[10px] tracking-[0.2em] uppercase rounded-none border-0 shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98]"
                >
                  {isRegistering ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ENABLING...
                    </span>
                  ) : (
                    "ENABLE TRADING"
                  )}
                </Button>
                <p className="text-[9px] text-muted-foreground text-center font-medium opacity-60">
                  Required for session-based trading
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-sans font-bold text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  SESSION ACTIVE
                </span>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-white/90">{truncatedKey}</span>
                    <span className="text-[10px] text-muted-foreground font-sans mt-0.5 opacity-80">
                      Devnet
                    </span>
                  </div>
                  <IconButton
                    icon={Copy}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-white hover:bg-white/5"
                    onClick={copyAddress}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-1 space-y-0.5">

            <DropdownMenuItem
              className="flex items-center gap-4 px-3 py-3 text-[11px] font-sans font-bold uppercase tracking-[0.15em] cursor-pointer hover:bg-primary/10 focus:bg-primary/10 text-white transition-all rounded-none outline-none group"
              onClick={() => handleMintTestUSDC()}
              disabled={mintTestFunds.isPending}
            >
              <div className="size-8 rounded-none border border-primary/20 flex items-center justify-center bg-primary/5 group-hover:bg-primary/20 transition-colors">
                <Coins
                  className={`size-4 ${mintTestFunds.isPending ? "animate-pulse" : "text-primary"}`}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="group-hover:text-primary transition-colors">
                  {mintTestFunds.isPending ? "Minting..." : "Faucet"}
                </span>
                <span className="text-[9px] text-muted-foreground normal-case tracking-normal font-medium opacity-70">
                  Claim testnet USDC
                </span>
              </div>
            </DropdownMenuItem>

            <div className="h-px bg-border/30 my-1 mx-2" />

            <DropdownMenuItem
              className="flex items-center gap-4 px-3 py-3 text-[11px] font-sans font-bold uppercase tracking-[0.15em] cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10 text-destructive transition-all rounded-none outline-none group"
              onClick={() => disconnect()}
            >
              <div className="size-8 rounded-none border border-destructive/20 flex items-center justify-center bg-destructive/5 group-hover:bg-destructive/20 transition-colors">
                <LogOut className="size-4" />
              </div>
              Disconnect Wallet
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={openModal}
      className="relative h-10 px-6 font-sans font-bold text-[10px] tracking-[0.2em] uppercase rounded-none border border-primary/20 bg-surface-container-low text-white overflow-hidden group transition-all duration-300 hover:border-primary hover:bg-surface-container-high shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <span className="relative z-10 flex items-center gap-2.5">
        <Wallet className="size-3.5 text-primary group-hover:scale-110 transition-transform duration-300" />
        CONNECT WALLET
      </span>
    </Button>
  );
}
