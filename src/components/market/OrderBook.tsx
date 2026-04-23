import { Card } from "@/components/ui/card";

interface OrderBookProps {
  bids: [number, number][];
  asks: [number, number][];
}

function formatSize(size: number) {
  return size >= 1000 ? (size / 1000).toFixed(1) + "k" : size.toString();
}

export function OrderBook({ bids, asks }: OrderBookProps) {
  // YES ASKS (selling YES)
  const yesAsks = [...asks].sort((a, b) => a[0] - b[0]).slice(0, 5);
  
  // NO ASKS (selling NO = buying YES)
  // Convert YES bids to NO asks (100 - price)
  const noAsks = [...bids]
    .map(([price, size]) => [100 - price, size] as [number, number])
    .sort((a, b) => a[0] - b[0])
    .slice(0, 5);

  const lowestAsk = asks.length > 0 ? Math.min(...asks.map(a => a[0])) : 50;
  const highestBid = bids.length > 0 ? Math.max(...bids.map(b => b[0])) : 50;
  const probability = Math.round((lowestAsk + highestBid) / 2);

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

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-8 mt-2">
        {/* TOP YES ASKS */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[9px] text-muted-foreground font-sans font-bold uppercase tracking-widest mb-2 border-b border-border pb-2">
            <span>TOP YES ASKS</span>
          </div>
          {yesAsks.length === 0 && (
            <div className="text-[11px] text-muted-foreground font-sans">No asks</div>
          )}
          {yesAsks.map(([price, size], i) => (
            <div key={`yes-${i}`} className="flex justify-between items-center text-[11px] font-sans">
              <span className="text-white font-bold">{price.toFixed(1)}%</span>
              <span className="text-muted-foreground">{formatSize(size)}</span>
            </div>
          ))}
        </div>

        {/* TOP NO ASKS */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[9px] text-muted-foreground font-sans font-bold uppercase tracking-widest mb-2 border-b border-border pb-2">
            <span>TOP NO ASKS</span>
          </div>
          {noAsks.length === 0 && (
            <div className="text-[11px] text-muted-foreground font-sans">No asks</div>
          )}
          {noAsks.map(([price, size], i) => (
            <div key={`no-${i}`} className="flex justify-between items-center text-[11px] font-sans">
              <span className="text-white font-bold">{price.toFixed(1)}%</span>
              <span className="text-muted-foreground">{formatSize(size)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
