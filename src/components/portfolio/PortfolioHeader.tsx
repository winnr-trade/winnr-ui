"use client";

import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function PortfolioHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-heading font-extrabold tracking-tight text-white">
          Portfolio
        </h1>
        <p className="text-sm font-sans text-muted-foreground">
          Manage your active positions and account balance.
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 px-5 py-2.5 border border-violet-500/20 bg-violet-500/5 opacity-80 cursor-not-allowed group">
          <div className="size-8 rounded-none border border-violet-500/20 flex items-center justify-center bg-violet-500/5 group-hover:bg-violet-500/10 transition-colors">
            <Shield className="size-5 text-violet-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-sans font-bold text-violet-300 uppercase tracking-[0.2em]">
              Private Mode
            </span>
            <span className="text-[10px] text-muted-foreground font-sans font-medium">
              Coming Soon
            </span>
          </div>
          <Switch
            disabled
            className="ml-4 data-unchecked:bg-violet-950 border-violet-500/50 data-disabled:opacity-100 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
          />
        </div>
        <Button className="bg-white text-black hover:bg-white/90 rounded-none h-12 px-6 font-sans font-bold text-[11px] uppercase tracking-[0.2em]">
          Deposit Funds
        </Button>
      </div>
    </div>
  );
}
