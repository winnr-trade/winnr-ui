"use client";

import { Ed25519Signer } from "@sovereign-sdk/signers";
import { bytesToHex } from "@sovereign-sdk/utils";
import Link from "next/link";
import { toast } from "sonner";
import { useCancelOrder } from "@/api/orderbook/cancelOrder";
import { type StealthUserOrder, useGetStealthOrders } from "@/api/orderbook/getStealthOrders";
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
import { formatCents, formatNumber } from "@/utils";

export function StealthOpenOrders() {
  const { isEnabled } = useShieldedWallet();
  const { data: orders, isLoading } = useGetStealthOrders();

  if (!isEnabled) {
    return null;
  }

  const openOrders = orders || [];

  return (
    <div className="flex flex-col mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
          Open Orders
          <span className="text-[9px] font-sans font-bold px-2 py-0.5 rounded-sm bg-violet-500/15 border border-violet-500/40 tracking-[0.15em] uppercase text-violet-400">
            PRIVATE
          </span>
        </h2>
        <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border px-3 py-1 bg-surface-container-low rounded-none">
          {openOrders.length} {openOrders.length === 1 ? "Order" : "Orders"}
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
                Side / Outcome
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                Limit Price
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                Remaining
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-center">
                Original Qty
              </TableHead>
              <TableHead className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground h-12 px-4 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="p-12 text-center text-xs tracking-widest uppercase font-sans text-muted-foreground animate-pulse"
                >
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : openOrders.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="p-12 text-center text-xs tracking-widest uppercase font-sans text-muted-foreground"
                >
                  No open private orders
                </TableCell>
              </TableRow>
            ) : (
              openOrders.map((order) => <OrderItem key={order.id} order={order} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function OrderItem({ order }: { order: StealthUserOrder }) {
  const cancelOrder = useCancelOrder();

  const isBuy = order.side === "bid";
  const outcomeText = order.outcome.toUpperCase();
  const actionText = `${isBuy ? "BUY" : "SELL"} ${outcomeText}`;
  const price = formatCents(order.canonicalPrice);
  const remainingQty = formatNumber(order.remainingQuantity, 0, 0);
  const originalQty = formatNumber(order.originalQuantity, 0, 0);

  const handleCancelOrder = () => {
    const customSigner = new Ed25519Signer(bytesToHex(order.stealthPrivateKey));
    toast.promise(cancelOrder.mutateAsync({ orderId: order.id, customSigner }), {
      loading: "Canceling order...",
      success: "Order cancelled successfully",
      error: (err: Error) => `Failed to cancel order: ${err.message}`,
    });
  };

  return (
    <TableRow className="border-b border-border/50 hover:bg-surface-container transition-colors group">
      <TableCell className="px-4 py-4 w-[20%]">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/markets/${order.marketId}`}
            className="group/link text-sm font-sans font-bold text-white hover:text-white transition-colors leading-tight"
          >
            {order.marketQuestion || `Market #${order.marketId}`}
          </Link>
          <span className="shrink-0 text-[9px] uppercase tracking-widest font-sans font-bold text-violet-400/70 bg-transparent border border-violet-500/20 px-2 py-0.5 rounded-none mt-0.5">
            {order.orderType}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-4 text-center">
        <span
          className={`font-heading font-bold text-sm tracking-wide ${isBuy ? "text-emerald-500" : "text-destructive"}`}
        >
          {actionText}
        </span>
      </TableCell>
      <TableCell className="text-center font-heading font-bold text-sm text-white px-4 py-4">
        {price}¢
      </TableCell>
      <TableCell className="text-center font-sans text-sm font-bold tracking-wide text-white px-4 py-4">
        {remainingQty}
      </TableCell>
      <TableCell className="text-center font-sans text-sm font-bold tracking-wide text-muted-foreground px-4 py-4">
        {originalQty}
      </TableCell>

      <TableCell className="text-right px-4 py-4">
        <Button
          variant="outline"
          size="xs"
          className="text-violet-400 tracking-widest uppercase border-violet-500/30 bg-transparent hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors shadow-none rounded-none"
          onClick={handleCancelOrder}
          disabled={cancelOrder.isPending}
        >
          {cancelOrder.isPending ? "CANCELING..." : "CANCEL"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
