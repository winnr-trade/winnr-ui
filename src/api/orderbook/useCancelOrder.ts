import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { useUserWallet } from "@/hooks/useUserWallet";

export function useCancelOrder() {
  const { signer } = useUserWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: number }) => {
      if (!signer) {
        throw new Error("Wallet not connected");
      }
      return await rollup.orderbook.cancelOrder(params, signer);
    },
    onSuccess: () => {
      // Invalidate the open orders query so the list updates
      queryClient.invalidateQueries({ queryKey: ["userOrders"] });
    },
  });
}
