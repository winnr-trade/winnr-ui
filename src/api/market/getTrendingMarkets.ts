import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import { calculateProbability, keysToCamelCase, priceToUnits } from "@/utils";

/** Format a raw integer volume (in micro-units, 6 decimals) to a human-readable string */
function formatVolume(raw: number): string {
  const dollars = raw / 1_000_000;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  if (dollars > 0 && dollars < 10) return `$${dollars.toFixed(2)}`;
  return `$${dollars.toFixed(0)}`;
}

export const getTrendingMarkets = async (limit: number = 10) => {
  const res = await http.get("/markets", { params: { limit } });
  const data = keysToCamelCase(res.data.data) as any[];

  return data
    .map((m: any) => {
      const bestBid = m.bestBid ? priceToUnits(m.bestBid, 6) : null;
      const bestAsk = m.bestAsk ? priceToUnits(m.bestAsk, 6) : null;

      const displayChance = calculateProbability(
        bestBid ? BigInt(bestBid) : null,
        bestAsk ? BigInt(bestAsk) : null,
      );

      return {
        id: m.id.toString(),
        title: m.question,
        category: "Miscellaneous",
        chance: `${displayChance}%`,
        chanceNum: displayChance,
        volume: formatVolume(Number(m.totalVolume ?? 0)),
        resolutionTime: m.resolutionTime,
        iconName: "activity",
      };
    })
    .reverse();
};

export const useGetTrendingMarkets = () => {
  return useQuery({
    queryKey: ["trendingMarkets"],
    queryFn: () => getTrendingMarkets(),
  });
};
