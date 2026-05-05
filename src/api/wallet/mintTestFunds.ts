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
    onSuccess: () => {
      toast.success("10,000 Test USDC minted successfully");
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || "Failed to mint test funds";
      toast.error(message);
    },
  });
}
