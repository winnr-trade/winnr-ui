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
      volume: Math.random() * 100 + 20, // Mock volume for visual bars
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
    formattedChartData.push({ time: terminalTime, price: terminalPrice, volume: 50 });
  }

  return (
    <div className="container mx-auto p-6 max-w-8xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Middle Column: Main Content */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
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
            resolutionDate={market.resolutionDate}
          />

          <MarketPriceChart
            chartData={formattedChartData}
            resolution={resolution}
            onResolutionChange={setResolution}
            isConnected={isConnected}
          />

          <OpenOrdersList marketId={marketId} />

          {/* Rules & Resolution Card */}
          <div className="border border-border bg-surface-container-low p-6 flex flex-col gap-4 mt-2">
            <div className="text-[10px] uppercase font-sans font-bold text-muted-foreground tracking-widest">
              RULES & RESOLUTION
            </div>
            <div className="text-sm text-white font-sans leading-relaxed">
              This market will resolve to "Yes" if the price of Bitcoin (BTC) reaches or exceeds
              $100,000.00 USD according to the specified data source at any point between the
              market's creation and December 31, 2024, 11:59:59 PM ET.
            </div>
            <div className="text-sm text-muted-foreground font-sans">
              Resolution source: Binance BTC/USDT spot market.
            </div>
          </div>

          <div className="mt-8">
            <RecentActivity yesPrice={market.yesPrice} noPrice={market.noPrice} />
          </div>
        </div>

        {/* Right Column: Trade Panel & Order Book */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
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

          {/* Stats Panel moved from Chart */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-border p-4 flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-widest">
                24H VOLUME
              </span>
              <span className="text-xl font-heading font-bold text-white">{market.volume}</span>
            </div>
            <div className="border border-border p-4 flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-widest">
                LIQUIDITY
              </span>
              <span className="text-xl font-heading font-bold text-white">{market.liquidity}</span>
            </div>
          </div>

          <OrderBook bids={bids} asks={asks} />
        </div>
      </div>
    </div>
  );
}
