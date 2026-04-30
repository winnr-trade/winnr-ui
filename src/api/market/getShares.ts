import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";

export const useGetShares = (params: { marketId: number; address?: string }) => {
  const { marketId, address } = params;
  return useQuery({
    queryKey: ["marketShares", marketId, address],
    queryFn: async () => {
      if (!address) return { yes: 0, no: 0, raw: null };

      // biome-ignore lint/suspicious/noExplicitAny: API type missing
      const response = (await rollup.market.getShares({ marketId, userAddress: address })) as any;
      console.log("response", marketId, address, response);

      return {
        yes: Number(response?.yes_shares || response?.yes || 0),
        no: Number(response?.no_shares || response?.no || 0),
        raw: response,
      };
    },
    enabled: !!address && Number.isFinite(marketId),
  });
};
