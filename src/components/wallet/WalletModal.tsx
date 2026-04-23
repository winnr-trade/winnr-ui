"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWalletUIStore } from "@/store/useWalletUIStore";

export function WalletModal() {
  const { wallets, select, connected, connecting } = useWallet();
  const { isModalOpen, closeModal } = useWalletUIStore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Auto close modal when connected
  useEffect(() => {
    if (connected) {
      closeModal();
    }
  }, [connected, closeModal]);

  if (!hasMounted) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px] bg-surface-container border border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-center mb-1 text-white">
            CONNECT WALLET
          </DialogTitle>
          <DialogDescription className="text-center font-sans text-xs uppercase tracking-widest text-muted-foreground pb-4 border-b border-border">
            Select a provider from the list below
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          {wallets.length === 0 ? (
            <div className="text-center text-muted-foreground p-4 font-sans text-sm">
              No wallets found.
            </div>
          ) : (
            wallets.map((wallet) => (
              <Button
                variant="wallet"
                size="wallet"
                key={wallet.adapter.name}
                onClick={() => {
                  select(wallet.adapter.name);
                }}
                disabled={connecting}
              >
                <div className="size-8 rounded-none overflow-hidden relative flex-shrink-0 bg-background flex items-center justify-center p-1">
                  <Image
                    src={wallet.adapter.icon}
                    alt={`${wallet.adapter.name} icon`}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-lg font-heading tracking-wide text-foreground group-hover:text-white transition-colors">
                  {wallet.adapter.name}
                </span>
                {connecting && wallet.readyState === "Installed" && (
                  <Loader2 className="ml-auto size-5 animate-spin text-white" />
                )}
                {wallet.readyState === "Installed" && !connecting && (
                  <span className="ml-auto text-[10px] font-sans uppercase font-bold text-white tracking-widest bg-transparent border border-border px-2 py-1 rounded-none">
                    Detected
                  </span>
                )}
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
