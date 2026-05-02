"use client";

import dayjs from "dayjs";
import Image from "next/image";
import { useMarketDetail } from "@/api/market";
import type { AddressResolverConfig, PythResolverConfig } from "@/types";

interface RulesAndResolutionProps {
  marketId: number;
}

export function RulesAndResolution({ marketId }: RulesAndResolutionProps) {
  const { data: market } = useMarketDetail({ id: marketId });

  if (!market) return null;

  const { resolver, resolutionTime } = market;
  const resolutionDateStr = dayjs(resolutionTime).format("MMMM D, YYYY [at] h:mm:ss A Z");

  const renderContent = () => {
    if (resolver.type === "address") {
      const config = resolver.config as AddressResolverConfig;
      return (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground font-sans">
            This market will be resolved manually by the following trusted address:
            <span className="block mt-1 font-mono text-xs text-white break-all">
              {config.address}
            </span>
          </div>
        </div>
      );
    }

    if (resolver.type === "pyth") {
      const config = resolver.config as PythResolverConfig;
      const { lowerBound, upperBound } = config;

      let condition = "";
      if (lowerBound !== undefined && upperBound !== undefined) {
        condition = `between $${(Number(lowerBound) / 100).toLocaleString()} and $${(Number(upperBound) / 100).toLocaleString()}`;
      } else if (lowerBound !== undefined) {
        condition = `above $${(Number(lowerBound) / 100).toLocaleString()}`;
      } else if (upperBound !== undefined) {
        condition = `below $${(Number(upperBound) / 100).toLocaleString()}`;
      }

      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 p-2 rounded-none border border-white/10">
              <Image src="/pyth-logo.png" alt="Pyth Logo" width={24} height={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-widest">
                Resolution source
              </span>
              <span className="text-xs text-white font-bold font-sans uppercase tracking-widest">
                Pyth Network Oracle
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-sans leading-relaxed">
            This market will resolve to "Yes" if the price {condition} according to Pyth Network
            data at {resolutionDateStr}.
          </div>
        </div>
      );
    }

    if (resolver.type === "optimistic") {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/5 p-2 rounded-none border border-white/10">
              <Image src="/oracle.png" alt="Winnr Oracle Logo" width={24} height={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-widest">
                Resolution source
              </span>
              <span className="text-xs text-white font-bold font-sans uppercase tracking-widest">
                Winnr Optimistic Oracle
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-sans leading-relaxed">
            This market is resolved by the Winnr Native Optimistic Oracle. Anyone can propose an
            outcome, which will be finalized if not disputed within the challenge period.
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
