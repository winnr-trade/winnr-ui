"use client";

import { toast } from "sonner";
import { useCancelOrder } from "@/api/orderbook/useCancelOrder";
import { type UserOrder, useGetUserOrders } from "@/api/orderbook/useGetUserOrders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography";
import { useUserWallet } from "@/hooks/useUserWallet";
import { formatNumber } from "@/utils";

interface OpenOrdersListProps {
  marketId: number;
}

export function OpenOrdersList({ marketId }: OpenOrdersListProps) {
  const { address } = useUserWallet();
  const { data: orders, isLoading } = useGetUserOrders(address, marketId);

  if (!address) {
    return null;
  }

  const openOrders = orders?.filter((o) => o.status === "open") || [];

  return (
    <Card className="bg-surface-container-low border border-border shadow-none p-6 md:p-8 flex flex-col gap-6 rounded-none">
      <Heading className="text-xl font-bold tracking-wide text-white">Open Orders</Heading>

      {isLoading ? (
        <div className="text-xs tracking-widest uppercase font-sans text-muted-foreground animate-pulse">
          Loading orders...
        </div>
      ) : openOrders.length === 0 ? (
        <div className="text-xs tracking-widest uppercase font-sans text-muted-foreground">
          No open orders
        </div>
      ) : (
        <div className="w-full flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-6 text-[9px] uppercase font-sans font-bold tracking-[0.2em] text-muted-foreground pb-3 border-b border-border mb-2 px-4">
            <div className="col-span-1 text-left">SIDE / OUTCOME</div>
            <div className="col-span-1 text-right">LIMIT PRICE</div>
            <div className="col-span-1 text-right">REMAINING</div>
            <div className="col-span-1 text-right">ORIGINAL QTY</div>
            <div className="col-span-1 text-right">PNL</div>
            <div className="col-span-1 text-right">ACTION</div>
          </div>

          <div className="flex flex-col gap-2">
            {openOrders.map((order) => (
              <OrderItem key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function OrderItem({ order }: { order: UserOrder }) {
  const cancelOrder = useCancelOrder();

  const isBuy = order.side === "bid";
  const outcomeText = order.outcome.toUpperCase();
  const actionText = `${isBuy ? "BUY" : "SELL"} ${outcomeText}`;
  const price = (order.canonical_price / 100).toFixed(3);
  const remainingQty = formatNumber(order.remaining_quantity, 0, 0);
  const originalQty = formatNumber(order.original_quantity, 0, 0);

  const handleCancelOrder = () => {
    toast.promise(cancelOrder.mutateAsync({ orderId: order.id }), {
      loading: "Canceling order...",
      success: "Order canceled successfully",
      error: (err: any) => `Failed to cancel order: ${err.message}`,
    });
  };

  return (
    <div className="grid grid-cols-6 items-center px-4 py-3 rounded-none bg-surface-container border border-border hover:bg-surface-container-highest transition-colors group">
      {/* Side / Outcome */}
      <div className="col-span-1 flex flex-col xl:flex-row xl:items-center gap-2">
        <span
          className={`font-heading font-bold text-sm tracking-wide ${isBuy ? "text-white" : "text-destructive"}`}
        >
          {actionText}
        </span>
        <span className="w-fit text-[9px] uppercase tracking-widest font-sans font-bold text-muted-foreground bg-transparent border border-border px-2 py-0.5 rounded-none">
          {order.order_type}
        </span>
      </div>

      {/* Limit Price */}
      <div className="col-span-1 text-right font-heading font-bold text-sm text-white">
        ${price}
      </div>

      {/* Remaining Qty */}
      <div className="col-span-1 text-right font-sans text-xs tracking-wide text-white">
        {remainingQty}
      </div>

      {/* Original Qty */}
      <div className="col-span-1 text-right font-sans text-xs tracking-wide text-muted-foreground">
        {originalQty}
      </div>

      {/* PnL */}
      <div className="col-span-1 text-right font-sans font-bold text-xs tracking-wide text-muted-foreground">
        --
      </div>

      {/* Cancel Action */}
      <div className="col-span-1 flex justify-end">
        <Button
          variant="outline"
          size="xs"
          className="text-muted-foreground tracking-widest uppercase border-border bg-transparent hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors shadow-none"
          onClick={handleCancelOrder}
          disabled={cancelOrder.isPending}
        >
          {cancelOrder.isPending ? "CANCELING..." : "CANCEL"}
        </Button>
      </div>
    </div>
  );
}
