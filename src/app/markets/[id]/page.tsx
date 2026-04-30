"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMarketChart, useMarketDetail } from "@/api/market";
import { useOrderbook } from "@/api/orderbook";
import {
  MarketDepthChart,
  MarketDetailHeader,
  MarketDetailSkeleton,
  MarketPriceChart,
  OrderBook,
  RecentActivity,
  RulesAndResolution,
  TradePanel,
  YourPosition,
} from "@/components/market";
import { OpenOrdersList } from "@/components/market/OpenOrdersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id || "unknown";

  const marketId = typeof id === "string" ? Number(id) : Number(id[0] || 0);
  const { data: market, isLoading, error } = useMarketDetail({ id: marketId });
  const { bids, asks, isConnected } = useOrderbook({ marketId });
  const [resolution, setResolution] = useState<"1m" | "15m" | "1h" | "1d" | "1w" | "all">("all");
  const { data: chartDataResponse } = useMarketChart({ marketId, resolution });
  const chartData = chartDataResponse?.data || [];
  const [activeTab, setActiveTab] = useState<"chart" | "orderbook">("chart");

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

  // Format chart data with resolution-aware labels
  const formattedChartData = [...chartData]
    .sort((a, b) => Number(a.time) - Number(b.time))
    .map((d) => {
      const date = new Date(Number(d.time));

      // Determine format based on resolution
      let timeLabel: string;
      if (resolution === "all" || resolution === "1w" || resolution === "1d") {
        timeLabel = date.toLocaleDateString([], { month: "short", day: "numeric" });
      } else {
        timeLabel = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      return {
        time: timeLabel,
        fullTime: date.toLocaleString(), // for tooltip
        price: d.price / 100,
        volume: Math.random() * 100 + 20,
      };
    });

  // If market is resolved, append terminal data point
  if (isFullyResolved && formattedChartData.length > 0) {
    const terminalPrice = resolvedOutcome === "yes" ? 100 : 0;
    const resolutionMs = new Date(market.resolutionTime).getTime();
    const date = new Date(resolutionMs);
    const terminalTime =
      resolution === "all" || resolution === "1w" || resolution === "1d"
        ? date.toLocaleDateString([], { month: "short", day: "numeric" })
        : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    formattedChartData.push({
      time: terminalTime,
      fullTime: date.toLocaleString(),
      price: terminalPrice,
      volume: 50,
    });
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
            volume={market.volume}
            liquidity={market.liquidity}
          />

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "chart" | "orderbook")}
            className="w-full"
          >
            <TabsList
              variant="line"
              className="w-full justify-start border-b border-border/50 rounded-none h-auto p-0 flex gap-4"
            >
              <TabsTrigger
                value="chart"
                className="pb-4 px-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] rounded-none after:bottom-0 data-active:after:bg-emerald-500 data-active:text-white"
              >
                Price Chart
              </TabsTrigger>
              <TabsTrigger
                value="orderbook"
                className="pb-4 px-2 text-[10px] font-sans font-bold uppercase tracking-[0.2em] rounded-none after:bottom-0 data-active:after:bg-emerald-500 data-active:text-white"
              >
                Orderbook
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chart" className="pt-6">
              <MarketPriceChart
                chartData={formattedChartData}
                resolution={resolution}
                onResolutionChange={setResolution}
                isConnected={isConnected}
              />
            </TabsContent>
            <TabsContent value="orderbook" className="pt-6 flex flex-col gap-6">
              <MarketDepthChart bids={bids} asks={asks} />
              <OrderBook bids={bids} asks={asks} />
            </TabsContent>
          </Tabs>

          <OpenOrdersList marketId={marketId} />

          <RulesAndResolution resolver={market.resolver} resolutionTime={market.resolutionTime} />

          <div className="mt-8">
            <RecentActivity marketId={marketId} />
          </div>
        </div>

        {/* Right Column: Trade Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <YourPosition marketId={marketId} yesPrice={buyYesPrice} noPrice={buyNoPrice} />

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
        </div>
      </div>
    </div>
  );
}
