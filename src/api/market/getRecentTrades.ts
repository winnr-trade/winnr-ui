import { useQuery } from "@tanstack/react-query";
import { keysToCamelCase } from "@/utils";
import { http } from "@/api/utils";
import { Trade } from "@/types";

export const getRecentTrades = async (marketId: number, limit: number = 20): Promise<Trade[]> => {
  const res = await http.get(`/markets/${marketId}/trades`, { params: { limit } });
  const data = keysToCamelCase(res.data.data || []);
  return data;
};

export const useGetRecentTrades = (params: { marketId: number; limit?: number }) => {
  const { marketId, limit = 20 } = params;

  return useQuery<Trade[]>({
    queryKey: ["recentTrades", marketId, limit],
    queryFn: () => getRecentTrades(marketId, limit),
    enabled: Number.isFinite(marketId),
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });
};
