import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { useAgentWallet } from "@/hooks/useAgentWallet";

export function useCancelOrder() {
  const { signer, isActive } = useAgentWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: number }) => {
      if (!isActive || !signer) {
        throw new Error("Trading session not active. Please enable trading.");
      }
      return await rollup.orderbook.cancelOrder(params, signer);
    },
    onSuccess: () => {
      // Invalidate the open orders query so the list updates
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
    },
  });
}
