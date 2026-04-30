import { useQuery } from "@tanstack/react-query";
import { indexerApiBaseUrl } from "@/config/env";

export type Trade = {
  id: number;
  marketId: number;
  makerOrderId: number;
  takerOrderId: number;
  price: number;
  quantity: number;
  buyer: string;
  seller: string;
  settlementKind: "mint_pair" | "transfer_yes" | "transfer_no" | "merge_pair";
  timestamp: number;
  txHash: string;
};

export const useGetRecentTrades = (params: { marketId: number; limit?: number }) => {
  const { marketId, limit = 50 } = params;

  return useQuery({
    queryKey: ["recentTrades", marketId, limit],
    queryFn: async (): Promise<Trade[]> => {
      const res = await fetch(
        `${indexerApiBaseUrl}/api/v1/markets/${marketId}/trades?limit=${limit}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch recent trades");
      }
      const json = await res.json();
      return json.data || [];
    },
    enabled: Number.isFinite(marketId),
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });
};
