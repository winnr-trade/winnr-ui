"use client";

import { toast } from "sonner";
import { useCancelOrder } from "@/api/orderbook/cancelOrder";
import { type UserOrder, useGetUserOrders } from "@/api/orderbook/getUserOrders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heading } from "@/components/ui/typography";
import { useMainWallet } from "@/hooks/useMainWallet";
import { formatCents, formatNumber } from "@/utils";

interface OpenOrdersListProps {
  marketId: number;
}

export function OpenOrdersList({ marketId }: OpenOrdersListProps) {
  const { address } = useMainWallet();
  const { data: orders, isLoading } = useGetUserOrders({
    userAddress: address ?? undefined,
    marketId,
  });

  if (!address) {
    return null;
  }

  const openOrders = orders?.filter((o) => o.status === "open") || [];

  return (
    <Card className="bg-surface-container-low border border-border shadow-none rounded-none flex flex-col overflow-hidden">
      <div className="px-6 md:px-8 py-6 flex justify-between items-center">
        <Heading className="text-lg font-bold tracking-tight text-white uppercase tracking-[0.05em]">
          Open Orders
        </Heading>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest">
            {openOrders.length} {openOrders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground h-12 px-6 md:px-8">
                SIDE / OUTCOME
              </TableHead>
              <TableHead className="text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground h-12 px-6 md:px-8 text-center">
                LIMIT PRICE
              </TableHead>
              <TableHead className="text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground h-12 px-6 md:px-8 text-center">
                REMAINING
              </TableHead>
              <TableHead className="text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground h-12 px-6 md:px-8 text-center">
                ORIGINAL QTY
              </TableHead>
              <TableHead className="text-[10px] uppercase font-sans font-bold tracking-widest text-muted-foreground h-12 px-6 md:px-8 text-right">
                ACTION
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="p-8 text-center text-xs tracking-widest uppercase font-sans text-muted-foreground animate-pulse"
                >
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : openOrders.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="p-8 text-center text-xs tracking-widest uppercase font-sans text-muted-foreground"
                >
                  No open orders
                </TableCell>
              </TableRow>
            ) : (
              openOrders.map((order) => <OrderItem key={order.id} order={order} />)
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function OrderItem({ order }: { order: UserOrder }) {
  const cancelOrder = useCancelOrder();

  const isBuy = order.side === "bid";
  const outcomeText = order.outcome.toUpperCase();
  const actionText = `${isBuy ? "BUY" : "SELL"} ${outcomeText}`;
  const price = formatCents(order.canonicalPrice);
  const remainingQty = formatNumber(order.remainingQuantity, 0, 0);
  const originalQty = formatNumber(order.originalQuantity, 0, 0);

  const handleCancelOrder = () => {
    toast.promise(cancelOrder.mutateAsync({ orderId: order.id }), {
      loading: "Canceling order...",
      success: "Order cancelled successfully",
      error: (err: Error) => `Failed to cancel order: ${err.message}`,
    });
  };

  return (
    <TableRow className="border-b border-border/40 hover:bg-surface-container transition-colors group">
      <TableCell className="px-6 md:px-8 py-4">
        <div className="flex flex-col xl:flex-row xl:items-center gap-2">
          <span
            className={`font-heading font-bold text-sm tracking-wide ${isBuy ? "text-emerald-500" : "text-destructive"}`}
          >
            {actionText}
          </span>
          <span className="w-fit text-[9px] uppercase tracking-widest font-sans font-bold text-muted-foreground bg-transparent border border-border px-2 py-0.5 rounded-none">
            {order.orderType}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center font-heading font-bold text-sm text-white px-6 md:px-8 py-4">
        {price}¢
      </TableCell>
      <TableCell className="text-center font-sans text-xs tracking-wide text-white px-6 md:px-8 py-4">
        {remainingQty}
      </TableCell>
      <TableCell className="text-center font-sans text-xs tracking-wide text-muted-foreground px-6 md:px-8 py-4">
        {originalQty}
      </TableCell>

      <TableCell className="text-right px-6 md:px-8 py-4">
        <Button
          variant="outline"
          size="xs"
          className="text-muted-foreground tracking-widest uppercase border-border bg-transparent hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors shadow-none rounded-none"
          onClick={handleCancelOrder}
          disabled={cancelOrder.isPending}
        >
          {cancelOrder.isPending ? "CANCELING..." : "CANCEL"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
