import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import type { ChartResponse } from "@/types";

export const getMarketChart = async (
  marketId: number,
  resolution: string,
): Promise<ChartResponse> => {
  const res = await http.get(`/markets/${marketId}/chart`, {
    params: { resolution },
  });
  return res.data;
};

export const useMarketChart = (params: { marketId: number; resolution: string }) => {
  const { marketId, resolution } = params;
  return useQuery({
    queryKey: ["marketChart", marketId, resolution],
    queryFn: () => getMarketChart(marketId, resolution),
    enabled: Number.isFinite(marketId) && !!resolution,
    refetchInterval: 60000, // optionally refetch every minute
  });
};
