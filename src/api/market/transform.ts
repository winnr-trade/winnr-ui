import type { Market, Resolver } from "@/types";
import { calculateProbability, priceToUnits } from "@/utils";

export const transformMarketResponse = (m: any): Market => {
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
    category: m.category || "General",
    subcategory: m.subcategory || "MARKET",
    question: m.marketQuestion || m.question,
    probability: probability,
    totalVolume: BigInt(m.totalVolume ?? 0),
    totalShares: BigInt(m.totalShares ?? 0),
    totalSharesVolume: BigInt(m.totalSharesVolume ?? 0),
    resolutionTime: Number(m.resolutionTime),
    outcome: m.outcome ?? null,
    status: m.status || "active",
    creator: m.creator || "",
    collateralToken: m.collateralToken || "",
    createdAt: Number(m.createdAt || 0),
    eventNumber: Number(m.eventNumber || 0),
    txHash: m.txHash || "",
    resolver,
    bestBid,
    bestAsk,
  };
};
