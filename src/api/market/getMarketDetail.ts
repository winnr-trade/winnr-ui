import { useQuery } from "@tanstack/react-query";
import { http } from "@/api/utils";
import type { Market, Resolver } from "@/types";
import { calculateProbability, keysToCamelCase, priceToUnits } from "@/utils";

export const getMarketDetail = async (id: number): Promise<Market> => {
  const m = await http.get(`/markets/${id}`).then((res) => keysToCamelCase(res.data.data));

  let resolver: Resolver;
  if (m.resolverType === "address") {
    resolver = { type: "address", config: m.resolverConfig };
  } else if (m.resolverType === "pyth") {
    resolver = { type: "pyth", config: m.resolverConfig };
  } else if (m.resolverType === "optimistic") {
    resolver = { type: "optimistic", config: {} };
  } else {
    resolver = { type: "unknown", config: {} };
  }

  const bestBid = m.bestBid ? priceToUnits(m.bestBid, 6) : null;
  const bestAsk = m.bestAsk ? priceToUnits(m.bestAsk, 6) : null;

  const probability = calculateProbability(bestBid, bestAsk);

  return {
    id: m.id.toString(),
    category: "General",
    subcategory: "MARKET",
    question: m.question,
    probability: probability,
    totalVolume: BigInt(m.totalVolume ?? 0),
    totalShares: BigInt(m.totalShares ?? 0),
    resolutionTime: Number(m.resolutionTime),
    outcome: m.outcome ?? null,
    resolver,
    bestBid,
    bestAsk,
  };
};

export const useMarketDetail = (params: { id: number }) => {
  const { id } = params;
  return useQuery<Market>({
    queryKey: ["marketDetail", id],
    queryFn: () => getMarketDetail(id),
  });
};
