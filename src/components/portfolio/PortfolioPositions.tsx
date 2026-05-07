"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useActivePositions } from "@/api/portfolio";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flattenPositions, formatCents, formatCurrency, formatNumber } from "@/utils";

export function PortfolioPositions() {
  const { data: positions, isLoading } = useActivePositions();

  const flattenedPositions = useMemo(() => {
    if (!positions) return [];
    return flattenPositions(positions);
  }, [positions]);

  if (isLoading && !positions) return null;

  return (
    <div className="flex flex-col mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-white">Active Positions</h2>
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border px-3 py-1 bg-surface-container-low rounded-none">
          {flattenedPositions.length} Positions
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
            {flattenedPositions.map((pos) => (
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
                      className="text-muted-foreground tracking-widest uppercase border-border bg-transparent hover:text-primary hover:border-primary hover:bg-primary/10 transition-colors shadow-none rounded-none"
                    >
                      TRADE
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {flattenedPositions.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="p-12 text-center">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    No active positions found
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
