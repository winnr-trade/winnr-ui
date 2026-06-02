"use client";

import { Button } from "@/components/ui/button";
import { PrivateModeSwitch } from "@/components/wallet/PrivateModeSwitch";

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
        <div className="border border-violet-500/20 bg-violet-500/5">
          <PrivateModeSwitch />
        </div>
        <Button
          disabled
          className="bg-white/50 text-black/50 cursor-not-allowed rounded-none h-12 px-6 font-sans font-bold text-[11px] uppercase tracking-[0.2em]"
        >
          Deposit Funds
        </Button>
      </div>
    </div>
  );
}
