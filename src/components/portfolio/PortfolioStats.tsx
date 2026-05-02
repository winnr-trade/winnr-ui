"use client";

import { ArrowRight, Plus } from "lucide-react";
import { usePortfolioData } from "@/api/portfolio";

export function PortfolioStats() {
  const { data: portfolio } = usePortfolioData();

  if (!portfolio) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border mb-12">
      <div className="p-8 border-b md:border-b-0 md:border-r border-border bg-surface-container-low flex flex-col gap-3">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Total Portfolio Value
        </span>
        <span className="text-4xl font-heading font-bold text-white tracking-tight">
          {portfolio.stats.totalValue}
        </span>
      </div>
      <div className="p-8 border-b md:border-b-0 md:border-r border-border bg-surface-container-low flex flex-col gap-3 justify-center">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Unrealized P&L
        </span>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-heading font-bold text-emerald-500 tracking-tight">
            {portfolio.stats.unrealizedPnl}
          </span>
          <span className="text-[10px] font-sans font-bold text-emerald-500 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 flex items-center gap-1 rounded-none">
            <ArrowRight className="w-3 h-3 -rotate-45" /> {portfolio.stats.unrealizedPnlPercent}
          </span>
        </div>
      </div>
      <div className="p-8 bg-surface-container-low flex flex-col gap-3 justify-center relative group cursor-pointer hover:bg-surface-container transition-colors">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Available Balance
        </span>
        <span className="text-3xl font-heading font-bold text-white tracking-tight">
          {portfolio.stats.availableBalance}
        </span>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-white group-hover:text-white transition-colors">
          <Plus className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
