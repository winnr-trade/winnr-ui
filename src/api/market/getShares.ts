import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";

export interface MarketShares {
  yes: number;
  no: number;
}

export const getMarketShares = async (
  marketId: number,
  address?: string,
): Promise<MarketShares> => {
  if (!address) return { yes: 0, no: 0 };

  // biome-ignore lint/suspicious/noExplicitAny: API type missing
  const response = (await rollup.market.getShares({ marketId, userAddress: address })) as any;

  return {
    yes: Number(response?.yes_shares || response?.yes || 0),
    no: Number(response?.no_shares || response?.no || 0),
  };
};

export const useGetShares = (params: { marketId: number; address?: string }) => {
  const { marketId, address } = params;
  return useQuery({
    queryKey: ["marketShares", marketId, address],
    queryFn: () => getMarketShares(marketId, address),
    enabled: !!address && Number.isFinite(marketId),
  });
};
