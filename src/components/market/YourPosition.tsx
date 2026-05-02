"use client";

import { useMarketDetail } from "@/api/market";
import { useGetShares } from "@/api/market/getShares";
import { Card } from "@/components/ui/card";
import { useMainWallet } from "@/hooks/useMainWallet";
import { formatNumber, formatUsd } from "@/utils";
import { deriveMarketState } from "@/utils/market";

interface YourPositionProps {
  marketId: number;
}

export function YourPosition({ marketId }: YourPositionProps) {
  const { address } = useMainWallet();
  const { data: market } = useMarketDetail({ id: marketId });
  const { data: shares } = useGetShares({
    marketId,
    address,
  });

  if (!address || !shares) {
    return null;
  }

  const { buyYesPrice: yesPrice, buyNoPrice: noPrice } = deriveMarketState(market);

  const yesValue = BigInt(shares.yes) * yesPrice;
  const noValue = BigInt(shares.no) * noPrice;
  const hasPosition = shares.yes > 0 || shares.no > 0;
  const totalValue = yesValue + noValue;

  return (
    <Card className="bg-surface-container-low border border-border rounded-none shadow-none p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
          YOUR POSITION
        </span>
        {hasPosition && (
          <span className="text-[10px] font-sans text-muted-foreground tracking-widest">
            Value: {formatUsd(totalValue)}
          </span>
        )}
      </div>

      {!hasPosition ? (
        <div className="py-2 flex justify-center">
          <span className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest">
            No active position
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {shares.yes > 0 && (
            <div className="flex flex-col gap-1 border-l-2 border-emerald-500 pl-4">
              <span className="text-[10px] font-sans font-bold text-emerald-500 uppercase tracking-widest">
                YES SHARES
              </span>
              <span className="text-xl font-heading font-bold text-white">
                {formatNumber(shares.yes, 0, 0)}
              </span>
              <span className="text-[10px] font-sans text-muted-foreground tracking-widest">
                ${formatUsd(yesValue)}
              </span>
            </div>
          )}

          {shares.no > 0 && (
            <div className="flex flex-col gap-1 border-l-2 border-destructive pl-4">
              <span className="text-[10px] font-sans font-bold text-destructive uppercase tracking-widest">
                NO SHARES
              </span>
              <span className="text-xl font-heading font-bold text-white">
                {formatNumber(shares.no, 0, 0)}
              </span>
              <span className="text-[10px] font-sans text-muted-foreground tracking-widest">
                ${formatUsd(noValue)}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
