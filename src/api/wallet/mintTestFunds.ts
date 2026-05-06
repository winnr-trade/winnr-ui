import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export function useMintTestFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: string) => {
      const response = await axios.post("/api/faucet", { address });
      return response.data;
    },
    onSuccess: async () => {
      toast.success("10,000 Test USDC minted successfully");
      // Allow rollup state to settle before refetching balance
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await queryClient.refetchQueries({ queryKey: ["balance"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Failed to mint test funds";
      toast.error(message);
    },
  });
}
