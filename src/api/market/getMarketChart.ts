import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import type { ChartResponse } from "@/types";

export const getMarketChart = async (
  marketId: number,
  resolution: string,
): Promise<ChartResponse> => {
  const now = Date.now();
  let startTime: number | undefined;

  // Map resolution to startTime for the Indexer API
  switch (resolution) {
    case "1h":
      startTime = now - 60 * 60 * 1000;
      break;
    case "1d":
      startTime = now - 24 * 60 * 60 * 1000;
      break;
    case "1w":
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case "all":
    default:
      startTime = undefined; // No filter, fetch everything (limited by indexer limit)
      break;
  }

  const res = await http.get(`/markets/${marketId}/chart`, {
    params: { startTime, limit: 1000 },
  });

  const data = res.data;

  if (data.success && Array.isArray(data.data)) {
    data.data = data.data.map((point: any) => {
      const bestBid = point.best_bid;
      const bestAsk = point.best_ask;
      let midPrice = 0;

      if (bestBid !== null && bestAsk !== null) {
        midPrice = Math.floor((Number(bestBid) + Number(bestAsk)) / 2);
      } else if (bestBid !== null) {
        midPrice = Number(bestBid);
      } else if (bestAsk !== null) {
        midPrice = Number(bestAsk);
      }

      return {
        time: point.timestamp,
        price: midPrice,
      };
    });
  }

  return data;
};

export const useMarketChart = (params: { marketId: number; resolution: string }) => {
  const { marketId, resolution } = params;
  return useQuery({
    queryKey: ["marketChart", marketId, resolution],
    queryFn: () => getMarketChart(marketId, resolution),
    enabled: Number.isFinite(marketId) && !!resolution,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
