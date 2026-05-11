"use client";

import { Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/useAppStore";

export function PortfolioHeader() {
  const { isPrivateMode, togglePrivateMode } = useAppStore();

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
        <div 
          className="flex items-center gap-4 px-5 py-2.5 border border-violet-500/20 bg-violet-500/5 cursor-pointer group hover:bg-violet-500/10 transition-all"
          onClick={() => {
            const newState = !isPrivateMode;
            togglePrivateMode();
            toast.success(`Private Mode ${newState ? "Activated" : "Deactivated"}`);
          }}
        >
          <div className={`size-8 rounded-none border flex items-center justify-center transition-colors ${isPrivateMode ? "border-violet-500/60 bg-violet-500/20" : "border-violet-500/20 bg-violet-500/5"}`}>
            <Shield className={`size-5 transition-colors ${isPrivateMode ? "text-violet-400" : "text-violet-400/50"}`} />
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-sans font-bold uppercase tracking-[0.2em] transition-colors ${isPrivateMode ? "text-violet-300" : "text-violet-300/50"}`}>
              Private Mode
            </span>
          </div>
          <Switch 
            checked={isPrivateMode}
            className="ml-4 pointer-events-none data-checked:bg-violet-500 data-unchecked:bg-violet-950 border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.15)]" 
          />
        </div>
        <Button className="bg-white text-black hover:bg-white/90 rounded-none h-12 px-6 font-sans font-bold text-[11px] uppercase tracking-[0.2em]">
          Deposit Funds
        </Button>
      </div>
    </div>
  );
}
