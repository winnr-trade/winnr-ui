import { useQuery } from "@tanstack/react-query";
import { rollup } from "@/api/utils";

export const useMarketDetail = (id: number) => {
  return useQuery({
    queryKey: ["marketDetail", id],
    queryFn: async () => {
      // biome-ignore lint/suspicious/noExplicitAny: API type missing
      const m = (await rollup.market.get(id)) as any;

      const totalShares = m.total_yes_shares + m.total_no_shares;
      const prob = totalShares === 0 ? 50 : Math.round((m.total_yes_shares / totalShares) * 100);
      
      const resolutionDate = new Date(m.resolution_time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return {
        category: "General",
        subcategory: "MARKET",
        titlePrefix: m.question,
        titleHighlight: "",
        titleSuffix: "",
        probability: `${prob}%`,
        volume: `$${m.volume ?? 0}`,
        liquidity: "$0", // Pending actual liquidity calculation
        resolutionDate,
        resolutionTime: m.resolution_time, // raw timestamp for comparison
        outcome: m.outcome ?? null, // "yes" | "no" | null
        yesPrice: `${prob.toFixed(1)}¢`,
        noPrice: `${(100 - prob).toFixed(1)}¢`,
      };
    },
  });
};
