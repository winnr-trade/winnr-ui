import { useMarketDetail } from "@/api/market";
import { useOrderbook } from "@/api/orderbook";
import { Card } from "@/components/ui/card";
import { formatCents, formatSize } from "@/utils";

interface OrderBookProps {
  marketId: number;
}

export function OrderBook({ marketId }: OrderBookProps) {
  const { bids, asks } = useOrderbook({ marketId });
  const { data: market } = useMarketDetail({ id: marketId });

  const probability = market?.probability || 50;

  // Process ASKS: lowest to highest, calculate cumulative depth
  const processedAsks = [...asks]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(0, 15)
    .reduce(
      (acc, [price, size], i) => {
        const prevTotal = i === 0 ? 0 : acc[i - 1].total;
        acc.push({ price, size, total: prevTotal + size });
        return acc;
      },
      [] as { price: bigint; size: number; total: number }[],
    );

  // Process BIDS: highest to lowest, calculate cumulative depth
  const processedBids = [...bids]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 15)
    .reduce(
      (acc, [price, size], i) => {
        const prevTotal = i === 0 ? 0 : acc[i - 1].total;
        acc.push({ price, size, total: prevTotal + size });
        return acc;
      },
      [] as { price: bigint; size: number; total: number }[],
    );

  const maxTotal = Math.max(
    processedAsks.length > 0 ? processedAsks[processedAsks.length - 1].total : 0,
    processedBids.length > 0 ? processedBids[processedBids.length - 1].total : 0,
    1, // Avoid division by zero
  );

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
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-muted-foreground font-sans font-bold uppercase tracking-widest mb-2 border-b border-border pb-2">
            <span>YES BIDS</span>
            <span>SIZE</span>
          </div>
          {processedBids.length === 0 && (
            <div className="text-[11px] text-muted-foreground font-sans py-2">No bids</div>
          )}
          {processedBids.map((bid) => (
            <div
              key={`bid-${bid.price.toString()}`}
              className="relative flex justify-between items-center text-[11px] font-sans h-7 px-1"
            >
              {/* Depth Bar (Right aligned, grows left) */}
              <div
                className="absolute right-0 top-[2px] bottom-[2px] bg-emerald-500/10 transition-all duration-300"
                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
              />
              <span className="relative z-10 text-emerald-500 font-bold">
                {formatCents(bid.price)}¢
              </span>
              <span className="relative z-10 text-muted-foreground">{formatSize(bid.size)}</span>
            </div>
          ))}
        </div>

        {/* YES ASKS */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[9px] text-muted-foreground font-sans font-bold uppercase tracking-widest mb-2 border-b border-border pb-2">
            <span>YES ASKS</span>
            <span>SIZE</span>
          </div>
          {processedAsks.length === 0 && (
            <div className="text-[11px] text-muted-foreground font-sans py-2">No asks</div>
          )}
          {processedAsks.map((ask) => (
            <div
              key={`ask-${ask.price.toString()}`}
              className="relative flex justify-between items-center text-[11px] font-sans h-7 px-1"
            >
              {/* Depth Bar (Left aligned, grows right) */}
              <div
                className="absolute left-0 top-[2px] bottom-[2px] bg-destructive/10 transition-all duration-300"
                style={{ width: `${(ask.total / maxTotal) * 100}%` }}
              />
              <span className="relative z-10 text-destructive font-bold">
                {formatCents(ask.price)}¢
              </span>
              <span className="relative z-10 text-muted-foreground">{formatSize(ask.size)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
