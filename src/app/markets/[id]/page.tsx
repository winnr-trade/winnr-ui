"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMarketDetail } from "@/api/market";
import {
  MarketDetailHeader,
  MarketDetailSkeleton,
  MarketPriceChart,
  RecentActivity,
  RulesAndResolution,
} from "@/components/market";
import { OpenOrdersList, OrderBook, TradePanel, YourPosition } from "@/components/orders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketPage() {
  const params = useParams();
  const marketId = Number(params.id || 0);

  const { data: market, isLoading, error } = useMarketDetail({ id: marketId });
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

  return (
    <div className="container mx-auto p-6 max-w-8xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Middle Column: Main Content */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <MarketDetailHeader marketId={marketId} />

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
              <MarketPriceChart marketId={marketId} />
            </TabsContent>
            <TabsContent value="orderbook" className="pt-6">
              <OrderBook marketId={marketId} />
            </TabsContent>
          </Tabs>

          <OpenOrdersList marketId={marketId} />

          <RulesAndResolution marketId={marketId} />

          <div className="mt-8">
            <RecentActivity marketId={marketId} />
          </div>
        </div>

        {/* Right Column: Trade Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <YourPosition marketId={marketId} />
          <TradePanel marketId={marketId} />
        </div>
      </div>
    </div>
  );
}
