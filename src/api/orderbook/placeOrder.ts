import { useMutation } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { useUserWallet } from "@/hooks/useUserWallet";
import type { OrderType, Outcome, Side } from "@/lib/rollup/types";

export interface PlaceOrderParams {
  marketId: number;
  outcome: Outcome;
  side: Side;
  price: number;
  quantity: number;
  orderType: OrderType;
}

export const usePlaceOrder = () => {
  const { signer } = useUserWallet();

  return useMutation({
    mutationFn: async (params: PlaceOrderParams) => {
      if (!signer) {
        throw new Error("Wallet not connected");
      }

      return await rollup.orderbook.placeOrder(params, signer);
    },
  });
};
