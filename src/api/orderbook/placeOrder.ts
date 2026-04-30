import { bytesToHex } from "@sovereign-sdk/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import b58 from "bs58";
import { rollup } from "@/api/utils";
import { useAgentWallet } from "@/hooks/useAgentWallet";
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
  const { signer, isActive } = useAgentWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PlaceOrderParams) => {
      if (!isActive || !signer) {
        throw new Error("Trading session not active. Please enable trading.");
      }

      const addr = await signer.publicKey();

      console.log("signer:", b58.encode(addr));

      return await rollup.orderbook.placeOrder(params, signer);
    },
    onSuccess: () => {
      // Invalidate relevant queries so the UI updates immediately after a trade
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["marketShares"] });
    },
  });
};
