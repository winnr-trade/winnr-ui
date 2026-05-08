"use client";

import { Coins, Sparkles } from "lucide-react";
import { useGetBalance } from "@/api/wallet/getBalance";
import { useMintTestFunds } from "@/api/wallet/mintTestFunds";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { tokens } from "@/config/constants";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useWalletUIStore } from "@/store/useWalletUIStore";
import { formatBalance, parseUsd } from "@/utils";

export function FaucetModal() {
  const { address, connected } = useMainWallet();
  const { isFaucetModalOpen, closeFaucetModal } = useWalletUIStore();
  const { data: balance } = useGetBalance({ address: address ?? undefined });
  const mintTestFunds = useMintTestFunds();

  const handleMint = async () => {
    if (!address) return;
    try {
      await mintTestFunds.mutateAsync(address);
      closeFaucetModal();
    } catch (_error) {
      // Error is handled by the mutation toast
    }
  };

  const formattedBalance = balance ? formatBalance(balance, tokens.usdc.decimals) : "0.00";
  const isBalanceTooHigh = balance !== undefined && balance >= parseUsd(500);

  return (
    <Modal
      isOpen={isFaucetModalOpen}
      onClose={closeFaucetModal}
      className="p-0 border-0 bg-transparent shadow-none max-w-sm overflow-hidden"
    >
      <div className="relative bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/5 p-12 rounded-none shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top edge neon highlight */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-10 relative">
            <div className="size-24 bg-white/[0.02] border border-white/10 flex items-center justify-center relative overflow-hidden group">
              <Coins className="size-12 text-primary" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
            </div>
            <div className="absolute -top-3 -right-3 size-8 bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Sparkles className="size-5 text-emerald-500" />
            </div>
          </div>

          <h2 className="text-2xl font-heading font-black text-white mb-2 tracking-tighter uppercase leading-tight">
            Claim Test Funds
          </h2>

          <div className="flex flex-col gap-1 mb-10">
            <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-60">
              Claim test USDC for trading.
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                Current Balance: <span className="text-white/60">{formattedBalance} USDC</span>
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <Button
              onClick={handleMint}
              disabled={mintTestFunds.isPending || !connected || isBalanceTooHigh}
              className="relative w-full h-14 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:grayscale text-black font-sans font-bold text-[10px] tracking-[0.2em] uppercase rounded-none border-0 overflow-hidden group transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(var(--primary-rgb),0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                {mintTestFunds.isPending ? (
                  <>
                    <div className="size-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    MINTING...
                  </>
                ) : (
                  <>
                    <Coins className="size-3.5" />
                    CLAIM 5,000 USDC
                  </>
                )}
              </span>
            </Button>

            <Button
              variant="ghost"
              onClick={closeFaucetModal}
              className="w-full h-10 font-sans font-bold text-[9px] tracking-[0.2em] uppercase rounded-none text-muted-foreground hover:text-white transition-colors"
            >
              SKIP FOR NOW
            </Button>
          </div>

          {!connected && (
            <p className="mt-8 text-[10px] font-sans text-destructive uppercase tracking-widest font-black opacity-70">
              Connect Wallet to Proceed
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
