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
import { OpenOrdersList } from "@/components/market/OpenOrdersList";

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
  const sellYesPrice = highestBid !== null ? highestBid : parseFloat(market.yesPrice);

  const buyNoPrice = highestBid !== null ? 100 - highestBid : parseFloat(market.noPrice);
  const sellNoPrice = lowestAsk !== null ? 100 - lowestAsk : parseFloat(market.noPrice);

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
        <div className="lg:col-span-2 flex flex-col gap-6">
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
          <OpenOrdersList marketId={marketId} />
        </div>

        {/* Right Column: Take Position Panel & Order Book */}
        <div className="flex flex-col gap-6">
          <TradePanel
            marketId={marketId}
            buyYesPrice={buyYesPrice}
            sellYesPrice={sellYesPrice}
            buyNoPrice={buyNoPrice}
            sellNoPrice={sellNoPrice}
            isFrozen={isFrozen}
            isFullyResolved={isFullyResolved}
            isAwaitingResolution={isAwaitingResolution}
          />
          <OrderBook bids={bids} asks={asks} />

          {/* Static Vault Integration Card from Design */}
          <div className="bg-surface-container border-0 rounded-sm p-6 relative overflow-hidden flex flex-col items-center text-center mt-2 group cursor-pointer">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(172,234,211,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="size-32 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 border border-primary/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-2 border border-primary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
              <div className="size-2 bg-primary rounded-full shadow-[0_0_15px_rgba(172,234,211,0.8)]"></div>
            </div>
            <h4 className="text-lg font-heading font-bold text-white mb-2 relative z-10">
              Vault Integration
            </h4>
            <p className="text-xs text-muted-foreground font-sans mb-4 relative z-10 leading-relaxed">
              Auto-hedge your positions through our managed liquidity vaults.
            </p>
            <span className="text-[9px] font-sans font-bold text-primary tracking-widest uppercase relative z-10">
              Explore Vaults →
            </span>
          </div>
        </div>
      </div>

      {/* Full Width Recent Activity Row */}
      <div className="mt-8">
        <RecentActivity yesPrice={market.yesPrice} noPrice={market.noPrice} />
      </div>
    </div>
  );
}
