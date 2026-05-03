import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { priceToUnits } from "@/utils";

export interface UserOrder {
  id: number;
  marketId: number;
  marketQuestion?: string;
  outcome: "yes" | "no";
  side: "bid" | "ask";
  canonicalSide: "bid" | "ask";
  canonicalPrice: bigint;
  originalQuantity: number;
  remainingQuantity: number;
  owner: string;
  orderType: "limit" | "market";
  createdAt: number;
  status: "open" | "filled" | "cancelled";
}

export const getUserOrders = async (userAddress?: string, marketId?: number) => {
  if (!userAddress) return [];
  const res = (await rollup.orderbook.getUserOrders({ userAddress, marketId })) as any[];

  return res.map((order) => ({
    id: order.id,
    marketId: order.market_id,
    marketQuestion: order.market_question,
    outcome: order.outcome,
    side: order.side,
    canonicalSide: order.canonical_side,
    canonicalPrice: priceToUnits(order.canonical_price, 6),
    originalQuantity: order.original_quantity,
    remainingQuantity: order.remaining_quantity,
    owner: order.owner,
    orderType: order.order_type,
    createdAt: order.created_at,
    status: order.status,
  })) as UserOrder[];
};

export function useGetUserOrders(params: { userAddress: string | undefined; marketId?: number }) {
  const { userAddress, marketId } = params;
  return useQuery<UserOrder[]>({
    queryKey: ["userOrders", userAddress, marketId],
    queryFn: () => getUserOrders(userAddress, marketId),
    enabled: !!userAddress,
  });
}
