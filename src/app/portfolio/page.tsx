"use client";

import { Download, Plus, ArrowRightLeft, Wallet, ArrowRight } from "lucide-react";
import { usePortfolioData } from "@/api/portfolio";
import { Button } from "@/components/ui/button";

export default function PortfolioPage() {
  const { data: portfolio, isLoading, error } = usePortfolioData();

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center h-64 text-muted-foreground font-sans text-xs tracking-widest uppercase animate-pulse">
        Loading Portfolio...
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500 font-sans">
        Failed to load portfolio data.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-12 max-w-6xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-heading font-extrabold tracking-tight text-white">Portfolio</h1>
          <p className="text-sm font-sans text-muted-foreground">Manage your active positions and account balance.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button className="bg-white text-black hover:bg-white/90 rounded-none h-12 px-6 font-sans font-bold text-[11px] uppercase tracking-[0.2em]">
            Deposit Funds
          </Button>
        </div>
      </div>

      {/* Top Summary Cards */}
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

      {/* Active Positions */}
      <div className="flex flex-col mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-heading font-bold text-white">Active Positions</h2>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border px-3 py-1 bg-surface-container-low rounded-none">
            {portfolio.activePositions.length} Markets
          </span>
        </div>

        <div className="border border-border bg-surface-container-low">
          {/* Table Header */}
          <div className="grid grid-cols-6 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground p-4 border-b border-border">
            <div className="col-span-2">Market</div>
            <div className="col-span-1 text-center">Position Size</div>
            <div className="col-span-1 text-center">Avg Price</div>
            <div className="col-span-1 text-center">Current Price</div>
            <div className="col-span-1 text-right">Unrealized P&L</div>
          </div>
          
          {/* Table Rows */}
          <div className="flex flex-col">
            {portfolio.activePositions.map((pos, idx) => (
              <div 
                key={pos.id} 
                className={`grid grid-cols-6 items-center p-4 hover:bg-surface-container transition-colors cursor-pointer ${idx !== portfolio.activePositions.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="col-span-2 flex flex-col gap-1 pr-4">
                  <span className="text-sm font-sans font-bold text-white leading-tight">{pos.market}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-none ${pos.outcome.startsWith('YES') ? 'bg-emerald-500' : 'bg-destructive'}`} />
                    <span className={`text-[10px] font-sans font-bold uppercase tracking-widest ${pos.outcome.startsWith('YES') ? 'text-emerald-500' : 'text-destructive'}`}>
                      {pos.outcome}
                    </span>
                  </div>
                </div>
                <div className="col-span-1 text-center text-sm font-sans text-white">
                  {pos.positionSize}
                </div>
                <div className="col-span-1 text-center text-sm font-sans font-bold text-white">
                  {pos.avgPrice}
                </div>
                <div className="col-span-1 text-center text-sm font-sans font-bold text-white">
                  {pos.currentPrice}
                </div>
                <div className={`col-span-1 text-right text-sm font-sans font-bold ${pos.pnlPositive ? 'text-emerald-500' : 'text-destructive'}`}>
                  {pos.unrealizedPnl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-heading font-bold text-white">Recent Activity</h2>
          <Button variant="link" className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-white p-0 h-auto flex items-center gap-2">
            View All <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        <div className="border border-border bg-surface-container-low flex flex-col">
          {portfolio.recentActivity.map((activity, idx) => (
            <div 
              key={activity.id} 
              className={`flex justify-between items-center p-6 hover:bg-surface-container transition-colors cursor-pointer ${idx !== portfolio.recentActivity.length - 1 ? 'border-b border-border/50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-border bg-surface-container flex items-center justify-center text-muted-foreground rounded-none">
                  {activity.icon === 'plus' && <Plus className="w-4 h-4" />}
                  {activity.icon === 'arrow-right-left' && <ArrowRightLeft className="w-4 h-4" />}
                  {activity.icon === 'wallet' && <Wallet className="w-4 h-4" />}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-sans font-bold text-white">{activity.action}</span>
                  <span className="text-xs font-sans text-muted-foreground">{activity.subtext}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-sm font-sans font-bold ${activity.amountPositive ? 'text-emerald-500' : 'text-white'}`}>
                  {activity.amount}
                </span>
                <span className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest">{activity.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
