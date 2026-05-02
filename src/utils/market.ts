import dayjs from "dayjs";
import type { Market } from "@/types";
import { parseUsd } from "./token";

export function deriveMarketState(market: Market | null | undefined) {
  if (!market) {
    return {
      liveProbability: 50,
      isPastResolution: false,
      resolvedOutcome: null,
      isFullyResolved: false,
      isAwaitingResolution: false,
      isFrozen: false,
      buyYesPrice: BigInt(50),
      sellYesPrice: BigInt(50),
      buyNoPrice: BigInt(50),
      sellNoPrice: BigInt(50),
    };
  }
  const { bestAsk, bestBid } = market;

  // Resolution state
  const isPastResolution = dayjs().isAfter(market.resolutionTime);
  const resolvedOutcome = market.outcome ?? null;
  const isFullyResolved = isPastResolution && resolvedOutcome !== null;
  const isAwaitingResolution = isPastResolution && resolvedOutcome === null;
  const isFrozen = isPastResolution;

  // Computed prices for the trade panel
  const oneDollar = parseUsd(1);
  const fiftyCents = parseUsd(0.5);
  const buyYesPrice = bestAsk ?? fiftyCents;
  const buyNoPrice = oneDollar - (bestBid ?? fiftyCents);
  const sellYesPrice = bestBid ?? fiftyCents;
  const sellNoPrice = oneDollar - (bestAsk ?? fiftyCents);

  return {
    liveProbability: market.probability,
    isPastResolution,
    resolvedOutcome,
    isFullyResolved,
    isAwaitingResolution,
    isFrozen,
    buyYesPrice,
    sellYesPrice,
    buyNoPrice,
    sellNoPrice,
  };
}

export function calculateProbability(bestBid: bigint | null, bestAsk: bigint | null): number {
  const fiftyCents = parseUsd(0.5);
  let prob: bigint;

  if (bestBid != null && bestAsk != null) {
    prob = (bestBid + bestAsk) / BigInt(2);
  } else if (bestBid != null) {
    prob = bestBid;
  } else if (bestAsk != null) {
    prob = bestAsk;
  } else {
    prob = fiftyCents;
  }

  return Math.round(Number(prob) / 10000);
}
