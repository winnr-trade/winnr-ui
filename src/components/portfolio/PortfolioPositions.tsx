"use client";

import { toast } from "sonner";
import { useCancelOrder } from "@/api/orderbook/cancelOrder";
import { usePortfolioData } from "@/api/portfolio";
import { Button } from "@/components/ui/button";

export function PortfolioPositions() {
  const { data: portfolio } = usePortfolioData();
  const cancelOrder = useCancelOrder();

  if (!portfolio) return null;

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder.mutateAsync({ orderId: parseInt(orderId, 10) });
      toast.success("Order cancelled successfully");
    } catch (err) {
      toast.error("Failed to cancel order");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-white">Active Positions</h2>
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border px-3 py-1 bg-surface-container-low rounded-none">
          {portfolio.activePositions.length} Orders
        </span>
      </div>

      <div className="border border-border bg-surface-container-low">
        {/* Table Header */}
        <div className="grid grid-cols-7 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground p-4 border-b border-border">
          <div className="col-span-2">Market</div>
          <div className="col-span-2 text-center">Position</div>
          <div className="col-span-1 text-center">Price</div>
          <div className="col-span-1 text-center">Value</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
          {portfolio.activePositions.map((pos, idx) => (
            <div
              key={pos.id}
              className={`grid grid-cols-7 items-center p-4 hover:bg-surface-container transition-colors ${
                idx !== portfolio.activePositions.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="col-span-2 flex flex-col gap-1 pr-4">
                <span className="text-sm font-sans font-bold text-white leading-tight">
                  {pos.market}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span
                  className={`text-sm font-sans font-bold ${
                    pos.outcome === "YES" ? "text-emerald-500" : "text-destructive"
                  }`}
                >
                  {pos.position}
                </span>
              </div>
              <div className="col-span-1 text-center text-sm font-sans font-bold text-white">
                {pos.avgPrice}
              </div>
              <div className="col-span-1 text-center text-sm font-sans font-bold text-white">
                $
                {pos.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="col-span-1 text-right">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleCancel(pos.id)}
                  disabled={cancelOrder.isPending}
                  className="text-muted-foreground tracking-widest uppercase border-border bg-transparent hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors shadow-none rounded-none"
                >
                  {cancelOrder.isPending ? "CANCELING..." : "CANCEL"}
                </Button>
              </div>
            </div>
          ))}
          {portfolio.activePositions.length === 0 && (
            <div className="p-12 text-center">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground">
                No active orders found
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
