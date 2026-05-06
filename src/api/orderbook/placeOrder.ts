import type { Signer } from "@sovereign-sdk/signers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
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

  // Use refs to avoid stale closures in the mutation function.
  // Without this, the mutationFn captures the initial render values
  // and won't see updates after enableTrading completes.
  const signerRef = useRef(signer);
  const isActiveRef = useRef(isActive);
  signerRef.current = signer;
  isActiveRef.current = isActive;

  return useMutation({
    mutationFn: async (params: PlaceOrderParams) => {
      if (!isActiveRef.current || !signerRef.current) {
        throw new Error("Trading session not active. Please enable trading.");
      }

      return placeOrder(params, signerRef.current);
    },
    onSuccess: () => {
      // Invalidate relevant queries so the UI updates immediately after a trade
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["marketShares"] });
    },
  });
};
