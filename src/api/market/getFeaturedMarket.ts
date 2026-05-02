import { useQuery } from "@tanstack/react-query";
import { keysToCamelCase, formatTimeUntil } from "@/utils";
import { http } from "@/api/utils";

/** Format a raw integer volume (in micro-units, 6 decimals) to a human-readable string */
function formatVolume(raw: number): string {
  const dollars = raw / 1_000_000;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  if (dollars > 0 && dollars < 10) return `$${dollars.toFixed(2)}`;
  return `$${dollars.toFixed(0)}`;
}

/** Convert best bid/ask to a probability number (0-100) */
function midPriceToProb(m: any): number {
  if (m.bestBid != null && m.bestAsk != null) return Math.round((m.bestBid + m.bestAsk) / 2);
  if (m.bestBid != null) return m.bestBid;
  if (m.bestAsk != null) return m.bestAsk;
  return 50;
}



export const getFeaturedMarket = async () => {
  const res = await http.get("/markets", { params: { limit: 1 } });
  const data = res.data.data;

  if (!data || data.length === 0) {
    throw new Error("No markets available");
  }

  const m = keysToCamelCase(data[0]);
  const prob = midPriceToProb(m);

  return {
    id: m.id.toString(),
    tag: "FEATURED MARKET",
    volume: formatVolume(Number(m.totalVolume ?? 0)),
    titlePrefix: m.question,
    titleHighlight: "",
    titleSuffix: "",
    probability: `${prob}%`,
    endsIn: formatTimeUntil(Number(m.resolutionTime)),
    yesPrice: `${prob}¢`,
    noPrice: `${100 - prob}¢`,
    currentOdds: prob > 0 ? `${(100 / prob).toFixed(2)}x` : "—",
  };
};

export const useGetFeaturedMarket = () => {
  return useQuery({
    queryKey: ["featuredMarket"],
    queryFn: () => getFeaturedMarket(),
  });
};
