import { useMarketHolders } from "@/api/market";
import { Card } from "@/components/ui/card";
import { formatSize, truncateAddress } from "@/utils";
import { Loader2 } from "lucide-react";

interface TopHoldersProps {
  marketId: number;
}

export function TopHolders({ marketId }: TopHoldersProps) {
  const { data, isLoading, error } = useMarketHolders({ marketId });

  if (isLoading) {
    return (
      <Card className="bg-transparent border border-border rounded-none shadow-none p-4 h-[300px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-transparent border border-border rounded-none shadow-none p-4 h-[300px] flex items-center justify-center text-muted-foreground text-sm font-sans">
        Failed to load top holders
      </Card>
    );
  }

  const { yesHolders, noHolders } = data;

  const renderHolderRow = (holder: { userAddress: string; quantity: number }, colorClass: string) => (
    <div
      key={holder.userAddress}
      className="flex justify-between items-center text-[11px] font-sans h-8 px-2 border-b border-border/50 last:border-0 hover:bg-surface-container transition-colors"
    >
      <span className="text-muted-foreground font-mono">{truncateAddress(holder.userAddress)}</span>
      <span className={`${colorClass} font-bold`}>{formatSize(holder.quantity)}</span>
    </div>
  );

  return (
    <Card className="bg-transparent border border-border rounded-none shadow-none p-4 h-full flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-6">
        {/* Top YES Holders */}
        <div className="flex flex-col">
          <div className="flex justify-between text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.2em] mb-2 border-b border-border pb-2 px-1">
            <span>TOP YES HOLDERS</span>
            <span>SHARES</span>
          </div>
          {yesHolders.length === 0 ? (
            <div className="text-[11px] text-muted-foreground font-sans py-4 text-center">
              No yes holders yet
            </div>
          ) : (
            <div className="flex flex-col">
              {yesHolders.map((h) => renderHolderRow(h, "text-emerald-500"))}
            </div>
          )}
        </div>

        {/* Top NO Holders */}
        <div className="flex flex-col">
          <div className="flex justify-between text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.2em] mb-2 border-b border-border pb-2 px-1">
            <span>TOP NO HOLDERS</span>
            <span>SHARES</span>
          </div>
          {noHolders.length === 0 ? (
            <div className="text-[11px] text-muted-foreground font-sans py-4 text-center">
              No no holders yet
            </div>
          ) : (
            <div className="flex flex-col">
              {noHolders.map((h) => renderHolderRow(h, "text-destructive"))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
