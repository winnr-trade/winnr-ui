import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { tokens } from "@/config/constants";

export const useGetBalance = (address?: string, tokenId?: string) => {
  const usdcTokenId = tokens.usdc.id;
  tokenId = tokenId || usdcTokenId;
  return useQuery({
    queryKey: ["balance", address, tokenId],
    queryFn: async () => {
      if (!address) return BigInt(0);
      const balance = await rollup.bank.balance(address, tokenId);
      return balance;
    },
    enabled: !!address, // only run query if address exists
  });
};
