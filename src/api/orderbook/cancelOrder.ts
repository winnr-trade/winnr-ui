import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { useAgentWallet } from "@/hooks/useAgentWallet";

export function useCancelOrder() {
  const { signer, isActive } = useAgentWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: number; customSigner?: any }) => {
      const activeSigner = params.customSigner || signer;
      if (!activeSigner) {
        throw new Error("Trading session not active. Please enable trading.");
      }
      return await rollup.orderbook.cancelOrder({ orderId: params.orderId }, activeSigner);
    },
    onSuccess: () => {
      // Invalidate the open orders queries so the lists update
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
      queryClient.invalidateQueries({ queryKey: ["stealthOrders"] });
    },
  });
}
