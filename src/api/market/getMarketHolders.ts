import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import { keysToCamelCase } from "@/utils";

export interface Holder {
  userAddress: string;
  quantity: number;
}

export interface MarketHoldersResponse {
  yesHolders: Holder[];
  noHolders: Holder[];
}

export const getMarketHolders = async (marketId: number): Promise<MarketHoldersResponse> => {
  const res = await http.get(`/markets/${marketId}/holders`);
  return keysToCamelCase(res.data.data) as MarketHoldersResponse;
};

export const useMarketHolders = (params: { marketId: number }) => {
  const { marketId } = params;
  return useQuery<MarketHoldersResponse>({
    queryKey: ["marketHolders", marketId],
    queryFn: () => getMarketHolders(marketId),
  });
};
