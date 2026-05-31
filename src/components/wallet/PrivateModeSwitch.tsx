"use client";

import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";

export function PrivateModeSwitch() {
  const { isEnabled, isEnabling, enable, disable } = useShieldedWallet();

  const handleToggle = (checked: boolean) => {
    if (checked) {
      enable();
    } else {
      disable();
    }
  };

  return (
    <div className="px-3 py-3 flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="size-8 rounded-none border border-violet-500/20 flex items-center justify-center bg-violet-500/5">
          <Shield className={`size-5 ${isEnabling ? "animate-pulse" : ""} text-violet-400`} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-violet-300">
            Private Mode
          </span>
          <span className="text-[10px] text-muted-foreground normal-case tracking-normal font-medium opacity-70">
            {isEnabling ? "Activating..." : isEnabled ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isEnabling}
        className="data-unchecked:bg-violet-950 border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
      />
    </div>
  );
}
