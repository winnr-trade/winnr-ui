import type { Signer } from "@sovereign-sdk/signers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { useAgentWallet } from "@/hooks/useAgentWallet";
import type { OrderType, Outcome, Side } from "@/lib/rollup/types";
import { unitsToPrice } from "@/utils";

export interface PlaceOrderParams {
  marketId: number;
  outcome: Outcome;
  side: Side;
  price: bigint;
  quantity: number;
  orderType: OrderType;
}

export const placeOrder = async (params: PlaceOrderParams, signer: Signer) => {
  console.log("params", params);

  const orderReq = { ...params, price: unitsToPrice(params.price, 6) };
  console.log("order", orderReq);

  return await rollup.orderbook.placeOrder(orderReq, signer);
};

export const usePlaceOrder = () => {
  const { signer, isActive } = useAgentWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PlaceOrderParams) => {
      if (!isActive || !signer) {
        throw new Error("Trading session not active. Please enable trading.");
      }

      return placeOrder(params, signer);
    },
    onSuccess: () => {
      // Invalidate relevant queries so the UI updates immediately after a trade
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["marketShares"] });
    },
  });
};
