import { useQuery } from "@tanstack/react-query";
import { indexerApiBaseUrl } from "@/config/env";

/** Convert a mid_price in basis points (0-10000) to a percentage string */
function midPriceToChance(midPrice: number | null): string {
  if (midPrice == null) return "50%";
  return `${Math.round(midPrice / 100)}%`;
}

export const useGetNewestMarkets = () => {
  return useQuery({
    queryKey: ["newestMarkets"],
    queryFn: async () => {
      const res = await fetch(`${indexerApiBaseUrl}/api/v1/markets?limit=10`);
      if (!res.ok) throw new Error("Failed to fetch newest markets");
      const json = await res.json();

      // biome-ignore lint/suspicious/noExplicitAny: indexer response
      return json.data.map((m: any) => ({
        id: m.id.toString(),
        title: m.question,
        tags: ["General", "Recently Added"],
        metricLabel: "Current Chance",
        metricValue: midPriceToChance(m.latest_mid_price),
        metricColor: "text-primary",
        iconName: "check",
      }));
    },
  });
};
