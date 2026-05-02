"use client";

import { Button } from "@/components/ui/button";

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
      <div className="flex items-center gap-4">
        <Button className="bg-white text-black hover:bg-white/90 rounded-none h-12 px-6 font-sans font-bold text-[11px] uppercase tracking-[0.2em]">
          Deposit Funds
        </Button>
      </div>
    </div>
  );
}
