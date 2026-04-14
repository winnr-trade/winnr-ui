import { useQuery } from "@tanstack/react-query";
import { MOCK_VAULT_DATA } from "@/api/mock";

export const useVaultData = () => {
  return useQuery({
    queryKey: ["vaultData"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_VAULT_DATA;
    },
  });
};
