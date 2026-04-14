import { useQuery } from "@tanstack/react-query";
import { indexerApiBaseUrl } from "@/config/env";

/** Format a raw integer volume (in micro-units, 6 decimals) to a human-readable string */
function formatVolume(raw: number): string {
  const dollars = raw / 1_000_000;
  if (dollars >= 1_000_000) return `~$${(dollars / 1_000_000).toFixed(1)}M Volume`;
  if (dollars >= 1_000) return `~$${(dollars / 1_000).toFixed(1)}K Volume`;
  return `~$${dollars.toFixed(0)} Volume`;
}

/** Convert a mid_price in basis points (0-10000) to a probability number (0-100) */
function midPriceToProb(midPrice: number | null): number {
  if (midPrice == null) return 50;
  return Math.round(midPrice / 100);
}

/** Estimate time remaining until resolution */
function timeUntil(resolutionTime: number): string {
  const diff = resolutionTime - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d : ${hours}h`;
  return `${hours}h`;
}

export const useGetFeaturedMarket = () => {
  return useQuery({
    queryKey: ["featuredMarket"],
    queryFn: async () => {
      const res = await fetch(`${indexerApiBaseUrl}/api/v1/markets?limit=1`);
      if (!res.ok) throw new Error("Failed to fetch featured market");
      const json = await res.json();

      if (!json.data || json.data.length === 0) {
        throw new Error("No markets available");
      }

      // biome-ignore lint/suspicious/noExplicitAny: indexer response
      const m: any = json.data[0];
      const prob = midPriceToProb(m.latest_mid_price);

      return {
        id: m.id.toString(),
        tag: "FEATURED MARKET",
        volume: formatVolume(Number(m.volume ?? 0)),
        titlePrefix: m.question,
        titleHighlight: "",
        titleSuffix: "",
        probability: `${prob}%`,
        endsIn: timeUntil(Number(m.resolution_time)),
        yesPrice: `${prob}¢`,
        noPrice: `${100 - prob}¢`,
        currentOdds: prob > 0 ? `${(100 / prob).toFixed(2)}x` : "—",
      };
    },
  });
};
