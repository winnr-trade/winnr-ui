"use client";

import { Coins, Sparkles } from "lucide-react";
import { useGetBalance } from "@/api/wallet/getBalance";
import { useMintTestFunds } from "@/api/wallet/mintTestFunds";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { tokens } from "@/config/constants";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useWalletUIStore } from "@/store/useWalletUIStore";
import { formatBalance } from "@/utils";

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
    } catch (error) {
      // Error is handled by the mutation toast
    }
  };

  const formattedBalance = balance ? formatBalance(balance, tokens.usdc.decimals) : "0.00";

  return (
    <Modal
      isOpen={isFaucetModalOpen}
      onClose={closeFaucetModal}
      className="p-0 border-0 bg-transparent shadow-none max-w-sm"
    >
      <div className="relative overflow-hidden bg-surface-container border border-border p-8 rounded-none">
        {/* Decorative background elements */}
        <div className="absolute -top-12 -right-12 size-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 size-48 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 p-4 bg-surface-container-highest border border-border relative">
            <Coins className="size-10 text-primary animate-pulse" />
            <Sparkles className="size-4 text-emerald-500 absolute -top-1 -right-1" />
          </div>

          <h2 className="text-2xl font-heading font-bold text-white mb-2 tracking-tight">
            Need Test USDC?
          </h2>

          <p className="text-sm font-sans text-muted-foreground mb-8 leading-relaxed">
            Your current balance is{" "}
            <span className="text-white font-bold">{formattedBalance} USDC</span>. Get some test
            funds to start predicting on the Winnr platform.
          </p>

          <div className="w-full flex flex-col gap-3">
            <Button
              onClick={handleMint}
              disabled={mintTestFunds.isPending || !connected}
              className="w-full h-12 font-bold tracking-widest uppercase rounded-none border-border shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              {mintTestFunds.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  MINTING...
                </span>
              ) : (
                "CLAIM 10,000 TEST USDC"
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={closeFaucetModal}
              className="w-full h-12 font-bold tracking-widest uppercase rounded-none text-muted-foreground hover:text-white hover:bg-white/5"
            >
              LATER
            </Button>
          </div>

          {!connected && (
            <p className="mt-4 text-[10px] font-sans text-destructive uppercase tracking-widest font-bold">
              Connect your wallet to claim
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
