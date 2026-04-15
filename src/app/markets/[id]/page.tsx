"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMarketChart, useMarketDetail } from "@/api/market";
import { useOrderbook } from "@/api/orderbook";
import {
  MarketDetailHeader,
  MarketDetailSkeleton,
  MarketPriceChart,
  OrderBook,
  RecentActivity,
  TradePanel,
} from "@/components/market";

export default function MarketPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id || "unknown";

  const marketId = typeof id === "string" ? Number(id) : Number(id[0] || 0);
  const { data: market, isLoading, error } = useMarketDetail(marketId);
  const { bids, asks, isConnected } = useOrderbook(marketId);
  const [resolution, setResolution] = useState<"1m" | "15m" | "1h" | "1d" | "1w" | "all">("all");
  const { data: chartDataResponse } = useMarketChart(marketId, resolution);
  const chartData = chartDataResponse?.data || [];

  if (isLoading) {
    return <MarketDetailSkeleton />;
  }

  if (error || !market) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500 font-sans">
        Market not found or failed to load.
      </div>
    );
  }

  // Derive orderbook pricing
  const sortedAsks = [...asks].sort((a, b) => b[0] - a[0]).slice(0, 5);
  const sortedBids = [...bids].sort((a, b) => b[0] - a[0]).slice(0, 5);
  const lowestAsk = sortedAsks.length > 0 ? sortedAsks[sortedAsks.length - 1][0] : null;
  const highestBid = sortedBids.length > 0 ? sortedBids[0][0] : null;

  let liveProbability = market.probability;
  if (lowestAsk !== null && highestBid !== null) {
    liveProbability = `${Math.round((lowestAsk + highestBid) / 2)}%`;
  } else if (highestBid !== null) {
    liveProbability = `${Math.round(highestBid)}%`;
  } else if (lowestAsk !== null) {
    liveProbability = `${Math.round(lowestAsk)}%`;
  }

  // Resolution state
  const isPastResolution = Date.now() >= new Date(market.resolutionTime).getTime();
  const resolvedOutcome: "yes" | "no" | null = market.outcome ?? null;
  const isFullyResolved = isPastResolution && resolvedOutcome !== null;
  const isAwaitingResolution = isPastResolution && resolvedOutcome === null;
  const isFrozen = isPastResolution;

  // Computed prices for the trade panel
  const buyYesPrice = lowestAsk !== null ? lowestAsk : parseFloat(market.yesPrice);
  const buyNoPrice = highestBid !== null ? 100 - highestBid : parseFloat(market.noPrice);

  // Format chart data
  const formattedChartData = chartData.map((d) => {
    const date = new Date(Number(d.time));
    return {
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      price: d.price / 100,
    };
  });

  // If market is resolved, append terminal data point at 0 or 100
  if (isFullyResolved && formattedChartData.length > 0) {
    const terminalPrice = resolvedOutcome === "yes" ? 100 : 0;
    const resolutionMs = new Date(market.resolutionTime).getTime();
    const terminalTime = new Date(resolutionMs).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    formattedChartData.push({ time: terminalTime, price: terminalPrice });
  }

  return (
    <div className="container mx-auto p-6 flex flex-col gap-8 max-w-[1400px]">
      {/* Header Section */}
      <MarketDetailHeader
        category={market.category}
        subcategory={market.subcategory}
        titlePrefix={market.titlePrefix}
        titleHighlight={market.titleHighlight}
        titleSuffix={market.titleSuffix}
        liveProbability={liveProbability}
        isFullyResolved={isFullyResolved}
        isAwaitingResolution={isAwaitingResolution}
        resolvedOutcome={resolvedOutcome}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column: Chart & Info */}
        <div className="lg:col-span-2 flex gap-6 flex-col">
          {/* Main Chart Card */}
          <MarketPriceChart
            chartData={formattedChartData}
            resolution={resolution}
            onResolutionChange={setResolution}
            isConnected={isConnected}
            volume={market.volume}
            liquidity={market.liquidity}
            resolutionDate={market.resolutionDate}
          />

          {/* Under Chart: Order Book & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <OrderBook bids={bids} asks={asks} />
            <RecentActivity yesPrice={market.yesPrice} noPrice={market.noPrice} />
          </div>
        </div>

        {/* Right Column: Take Position Panel */}
        <div className="flex flex-col gap-6">
          <TradePanel
            marketId={marketId}
            buyYesPrice={buyYesPrice}
            buyNoPrice={buyNoPrice}
            isFrozen={isFrozen}
            isFullyResolved={isFullyResolved}
            isAwaitingResolution={isAwaitingResolution}
          />
        </div>
      </div>
    </div>
  );
}
