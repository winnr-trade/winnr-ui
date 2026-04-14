import { useQuery } from "@tanstack/react-query";
import { indexerApiBaseUrl } from "@/config/env";

export type ChartDataPoint = {
  time: string; // The backend returns it as a stringified timestamp, e.g., "1775692800000"
  price: number; // e.g. 4753 basis points
};

export type ChartResponse = {
  success: boolean;
  resolution: string;
  data: ChartDataPoint[];
};

export const useMarketChart = (marketId: number, resolution: string) => {
  return useQuery({
    queryKey: ["marketChart", marketId, resolution],
    queryFn: async (): Promise<ChartResponse> => {
      const res = await fetch(
        `${indexerApiBaseUrl}/api/v1/markets/${marketId}/chart?resolution=${resolution}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch market chart data");
      }
      return res.json();
    },
    enabled: Number.isFinite(marketId) && !!resolution,
    refetchInterval: 60000, // optionally refetch every minute
  });
};
