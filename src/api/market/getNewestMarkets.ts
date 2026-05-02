import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import { calculateProbability, keysToCamelCase, priceToUnits } from "@/utils";

export const getNewestMarkets = async (limit: number = 10) => {
  const res = await http.get("/markets", { params: { limit } });
  const data = keysToCamelCase(res.data.data) as any[];

  return data.map((m: any) => {
    const bestBid = m.bestBid ? priceToUnits(m.bestBid, 6) : null;
    const bestAsk = m.bestAsk ? priceToUnits(m.bestAsk, 6) : null;
    const chance = calculateProbability(bestBid, bestAsk);

    return {
      id: m.id.toString(),
      title: m.question,
      tags: ["General", "Recently Added"],
      metricLabel: "Current Chance",
      metricValue: `${chance}%`,
      metricColor: "text-primary",
      iconName: "check",
    };
  });
};

export const useGetNewestMarkets = () => {
  return useQuery({
    queryKey: ["newestMarkets"],
    queryFn: () => getNewestMarkets(),
  });
};
