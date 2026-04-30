import { useQuery } from "@tanstack/react-query";
import { indexerApiBaseUrl } from "@/config/env";

/** Format a raw integer volume (in micro-units, 6 decimals) to a human-readable string */
function formatVolume(raw: number): string {
  const dollars = raw / 1_000_000;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  return `$${dollars.toFixed(0)}`;
}

/** Convert a mid_price in basis points (0-10000) to a percentage string */
function midPriceToChance(midPrice: number | null): string {
  if (midPrice == null) return "50%";
  return `${Math.round(midPrice / 100)}%`;
}

export const useGetTrendingMarkets = () => {
  return useQuery({
    queryKey: ["trendingMarkets"],
    queryFn: async () => {
      const res = await fetch(`${indexerApiBaseUrl}/api/v1/markets?limit=10`);
      if (!res.ok) throw new Error("Failed to fetch trending markets");
      const json = await res.json();

      // biome-ignore lint/suspicious/noExplicitAny: indexer response
      return json.data
        .map((m: any) => {
          const chanceNum = m.latest_mid_price != null ? Math.round(m.latest_mid_price / 100) : 50;
          return {
            id: m.id.toString(),
            title: m.question,
            category: "Miscellaneous",
            chance: `${chanceNum}%`,
            chanceNum,
            volume: formatVolume(Number(m.volume ?? 0)),
            resolutionTime: m.resolution_time,
            iconName: "activity",
          };
        })
        .reverse();
    },
  });
};
