"use client";

import Image from "next/image";
import type { Resolver } from "@/lib/rollup/types";

interface RulesAndResolutionProps {
  resolver: Resolver;
  resolutionTime: number;
}

export function RulesAndResolution({ resolver, resolutionTime }: RulesAndResolutionProps) {
  const resolutionDateStr = new Date(resolutionTime).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  });

  const renderContent = () => {
    if ("Address" in resolver) {
      return (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground font-sans">
            This market will be resolved manually by the following trusted address:
            <span className="block mt-1 font-mono text-xs text-white break-all">
              {resolver.Address}
            </span>
          </div>
        </div>
      );
    }

    if ("Pyth" in resolver) {
      const { feed_id, lower_bound, upper_bound } = resolver.Pyth;
      
      let condition = "";
      if (lower_bound !== undefined && upper_bound !== undefined) {
        condition = `between $${(lower_bound / 100).toLocaleString()} and $${(upper_bound / 100).toLocaleString()}`;
      } else if (lower_bound !== undefined) {
        condition = `above $${(lower_bound / 100).toLocaleString()}`;
      } else if (upper_bound !== undefined) {
        condition = `below $${(upper_bound / 100).toLocaleString()}`;
      }

      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 p-2 rounded-none border border-white/10">
              <Image src="/pyth-logo.png" alt="Pyth Logo" width={24} height={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-widest">Resolution source</span>
              <span className="text-xs text-white font-bold font-sans uppercase tracking-widest">Pyth Network Oracle</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-sans leading-relaxed">
            This market will resolve to "Yes" if the price {condition} according to Pyth Network data at {resolutionDateStr}.
          </div>
        </div>
      );
    }

    if ("Optimistic" in resolver) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 p-2 rounded-none border border-white/10">
              <Image src="/oracle.png" alt="Winnr Oracle Logo" width={24} height={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-widest">Resolution source</span>
              <span className="text-xs text-white font-bold font-sans uppercase tracking-widest">Winnr Optimistic Oracle</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-sans leading-relaxed">
            This market is resolved by the Winnr Native Optimistic Oracle. Anyone can propose an outcome, which will be finalized if not disputed within the challenge period.
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="border border-border bg-surface-container-low p-6 flex flex-col gap-4 mt-2">
      <div className="text-[10px] uppercase font-sans font-bold text-muted-foreground tracking-widest">
        RULES & RESOLUTION
      </div>
      {renderContent()}
    </div>
  );
}
