import { useMemo } from "react";
import { History, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { useGetRecentTrades, type Trade } from "@/api/market";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography";
import { formatNumber, truncateAddress } from "@/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActivityRow {
  marketId: number;
  user: string;
  outcome: "yes" | "no";
  side: "buy" | "sell";
  price: number;
  quantity: number;
  timestamp: number;
  txHash: string;
}

export function transformTradeToActivity(trade: Trade): ActivityRow[] {
  const { marketId, buyer, seller, price, quantity, settlementKind, timestamp, txHash } = trade;
  const rows: ActivityRow[] = [];

  switch (settlementKind) {
    case "mint_pair":
      // In a mint, both parties are effectively 'buying' their respective sides from the contract
      rows.push({ marketId, user: buyer, outcome: "yes", side: "buy", price, quantity, timestamp, txHash });
      rows.push({ marketId, user: seller, outcome: "no", side: "buy", price: 10000 - price, quantity, timestamp, txHash });
      break;
    case "transfer_yes":
      rows.push({ marketId, user: buyer, outcome: "yes", side: "buy", price, quantity, timestamp, txHash });
      rows.push({ marketId, user: seller, outcome: "yes", side: "sell", price, quantity, timestamp, txHash });
      break;
    case "transfer_no":
      rows.push({ marketId, user: buyer, outcome: "no", side: "buy", price: 10000 - price, quantity, timestamp, txHash });
      rows.push({ marketId, user: seller, outcome: "no", side: "sell", price: 10000 - price, quantity, timestamp, txHash });
      break;
    case "merge_pair":
      // In a merge, both parties are 'selling' (burning) their shares back to the contract
      rows.push({ marketId, user: buyer, outcome: "no", side: "sell", price: 10000 - price, quantity, timestamp, txHash });
      rows.push({ marketId, user: seller, outcome: "yes", side: "sell", price, quantity, timestamp, txHash });
      break;
  }

  return rows;
}

interface RecentActivityProps {
  marketId: number;
}

export function RecentActivity({ marketId }: RecentActivityProps) {
  const { data: trades, isLoading } = useGetRecentTrades({ marketId, limit: 20 });

  const activities = useMemo(() => {
    if (!trades) return [];
    return trades
      .flatMap(transformTradeToActivity)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [trades]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card className="bg-surface-container-low border border-border rounded-none shadow-none p-5 h-full">
      <div className="flex items-center gap-2 mb-6">
        <History className="size-5 text-white" />
        <Heading className="text-lg">Recent Activity</Heading>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-xs font-sans text-muted-foreground uppercase tracking-widest">
          No recent activity
        </div>
      ) : (
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader className="[&_tr]:border-border/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="h-10 text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">User</TableHead>
                <TableHead className="h-10 text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Trade</TableHead>
                <TableHead className="h-10 text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground text-right">Price</TableHead>
                <TableHead className="h-10 text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground text-right">Size</TableHead>
                <TableHead className="h-10 text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((row, idx) => (
                <TableRow key={`${row.user}-${row.timestamp}-${idx}`} className="hover:bg-white/[0.02] border-border/50 group">
                  <TableCell className="py-3 font-mono text-[11px] text-muted-foreground group-hover:text-white transition-colors">
                    {truncateAddress(row.user)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      {/* Logic: Buy YES or Sell NO increases probability -> Green. Sell YES or Buy NO decreases probability -> Red. */}
                      {(() => {
                        const isUp = (row.side === "buy" && row.outcome === "yes") || (row.side === "sell" && row.outcome === "no");
                        const colorClass = isUp ? "text-emerald-500" : "text-destructive";
                        const bgClass = isUp ? "bg-emerald-500/10" : "bg-destructive/10";
                        const Icon = isUp ? ArrowUp : ArrowDown;
                        
                        return (
                          <>
                            <div className={`size-4 rounded-none flex items-center justify-center ${bgClass}`}>
                              <Icon className={`size-2.5 ${colorClass}`} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-tighter ${colorClass}`}>
                              {row.side} {row.outcome}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right font-mono text-[11px] text-white">
                    {Math.round(row.price / 100)}¢
                  </TableCell>
                  <TableCell className="py-3 text-right font-mono text-[11px] text-white">
                    {formatNumber(row.quantity)}
                  </TableCell>
                  <TableCell className="py-3 text-right text-[10px] uppercase font-sans font-bold text-muted-foreground">
                    {formatTimeAgo(row.timestamp)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
