import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";
import { tokens } from "@/config/constants";

export const getBalance = async (address: string, tokenId: string) => {
  const balance = await rollup.bank.balance(address, tokenId);
  return balance;
};

export const useGetBalance = (params: { address?: string; tokenId?: string }) => {
  let { address, tokenId } = params;
  const usdcTokenId = tokens.usdc.id;
  tokenId = tokenId || usdcTokenId;
  return useQuery({
    queryKey: ["balance", address, tokenId],
    queryFn: () => getBalance(address!, tokenId!),
    enabled: !!address, // only run query if address exists
  });
};
