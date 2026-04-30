"use client";

import { useGetShares } from "@/api/market/getShares";
import { Card } from "@/components/ui/card";
import { useMainWallet } from "@/hooks/useMainWallet";
import { formatNumber } from "@/utils";

interface YourPositionProps {
  marketId: number;
  yesPrice: number; // in cents
  noPrice: number; // in cents
}

export function YourPosition({ marketId, yesPrice, noPrice }: YourPositionProps) {
  const { address } = useMainWallet();
  const { data: shares, isLoading } = useGetShares({ marketId, address });

  if (!address) {
    return null;
  }

  const hasPosition = shares && (shares.yes > 0 || shares.no > 0);
  const yesValue = shares ? (shares.yes * yesPrice) / 100 : 0;
  const noValue = shares ? (shares.no * noPrice) / 100 : 0;
  const totalValue = yesValue + noValue;

  return (
    <Card className="bg-surface-container-low border border-border rounded-none shadow-none p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
          YOUR POSITION
        </span>
        {hasPosition && (
          <span className="text-[10px] font-sans text-muted-foreground tracking-widest">
            Value: ${formatNumber(totalValue)}
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
                ${formatNumber(yesValue)}
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
                ${formatNumber(noValue)}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
