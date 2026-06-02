"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useGetStealthPositions } from "@/api/portfolio";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShieldedWallet } from "@/hooks/useShieldedWallet";
import { flattenPositions, formatCents, formatCurrency, formatNumber } from "@/utils";

export function StealthPositions() {
  const { isEnabled } = useShieldedWallet();
  const { data: positions, isLoading } = useGetStealthPositions();

  const rows = useMemo(() => {
    if (!positions) return [];
    return flattenPositions(positions);
  }, [positions]);

  if (!isEnabled) return null;
  if (isLoading && !positions) return null;

  return (
    <div className="flex flex-col mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
          Active Positions
          <span className="text-[9px] font-sans font-bold px-2 py-0.5 rounded-sm bg-violet-500/15 border border-violet-500/40 tracking-[0.15em] uppercase text-violet-400">
            PRIVATE
          </span>
        </h2>
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border px-3 py-1 bg-surface-container-low rounded-none">
          {rows.length} Positions
        </span>
      </div>

      <div className="border border-border bg-surface-container-low rounded-none">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 w-[20%]">
                Market
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                Position
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                Avg Price
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                Current
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                Value
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                PnL
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((pos) => (
                <TableRow
                  key={pos.id}
                  className="border-b border-border/50 hover:bg-surface-container transition-colors"
                >
                  <TableCell className="px-4 py-4 w-[20%]">
                    <span className="text-sm font-sans font-bold text-white leading-tight line-clamp-2">
                      {pos.question}
                    </span>
                  </TableCell>
                  <TableCell className="text-center px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-sans font-bold text-white">
                        {formatNumber(pos.quantity, 0, 0)}
                      </span>
                      <span
                        className={`text-sm font-sans font-bold uppercase tracking-widest ${
                          pos.outcome === "YES" ? "text-emerald-500" : "text-destructive"
                        }`}
                      >
                        {pos.outcome}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm font-sans font-bold text-white px-4 py-4">
                    {formatCents(pos.avgPrice)}¢
                  </TableCell>
                  <TableCell className="text-center text-sm font-sans font-bold text-white px-4 py-4">
                    {formatCents(pos.currentPrice)}¢
                  </TableCell>
                  <TableCell className="text-center text-sm font-sans font-bold text-white px-4 py-4">
                    {formatCurrency(pos.value)}
                  </TableCell>
                  <TableCell
                    className={`text-center px-4 py-4 ${
                      pos.pnlPositive ? "text-emerald-500" : "text-destructive"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-sans font-bold">
                        {pos.pnlPositive ? "+" : "-"}
                        {formatCurrency(pos.pnl < BigInt(0) ? -pos.pnl : pos.pnl)}
                      </span>
                      <span className="text-sm font-sans font-bold">
                        ({pos.pnlPositive ? "+" : "-"}
                        {formatNumber(Math.abs(pos.pnlPercent), 1, 1)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-4 py-4">
                    <Link href={`/markets/${pos.marketId}`}>
                      <Button
                        variant="outline"
                        size="xs"
                        className="text-violet-400 tracking-widest uppercase border-violet-500/30 bg-transparent hover:text-violet-300 hover:border-violet-400 hover:bg-violet-500/10 transition-colors shadow-none rounded-none"
                      >
                        TRADE
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="p-12 text-center">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    No private positions found
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
