"use client";

import { ArrowDown, ArrowUp, History, Hourglass, ListOrdered, Loader2, Lock } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Area, AreaChart } from "recharts";
import { toast } from "sonner";
import { useGetShares, useMarketChart, useMarketDetail } from "@/api/market";
import { useOrderbook } from "@/api/orderbook";
import { usePlaceOrder } from "@/api/orderbook/placeOrder";
import { useGetBalance } from "@/api/wallet/useGetBalance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Display, Heading } from "@/components/ui/typography";
import { tokens } from "@/config/constants";
import { useUserWallet } from "@/hooks/useUserWallet";
import { OrderType, Outcome, Side } from "@/lib/rollup/types";
import { formatNumber } from "@/utils";

const chartConfig = {
  price: {
    label: "Price (¢)",
    color: "#9ffb06",
  },
} satisfies ChartConfig;

export default function MarketPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id || "unknown";

  const marketId = typeof id === "string" ? Number(id) : Number(id[0] || 0);
  const { data: market, isLoading, error } = useMarketDetail(marketId);
  const { bids, asks, isConnected } = useOrderbook(marketId);
  const [resolution, setResolution] = useState<"1m" | "15m" | "1h" | "1d" | "1w" | "all">("all");
  const { data: chartDataResponse } = useMarketChart(marketId, resolution);
  const chartData = chartDataResponse?.data || [];

  const [selectedOutcome, setSelectedOutcome] = useState<"YES" | "NO">("YES");
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Market);
  const [amount, setAmount] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const placeOrder = usePlaceOrder();
  const { address, signer } = useUserWallet();
  const { data: sharesData } = useGetShares(marketId, address);
  const { data: balanceData } = useGetBalance(address);
  const userBalance = balanceData ? Number(balanceData) / 10 ** tokens.usdc.decimals : 0;

  const isPastResolution = market ? Date.now() >= new Date(market.resolutionTime).getTime() : false;
  const resolvedOutcome: "yes" | "no" | null = market?.outcome ?? null;
  const isFullyResolved = isPastResolution && resolvedOutcome !== null;
  const isAwaitingResolution = isPastResolution && resolvedOutcome === null;
  const isFrozen = isPastResolution; // trading disabled in both awaiting and resolved states

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col gap-8 max-w-[1400px]">
        {/* Loading Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
          <div className="max-w-3xl w-full">
            <Skeleton className="w-32 h-6 mb-4 bg-surface-container" />
            <Skeleton className="w-full h-16 bg-surface-container mb-2" />
            <Skeleton className="w-3/4 h-16 bg-surface-container" />
          </div>
          <div className="text-right w-48">
            <Skeleton className="w-full h-24 bg-surface-container" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[450px] bg-surface-container" />
          <Skeleton className="h-[600px] bg-surface-container" />
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500 font-sans">
        Market not found or failed to load.
      </div>
    );
  }

  const sortedAsks = [...asks].sort((a, b) => b[0] - a[0]).slice(0, 5); // display top 5, highest price at top
  const sortedBids = [...bids].sort((a, b) => b[0] - a[0]).slice(0, 5); // display top 5, highest price at top
  const lowestAsk = sortedAsks.length > 0 ? sortedAsks[sortedAsks.length - 1][0] : null;
  const highestBid = sortedBids.length > 0 ? sortedBids[0][0] : null;
  const spread =
    lowestAsk !== null && highestBid !== null ? Number((lowestAsk - highestBid).toFixed(2)) : null;

  let liveProbability = market.probability;
  if (lowestAsk !== null && highestBid !== null) {
    liveProbability = `${Math.round((lowestAsk + highestBid) / 2)}%`;
  } else if (highestBid !== null) {
    liveProbability = `${Math.round(highestBid)}%`;
  } else if (lowestAsk !== null) {
    liveProbability = `${Math.round(lowestAsk)}%`;
  }

  const maxSizeAsks = sortedAsks.length > 0 ? Math.max(...sortedAsks.map((a) => a[1])) : 1;
  const maxSizeBids = sortedBids.length > 0 ? Math.max(...sortedBids.map((b) => b[1])) : 1;
  const maxSize = Math.max(maxSizeAsks, maxSizeBids) || 1;

  const formatSize = (size: number) => {
    return size >= 1000 ? (size / 1000).toFixed(1) + "K" : size.toString();
  };

  const parsedAmount = Number(amount) || 0;

  const buyYesPrice = lowestAsk !== null ? lowestAsk : parseFloat(market.yesPrice);
  const buyNoPrice = highestBid !== null ? 100 - highestBid : parseFloat(market.noPrice);

  const currentPrice = selectedOutcome === "YES" ? buyYesPrice : buyNoPrice;
  const effectivePrice = orderType === OrderType.Market ? currentPrice : Number(limitPrice) || 0;
  const shares = effectivePrice > 0 ? Math.floor(parsedAmount / (effectivePrice / 100)) : 0;

  const formattedChartData = chartData.map((d) => {
    const date = new Date(Number(d.time));
    return {
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      price: d.price / 100, // convert basis points to cents
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
  const maxPayout = shares;
  const potentialReturn = parsedAmount > 0 ? ((maxPayout - parsedAmount) / parsedAmount) * 100 : 0;

  const handleConfirmPosition = async () => {
    if (!signer) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (shares <= 0) {
      toast.error("Invalid shares calculated");
      return;
    }

    const orderPromise = placeOrder.mutateAsync({
      marketId,
      outcome: selectedOutcome === "YES" ? Outcome.Yes : Outcome.No,
      side: Side.Bid,
      price: effectivePrice,
      quantity: Math.floor(shares),
      orderType: orderType,
    });
    // const orderPromise = Promise.resolve();

    toast.promise(orderPromise, {
      loading: "Placing order...",
      success: `Successfully bought ${formatNumber(shares, 0, 0)} shares!`,
      error: (err) => `Order failed: ${err.message || "Unknown error"}`,
    });
  };

  return (
    <div className="container mx-auto p-6 flex flex-col gap-8 max-w-[1400px]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-surface-container-high px-2 py-1 rounded text-primary text-[10px] font-bold font-sans tracking-widest uppercase">
              {market.category}
            </span>
            <span className="text-muted-foreground text-[10px] font-bold font-sans tracking-widest uppercase">
              / {market.subcategory}
            </span>
          </div>
          <Display className="text-4xl md:text-6xl leading-tight">
            {market.titlePrefix}
            <span className="text-primary border-b-4 border-primary pb-1">
              {market.titleHighlight}
            </span>
            {market.titleSuffix}
          </Display>
        </div>

        <div className="text-right">
          {isFullyResolved ? (
            <>
              <div className="uppercase tracking-widest text-xs font-bold font-sans mb-1 text-muted-foreground">
                RESOLVED
              </div>
              <div
                className={`text-6xl md:text-8xl font-heading font-bold drop-shadow-[0_0_20px] ${
                  resolvedOutcome === "yes"
                    ? "text-primary drop-shadow-primary/30"
                    : "text-destructive drop-shadow-destructive/30"
                }`}
              >
                {resolvedOutcome === "yes" ? "YES" : "NO"}
              </div>
            </>
          ) : isAwaitingResolution ? (
            <>
              <div className="uppercase tracking-widest text-xs font-bold font-sans mb-1 text-yellow-500">
                AWAITING RESOLUTION
              </div>
              <div className="text-6xl md:text-8xl font-heading font-bold text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                {liveProbability}
              </div>
            </>
          ) : (
            <>
              <div className="uppercase tracking-widest text-xs text-muted-foreground font-bold font-sans mb-1">
                CURRENT PROBABILITY
              </div>
              <div className="text-6xl md:text-8xl font-heading font-bold text-primary drop-shadow-[0_0_20px_rgba(159,251,6,0.3)]">
                {liveProbability}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column: Chart & Info */}
        <div className="lg:col-span-2 flex gap-6 flex-col">
          {/* Main Chart Card */}
          <Card className="bg-surface-container-high border-0 shadow-none overflow-hidden flex flex-col relative h-[450px]">
            {/* Chart Header */}
            <div className="p-6 flex justify-between items-center z-10">
              <div className="flex gap-4 text-xs font-sans font-bold">
                {[
                  { label: "1H", val: "1h" },
                  { label: "1D", val: "1d" },
                  { label: "1W", val: "1w" },
                  { label: "ALL", val: "all" },
                ].map((res) => (
                  <button
                    type="button"
                    key={res.val}
                    onClick={() => setResolution(res.val as any)}
                    className={
                      resolution === res.val
                        ? "bg-surface-container-highest px-3 py-1.5 rounded-sm text-primary cursor-pointer active"
                        : "text-muted-foreground hover:text-foreground cursor-pointer px-3 py-1.5"
                    }
                  >
                    {res.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`size-2 rounded-full ${isConnected ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
                ></div>
                <span className="text-xs text-muted-foreground font-sans">
                  {isConnected ? "Live Updates" : "Connecting..."}
                </span>
              </div>
            </div>

            {/* Chart Graphic Area */}
            <div className="flex-1 w-full relative px-0 pb-0 flex mt-4 drop-shadow-[0_0_15px_rgba(159,251,6,0.3)]">
              <ChartContainer
                config={chartConfig}
                className="absolute inset-0 size-full z-0 h-full w-full"
              >
                <AreaChart
                  data={formattedChartData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {/* Optional Tooltip overlay details over exactly where the mouse is. The indicator draws the dot */}
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" labelKey="time" />}
                  />
                  <Area
                    type="linear"
                    dataKey="price"
                    stroke="var(--color-price)"
                    fillOpacity={1}
                    fill="url(#chartGradient)"
                    strokeWidth={4}
                  />
                </AreaChart>
              </ChartContainer>
            </div>

            {/* Bottom Stats */}
            <div className="p-6 flex justify-between items-end border-t border-surface-container-highest z-10 bg-surface-container-high w-full">
              <div>
                <div className="text-[10px] text-muted-foreground font-bold font-sans uppercase tracking-widest mb-1">
                  VOLUME
                </div>
                <div className="text-2xl font-heading font-bold text-foreground">
                  {market.volume}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-bold font-sans uppercase tracking-widest mb-1">
                  LIQUIDITY
                </div>
                <div className="text-2xl font-heading font-bold text-foreground">
                  {market.liquidity}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-bold font-sans uppercase tracking-widest mb-1">
                  RESOLUTION
                </div>
                <div className="text-2xl font-heading font-bold text-foreground">
                  {market.resolutionDate}
                </div>
              </div>
            </div>
          </Card>

          {/* Under Chart: Order Book & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* Order Book */}
            <Card className="bg-surface-container-low border-0 shadow-none p-5 h-full">
              <div className="flex items-center gap-2 mb-6">
                <ListOrdered className="size-5 text-primary" />
                <Heading className="text-lg">Order Book</Heading>
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground font-bold font-sans uppercase tracking-widest mb-3">
                <span>Price (¢)</span>
                <span>Size</span>
              </div>

              <div className="flex flex-col gap-[2px]">
                {/* Asks (Sell) */}
                {sortedAsks.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-2 font-sans">
                    No asks
                  </div>
                )}
                {sortedAsks.map(([price, size]) => (
                  <div
                    key={`ask-${price}`}
                    className="relative h-8 flex items-center justify-between px-2 text-sm"
                  >
                    <div
                      className="absolute right-0 h-full bg-surface-container-highest opacity-50 rounded-l-sm transition-all duration-300"
                      style={{ width: `${Math.min(100, (size / maxSize) * 100)}%` }}
                    ></div>
                    <span className="text-destructive/80 font-mono z-10">{price.toFixed(1)}</span>
                    <span className="font-sans text-muted-foreground z-10">{formatSize(size)}</span>
                  </div>
                ))}

                {/* Spread */}
                <div className="py-2 text-center text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-widest border-y border-surface-container border-opacity-50 my-2">
                  {spread !== null ? `SPREAD: ${spread.toFixed(1)}¢` : "SPREAD: --"}
                </div>

                {/* Bids (Buy) */}
                {sortedBids.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-2 font-sans">
                    No bids
                  </div>
                )}
                {sortedBids.map(([price, size]) => (
                  <div
                    key={`bid-${price}`}
                    className="relative h-8 flex items-center justify-between px-2 text-sm"
                  >
                    <div
                      className="absolute left-0 h-full bg-primary/20 rounded-r-sm transition-all duration-300"
                      style={{ width: `${Math.min(100, (size / maxSize) * 100)}%` }}
                    ></div>
                    <span className="text-primary font-mono font-bold z-10">
                      {price.toFixed(1)}
                    </span>
                    <span className="font-sans text-primary z-10">{formatSize(size)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-surface-container-low border-0 shadow-none p-5 h-full">
              <div className="flex items-center gap-2 mb-6">
                <History className="size-5 text-primary" />
                <Heading className="text-lg">Recent Activity</Heading>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-full bg-surface-container-highest flex items-center justify-center">
                      <ArrowUp className="size-3 text-primary" />
                    </div>
                    <span className="font-sans text-sm text-foreground">0x71...f32</span>
                  </div>
                  <span className="text-primary font-bold font-mono text-xs">
                    YES @ {market.yesPrice}
                  </span>
                  <span className="text-[10px] uppercase font-sans font-bold text-muted-foreground">
                    2m ago
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-full bg-surface-container-highest flex items-center justify-center">
                      <ArrowDown className="size-3 text-muted-foreground" />
                    </div>
                    <span className="font-sans text-sm text-foreground">whale_master</span>
                  </div>
                  <span className="text-muted-foreground font-bold font-mono text-xs">
                    NO @ {market.noPrice}
                  </span>
                  <span className="text-[10px] uppercase font-sans font-bold text-muted-foreground">
                    5m ago
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Take Position Panel */}
        <div className="flex flex-col gap-6">
          <Card className="bg-surface-container-high border-0 shadow-none p-6 sticky top-6 relative">
            <div className="flex justify-between items-center mb-6">
              <Heading className="text-xl">TAKE POSITION</Heading>

              <div className="flex bg-surface-container-low p-1 rounded-sm">
                <button
                  type="button"
                  onClick={() => setOrderType(OrderType.Market)}
                  className={`text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
                    orderType === OrderType.Market
                      ? "bg-surface-container-high text-primary shadow-[0_0_10px_rgba(159,251,6,0.1)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Market
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType(OrderType.Limit)}
                  className={`text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1.5 rounded-sm transition-all ${
                    orderType === OrderType.Limit
                      ? "bg-surface-container-high text-primary shadow-[0_0_10px_rgba(159,251,6,0.1)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>

            {/* User Position */}
            {address && (
              <div className="bg-surface-container-low rounded-lg p-3 mb-6 flex justify-between items-center text-sm font-sans border border-surface-container">
                <span className="text-muted-foreground uppercase tracking-widest font-bold text-[10px]">
                  YOUR POSITION
                </span>
                <div className="flex gap-3">
                  <span className="text-primary font-mono font-bold">
                    {formatNumber(sharesData?.yes || 0, 0, 0)} YES
                  </span>
                  <span className="text-destructive font-mono font-bold">
                    {formatNumber(sharesData?.no || 0, 0, 0)} NO
                  </span>
                </div>
              </div>
            )}

            {/* Action Toggle */}
            <div className="flex gap-4 mb-8">
              <button
                type="button"
                onClick={() => setSelectedOutcome("YES")}
                className={`flex-1 rounded-lg p-4 border text-center cursor-pointer relative transition-all duration-200 ${
                  selectedOutcome === "YES"
                    ? "bg-surface-container-low border-primary shadow-[0_0_15px_rgba(159,251,6,0.15)]"
                    : "bg-surface-container-lowest border-transparent hover:bg-surface-container-low"
                }`}
              >
                <div
                  className={`font-heading font-bold text-xl mb-1 ${selectedOutcome === "YES" ? "text-primary" : "text-foreground"}`}
                >
                  YES
                </div>
                <div
                  className={`text-xs font-sans ${selectedOutcome === "YES" ? "text-primary" : "text-muted-foreground"}`}
                >
                  {buyYesPrice.toFixed(1)}¢
                </div>
                {/* Glow active indicator */}
                {selectedOutcome === "YES" && (
                  <div className="absolute top-0 right-0 size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(159,251,6,1)] m-2 animate-pulse"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedOutcome("NO")}
                className={`flex-1 rounded-lg p-4 border text-center cursor-pointer relative transition-all duration-200 ${
                  selectedOutcome === "NO"
                    ? "bg-surface-container-low border-destructive shadow-[0_0_15px_rgba(255,50,50,0.15)]"
                    : "bg-surface-container-lowest border-transparent hover:bg-surface-container-low"
                }`}
              >
                <div
                  className={`font-heading font-bold text-xl mb-1 ${selectedOutcome === "NO" ? "text-destructive" : "text-foreground"}`}
                >
                  NO
                </div>
                <div
                  className={`text-xs font-sans ${selectedOutcome === "NO" ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {buyNoPrice.toFixed(1)}¢
                </div>
                {/* Glow active indicator */}
                {selectedOutcome === "NO" && (
                  <div className="absolute top-0 right-0 size-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(255,50,50,1)] m-2 animate-pulse"></div>
                )}
              </button>
            </div>

            {/* Input Form */}
            <div className="flex flex-col gap-6">
              {orderType === OrderType.Limit && (
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold font-sans text-foreground tracking-widest uppercase">
                      LIMIT PRICE (¢)
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="1"
                      max="99"
                      step="1"
                      className="h-16 text-3xl font-heading bg-background font-bold border-b-2 border-primary pt-0 pb-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0"
                      value={limitPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setLimitPrice("");
                          return;
                        }
                        if (!/^\d+$/.test(val)) return;
                        const parsed = parseInt(val, 10);
                        if (parsed > 99) {
                          setLimitPrice("99");
                        } else {
                          setLimitPrice(parsed.toString());
                        }
                      }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-heading font-bold text-lg text-muted-foreground pointer-events-none">
                      ¢
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold font-sans text-foreground tracking-widest uppercase">
                    STAKE AMOUNT
                  </span>
                  <button
                    type="button"
                    onClick={() => setAmount(userBalance.toString())}
                    className="text-[10px] font-bold font-sans text-primary tracking-widest uppercase cursor-pointer hover:underline text-right"
                  >
                    BAL: ${formatNumber(userBalance)}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max={userBalance}
                    step="0.01"
                    className="h-16 text-3xl font-heading bg-background font-bold border-b-2 border-primary pt-0 pb-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-heading font-bold text-lg text-muted-foreground pointer-events-none">
                    USD
                  </span>
                </div>
              </div>

              {/* Slider / Percentages */}
              <div className="flex flex-col gap-4">
                <div className="w-full h-8 relative flex items-center group">
                  <div className="w-full h-2 bg-surface-container-highest rounded-full absolute top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
                    <div
                      className={`h-full ${selectedOutcome === "YES" ? "bg-primary/60" : "bg-destructive/60"}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, (Number(amount || 0) / userBalance) * 100))}%`,
                      }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={userBalance}
                    step="0.01"
                    value={amount || 0}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4 rounded-full pointer-events-none transition-all duration-75 ${
                      selectedOutcome === "YES"
                        ? "bg-primary shadow-[0_0_8px_rgba(159,251,6,0.8)]"
                        : "bg-destructive shadow-[0_0_8px_rgba(255,50,50,0.8)]"
                    }`}
                    style={{
                      left: `${Math.min(100, Math.max(0, (Number(amount || 0) / userBalance) * 100))}%`,
                    }}
                  ></div>
                </div>
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() =>
                        setAmount(
                          pct === 100
                            ? userBalance.toString()
                            : ((userBalance * pct) / 100).toFixed(2),
                        )
                      }
                      className={`flex-1 bg-surface-container px-0 py-2 rounded text-center text-[10px] font-bold font-sans text-muted-foreground cursor-pointer transition-colors ${
                        selectedOutcome === "YES"
                          ? "hover:bg-primary/20 hover:text-primary"
                          : "hover:bg-destructive/20 hover:text-destructive"
                      }`}
                    >
                      {pct === 100 ? "MAX" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-3 mt-4">
                <div className="flex justify-between text-sm font-sans text-muted-foreground">
                  <span>Est. Shares</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatNumber(shares, 0, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-sans text-muted-foreground">
                  <span>Max Payout</span>
                  <span className="font-bold text-primary font-mono">
                    ${formatNumber(maxPayout)}
                  </span>
                </div>
                <div className="w-full border-t border-surface-container-highest my-1"></div>
                <div className="flex justify-between text-sm font-sans text-foreground font-bold">
                  <span>Potential Return</span>
                  <span className="text-primary font-mono">+{potentialReturn.toFixed(1)}%</span>
                </div>
              </div>

              <Button
                onClick={handleConfirmPosition}
                disabled={
                  isFrozen ||
                  placeOrder.isPending ||
                  !signer ||
                  parsedAmount <= 0 ||
                  (orderType === OrderType.Limit &&
                    (!limitPrice || Number(limitPrice) <= 0 || Number(limitPrice) >= 100))
                }
                className="w-full h-16 text-xl tracking-wide uppercase shadow-[0_0_20px_rgba(159,251,6,0.25)] hover:shadow-[0_0_30px_rgba(159,251,6,0.4)] disabled:shadow-none"
              >
                {placeOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />
                    PLACING ORDER...
                  </>
                ) : (
                  "CONFIRM POSITION"
                )}
              </Button>
            </div>

            {/* Frozen Overlay */}
            {isFrozen && (
              <div className="absolute inset-0 bg-surface-container-high/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-3 z-20">
                {isFullyResolved ? (
                  <Lock className="size-8 text-muted-foreground" />
                ) : (
                  <Hourglass className="size-8 text-yellow-500 animate-pulse" />
                )}
                <span
                  className={`text-sm font-bold font-sans uppercase tracking-widest ${
                    isFullyResolved ? "text-muted-foreground" : "text-yellow-500"
                  }`}
                >
                  {isFullyResolved ? "Market Resolved" : "Awaiting Resolution"}
                </span>
                <span className="text-xs font-sans text-muted-foreground">
                  {isFullyResolved
                    ? "Trading is no longer available"
                    : "Market has closed — pending outcome"}
                </span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
