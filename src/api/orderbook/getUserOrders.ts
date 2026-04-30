import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";

export interface UserOrder {
  id: number;
  market_id: number;
  outcome: "yes" | "no";
  side: "bid" | "ask";
  canonical_side: "bid" | "ask";
  canonical_price: number;
  original_quantity: number;
  remaining_quantity: number;
  owner: string;
  order_type: "limit" | "market";
  created_at: number;
  status: "open" | "filled" | "cancelled";
}

export function useGetUserOrders(params: { userAddress: string | undefined; marketId?: number }) {
  const { userAddress, marketId } = params;
  return useQuery<UserOrder[]>({
    queryKey: ["userOrders", userAddress, marketId],
    queryFn: async () => {
      if (!userAddress) return [];
      const res = await rollup.orderbook.getUserOrders({ userAddress, marketId });
      return res as UserOrder[];
    },
    enabled: !!userAddress,
  });
}
