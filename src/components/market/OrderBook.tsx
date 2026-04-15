import { ListOrdered } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography";

interface OrderBookProps {
  bids: [number, number][];
  asks: [number, number][];
}

function formatSize(size: number) {
  return size >= 1000 ? (size / 1000).toFixed(1) + "K" : size.toString();
}

export function OrderBook({ bids, asks }: OrderBookProps) {
  const sortedAsks = [...asks].sort((a, b) => b[0] - a[0]).slice(0, 5);
  const sortedBids = [...bids].sort((a, b) => b[0] - a[0]).slice(0, 5);

  const lowestAsk = sortedAsks.length > 0 ? sortedAsks[sortedAsks.length - 1][0] : null;
  const highestBid = sortedBids.length > 0 ? sortedBids[0][0] : null;
  const spread =
    lowestAsk !== null && highestBid !== null ? Number((lowestAsk - highestBid).toFixed(2)) : null;

  const maxSizeAsks = sortedAsks.length > 0 ? Math.max(...sortedAsks.map((a) => a[1])) : 1;
  const maxSizeBids = sortedBids.length > 0 ? Math.max(...sortedBids.map((b) => b[1])) : 1;
  const maxSize = Math.max(maxSizeAsks, maxSizeBids) || 1;

  return (
    <Card className="bg-surface-container-low border-0 shadow-none p-5 h-full">
      <div className="flex items-center gap-2 mb-6">
        <ListOrdered className="size-5 text-primary" />
        <Heading className="text-lg">Order Book</Heading>
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground font-bold font-sans uppercase tracking-widest mb-3">
        <span>Price (¢)</span>
        <span>Size</span>
      </div>

      <div className="flex flex-col gap-[2px]">
        {/* Asks (Sell) */}
        {sortedAsks.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-2 font-sans">
            No asks
          </div>
        )}
        {sortedAsks.map(([price, size]) => (
          <div
            key={`ask-${price}`}
            className="relative h-8 flex items-center justify-between px-2 text-sm"
          >
            <div
              className="absolute right-0 h-full bg-surface-container-highest opacity-50 rounded-l-sm transition-all duration-300"
              style={{ width: `${Math.min(100, (size / maxSize) * 100)}%` }}
            ></div>
            <span className="text-destructive/80 font-mono z-10">{price.toFixed(1)}</span>
            <span className="font-sans text-muted-foreground z-10">{formatSize(size)}</span>
          </div>
        ))}

        {/* Spread */}
        <div className="py-2 text-center text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest border-y border-surface-container border-opacity-50 my-2">
          {spread !== null ? `SPREAD: ${spread.toFixed(1)}¢` : "SPREAD: --"}
        </div>

        {/* Bids (Buy) */}
        {sortedBids.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-2 font-sans">
            No bids
          </div>
        )}
        {sortedBids.map(([price, size]) => (
          <div
            key={`bid-${price}`}
            className="relative h-8 flex items-center justify-between px-2 text-sm"
          >
            <div
              className="absolute left-0 h-full bg-primary/20 rounded-r-sm transition-all duration-300"
              style={{ width: `${Math.min(100, (size / maxSize) * 100)}%` }}
            ></div>
            <span className="text-primary font-mono font-bold z-10">
              {price.toFixed(1)}
            </span>
            <span className="font-sans text-primary z-10">{formatSize(size)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
