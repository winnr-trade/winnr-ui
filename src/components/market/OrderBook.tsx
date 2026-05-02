import { useMarketDetail } from "@/api/market";
import { useOrderbook } from "@/api/orderbook";
import { Card } from "@/components/ui/card";
import { formatCents, formatSize, parseUsd } from "@/utils";

interface OrderBookProps {
  marketId: number;
}

export function OrderBook({ marketId }: OrderBookProps) {
  const { bids, asks } = useOrderbook({ marketId });
  const { data: market } = useMarketDetail({ id: marketId });

  const probability = market?.probability || 50;

  // YES ASKS (selling YES) - lowest to highest
  const yesAsks = [...asks].sort((a, b) => (a[0] < b[0] ? -1 : 1)).slice(0, 5);

  // YES BIDS (buying YES) - highest to lowest
  const yesBids = [...bids].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 5);

  const yesPercent = probability;
  const noPercent = 100 - probability;

  return (
    <Card className="bg-transparent border border-border rounded-none shadow-none p-6 h-full flex flex-col gap-6">
      <div className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
        ORDER BOOK SUMMARY
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-sans font-bold uppercase tracking-widest">
          <span className="text-emerald-500">YES {yesPercent}%</span>
          <span className="text-destructive">NO {noPercent}%</span>
        </div>
        <div className="w-full h-1 bg-surface-container flex">
          <div className="h-full bg-emerald-500" style={{ width: `${yesPercent}%` }}></div>
          <div className="h-full bg-destructive" style={{ width: `${noPercent}%` }}></div>
        </div>
      </div>

      {/* Two columns: BIDS | ASKS */}
      <div className="grid grid-cols-2 gap-8 mt-2">
        {/* YES BIDS */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[9px] text-muted-foreground font-sans font-bold uppercase tracking-widest mb-2 border-b border-border pb-2">
            <span>YES BIDS</span>
          </div>
          {yesBids.length === 0 && (
            <div className="text-[11px] text-muted-foreground font-sans">No bids</div>
          )}
          {yesBids.map(([price, size]) => (
            <div
              key={`bid-${price.toString()}`}
              className="flex justify-between items-center text-[11px] font-sans"
            >
              <span className="text-emerald-500 font-bold">{formatCents(price)}¢</span>
              <span className="text-muted-foreground">{formatSize(size)}</span>
            </div>
          ))}
        </div>

        {/* YES ASKS */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[9px] text-muted-foreground font-sans font-bold uppercase tracking-widest mb-2 border-b border-border pb-2">
            <span>YES ASKS</span>
          </div>
          {yesAsks.length === 0 && (
            <div className="text-[11px] text-muted-foreground font-sans">No asks</div>
          )}
          {yesAsks.map(([price, size]) => (
            <div
              key={`ask-${price.toString()}`}
              className="flex justify-between items-center text-[11px] font-sans"
            >
              <span className="text-destructive font-bold">{formatCents(price)}¢</span>
              <span className="text-muted-foreground">{formatSize(size)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
