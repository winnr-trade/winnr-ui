"use client";

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
import { useMainWallet } from "@/hooks/useMainWallet";
import { useWalletUIStore } from "@/store/useWalletUIStore";

export function WalletModal() {
  const { wallets, select, connected, connecting } = useMainWallet();
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
      <DialogContent className="sm:max-w-[440px] bg-surface-container/95 backdrop-blur-2xl border border-white/5 rounded-none shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        
        <DialogHeader className="p-8 pb-6 text-center relative overflow-hidden">
          {/* Subtle background light */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 size-40 bg-primary/5 rounded-full blur-3xl" />
          
          <DialogTitle className="text-2xl font-heading font-black text-center mb-2 text-white tracking-tighter relative z-10">
            CONNECT WALLET
          </DialogTitle>
          <DialogDescription className="text-center font-sans text-[10px] uppercase tracking-[0.25em] text-muted-foreground/80 relative z-10">
            Select an authorized provider to access your assets
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 p-6 pt-0 relative z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent mb-4" />
          
          {wallets.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 px-4 font-sans text-sm border border-dashed border-border/50 bg-white/[0.01]">
              No wallets detected. Please install a Solana wallet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {wallets.map((wallet) => (
                <Button
                  variant="wallet"
                  size="wallet"
                  key={wallet.adapter.name}
                  onClick={() => {
                    select(wallet.adapter.name);
                  }}
                  disabled={connecting}
                  className="h-16 px-4 flex items-center justify-start gap-5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/20 transition-all duration-300 relative overflow-hidden group rounded-none"
                >
                  <div className="size-10 rounded-none overflow-hidden relative flex-shrink-0 bg-black/40 border border-white/10 flex items-center justify-center p-2 group-hover:border-primary/30 transition-colors">
                    <Image
                      src={wallet.adapter.icon}
                      alt={`${wallet.adapter.name} icon`}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-bold text-base font-heading tracking-tight text-white/90 group-hover:text-white transition-colors">
                      {wallet.adapter.name}
                    </span>
                    <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                      {wallet.readyState === "Installed" ? "Browser Extension" : "Mobile / Web"}
                    </span>
                  </div>

                  {connecting && wallet.readyState === "Installed" && (
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-[10px] font-sans uppercase font-bold text-primary tracking-widest animate-pulse">Connecting</span>
                      <Loader2 className="size-4 animate-spin text-primary" />
                    </div>
                  )}
                  
                  {wallet.readyState === "Installed" && !connecting && (
                    <div className="ml-auto">
                      <div className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                    </div>
                  )}

                  {/* Hover effect highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.02] to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 pt-0">
          <p className="text-[10px] text-center text-muted-foreground font-sans uppercase tracking-[0.2em] leading-relaxed opacity-50 px-8">
            By connecting a wallet, you agree to the Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
