import dayjs from "dayjs";
import type { Market, PortfolioPosition } from "@/types";
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

export function calculateMidPrice(bestBid: bigint | null, bestAsk: bigint | null): bigint {
  const fiftyCents = parseUsd(0.5);
  let midPrice: bigint;

  if (bestBid != null && bestAsk != null) {
    midPrice = (bestBid + bestAsk) / BigInt(2);
  } else if (bestBid != null) {
    midPrice = bestBid;
  } else if (bestAsk != null) {
    midPrice = bestAsk;
  } else {
    midPrice = fiftyCents;
  }

  return midPrice;
}

export function calculateProbability(bestBid: bigint | null, bestAsk: bigint | null): number {
  const midPrice = calculateMidPrice(bestBid, bestAsk);
  return Math.round(Number(midPrice) / 10000);
}

// ---------------------------------------------------------------------------
// Position aggregation utilities
// All prices/values are in USDC base units (10^6). 1 USDC = 1_000_000.
// ---------------------------------------------------------------------------

const ONE_DOLLAR = parseUsd(1);
const FIFTY_CENTS = parseUsd(0.5);

/** Compute avg price per share for a given side. Falls back to 50¢ if no cost data. */
function avgPrice(totalCost: bigint, shares: number): bigint {
  return totalCost > BigInt(0) ? totalCost / BigInt(shares) : FIFTY_CENTS;
}

/** Aggregate portfolio-level totals across all positions. */
export function aggregatePositions(positions: PortfolioPosition[]) {
  let totalPositionValue = BigInt(0);
  let totalPnl = BigInt(0);

  for (const pos of positions) {
    const midPrice = calculateMidPrice(pos.bestBid, pos.bestAsk);

    if (pos.quantityYes > 0) {
      const avg = avgPrice(pos.totalCostYes, pos.quantityYes);
      totalPositionValue += BigInt(pos.quantityYes) * midPrice;
      totalPnl += (midPrice - avg) * BigInt(pos.quantityYes);
    }

    if (pos.quantityNo > 0) {
      const price = ONE_DOLLAR - midPrice;
      const avg = avgPrice(pos.totalCostNo, pos.quantityNo);
      totalPositionValue += BigInt(pos.quantityNo) * price;
      totalPnl += (price - avg) * BigInt(pos.quantityNo);
    }
  }

  return { totalPositionValue, totalPnl };
}

/** Compute full portfolio summary including totals and percentages. */
export function getPortfolioSummary(balance: bigint, positions: PortfolioPosition[]) {
  const { totalPositionValue, totalPnl } = aggregatePositions(positions);
  const totalValue = balance + totalPositionValue;
  const basis = totalValue - totalPnl;
  
  // Calculate PnL % with 2 decimal places of precision before converting to Number
  const pnlPercent = basis > BigInt(0) 
    ? Number((totalPnl * BigInt(10000)) / basis) / 100 
    : 0;

  return {
    totalValue,
    totalPositionValue,
    totalPnl,
    pnlPercent,
    availableBalance: balance,
    pnlPositive: totalPnl >= BigInt(0),
  };
}

export interface FlattenedPosition {
  id: string;
  marketId: number;
  question: string;
  outcome: "YES" | "NO";
  quantity: number;
  avgPrice: bigint;
  currentPrice: bigint;
  value: bigint;
  pnl: bigint;
  pnlPercent: number;
  pnlPositive: boolean;
}

/** Flatten positions into individual YES/NO rows with derived pricing for table display. */
export function flattenPositions(positions: PortfolioPosition[]): FlattenedPosition[] {
  const rows: FlattenedPosition[] = [];

  for (const pos of positions) {
    const midPrice = calculateMidPrice(pos.bestBid, pos.bestAsk);

    if (pos.quantityYes > 0) {
      const avg = avgPrice(pos.totalCostYes, pos.quantityYes);
      const value = BigInt(pos.quantityYes) * midPrice;
      const pnl = (midPrice - avg) * BigInt(pos.quantityYes);
      const pnlPercent = avg > BigInt(0) ? Number(((midPrice - avg) * BigInt(10000)) / avg) / 100 : 0;

      rows.push({
        id: `${pos.marketId}-yes`,
        marketId: pos.marketId,
        question: pos.question,
        outcome: "YES",
        quantity: pos.quantityYes,
        avgPrice: avg,
        currentPrice: midPrice,
        value,
        pnl,
        pnlPercent,
        pnlPositive: pnl >= BigInt(0),
      });
    }

    if (pos.quantityNo > 0) {
      const price = ONE_DOLLAR - midPrice;
      const avg = avgPrice(pos.totalCostNo, pos.quantityNo);
      const value = BigInt(pos.quantityNo) * price;
      const pnl = (price - avg) * BigInt(pos.quantityNo);
      const pnlPercent = avg > BigInt(0) ? Number(((price - avg) * BigInt(10000)) / avg) / 100 : 0;

      rows.push({
        id: `${pos.marketId}-no`,
        marketId: pos.marketId,
        question: pos.question,
        outcome: "NO",
        quantity: pos.quantityNo,
        avgPrice: avg,
        currentPrice: price,
        value,
        pnl,
        pnlPercent,
        pnlPositive: pnl >= BigInt(0),
      });
    }
  }

  return rows;
}
