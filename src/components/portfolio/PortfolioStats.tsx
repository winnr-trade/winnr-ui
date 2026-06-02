"use client";

import { ArrowRight, Plus, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useGetShieldedNote } from "@/api/notes";
import { useActivePositions } from "@/api/portfolio";
import { useGetBalance } from "@/api/wallet/getBalance";
import { Modal } from "@/components/ui/modal";
import { useMainWallet } from "@/hooks/useMainWallet";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import { formatCurrency, formatNumber, getPortfolioSummary } from "@/utils";
import { ShieldedDepositForm } from "./ShieldedDepositForm";

export function PortfolioStats() {
  const { address } = useMainWallet();
  const { wallet: shieldedWallet } = useShieldedWallet();
  const { data: balanceData, isLoading: isBalanceLoading } = useGetBalance({ address });
  const { data: positions, isLoading: isPortfolioLoading } = useActivePositions();
  const { data: shieldedNote, isLoading: isShieldedNoteLoading } = useGetShieldedNote({
    mainAddress: address ?? undefined,
    shieldedWallet,
  });

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const shieldedBalance = useMemo(() => {
    if (!shieldedWallet) return 0n;
    return shieldedNote ? shieldedNote.amount : 0n;
  }, [shieldedWallet, shieldedNote]);

  const stats = useMemo(() => {
    if (!positions || balanceData === undefined) return null;

    const summary = getPortfolioSummary(balanceData, positions);
    const absPnl = summary.totalPnl < BigInt(0) ? -summary.totalPnl : summary.totalPnl;

    return {
      totalValue: formatCurrency(summary.totalValue),
      unrealizedPnl: `${summary.pnlPositive ? "+" : "-"}${formatCurrency(absPnl)}`,
      unrealizedPnlPercent: `${summary.pnlPercent >= 0 ? "+" : "-"}${formatNumber(Math.abs(summary.pnlPercent), 1, 1)}%`,
      availableBalance: formatCurrency(summary.availableBalance),
      shieldedBalance: formatCurrency(shieldedBalance),
      pnlPositive: summary.pnlPositive,
    };
  }, [positions, balanceData, shieldedBalance]);

  const isLoading =
    isBalanceLoading || isPortfolioLoading || (!!shieldedWallet && isShieldedNoteLoading);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border mb-12 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-8 border-b md:border-b-0 md:border-r last:border-r-0 border-border bg-surface-container-low h-32"
          ></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border mb-12">
        <div className="p-8 border-b md:border-b-0 md:border-r border-border bg-surface-container-low flex flex-col gap-3">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Total Portfolio Value
          </span>
          <span className="text-4xl font-heading font-bold text-white tracking-tight">
            {stats.totalValue}
          </span>
        </div>
        <div className="p-8 border-b md:border-b-0 md:border-r border-border bg-surface-container-low flex flex-col gap-3 justify-center">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Unrealized P&L
          </span>
          <div className="flex items-center gap-4">
            <span
              className={`text-3xl font-heading font-bold tracking-tight ${stats.pnlPositive ? "text-emerald-500" : "text-destructive"}`}
            >
              {stats.unrealizedPnl}
            </span>
            <span
              className={`text-[10px] font-sans font-bold border px-2 py-1 flex items-center gap-1 rounded-none ${
                stats.pnlPositive
                  ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
                  : "text-destructive border-destructive/20 bg-destructive/10"
              }`}
            >
              <ArrowRight className={`w-3 h-3 ${stats.pnlPositive ? "-rotate-45" : "rotate-45"}`} />{" "}
              {stats.unrealizedPnlPercent}
            </span>
          </div>
        </div>
        <div className="p-8 border-b md:border-b-0 md:border-r border-border bg-surface-container-low flex flex-col gap-3 justify-center relative group cursor-pointer hover:bg-surface-container transition-colors">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Available Balance
          </span>
          <span className="text-3xl font-heading font-bold text-white tracking-tight">
            {stats.availableBalance}
          </span>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-white group-hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </div>
        </div>
        {/* biome-ignore lint/a11y/useSemanticElements: interactive div behaves as a portfolio stat card */}
        <div
          role="button"
          tabIndex={0}
          className="p-8 bg-surface-container-low flex flex-col gap-3 justify-center relative group cursor-pointer hover:bg-surface-container transition-colors"
          onClick={() => {
            if (!shieldedWallet) {
              toast.error("Please enable Private Mode first");
              return;
            }
            setIsDepositModalOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!shieldedWallet) {
                toast.error("Please enable Private Mode first");
                return;
              }
              setIsDepositModalOpen(true);
            }
          }}
        >
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-violet-400 flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-violet-400" />
            Shielded Balance
          </span>
          <span className="text-3xl font-heading font-bold text-white tracking-tight">
            {stats.shieldedBalance}
          </span>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-violet-400 group-hover:text-violet-400 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        className="p-0 border-0 bg-transparent shadow-none max-w-lg w-full overflow-hidden"
      >
        <ShieldedDepositForm onClose={() => setIsDepositModalOpen(false)} />
      </Modal>
    </>
  );
}
