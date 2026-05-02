"use client";

import {
  Activity,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Clock,
  Landmark,
  Plus,
  Rocket,
  Search,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useGetCategories,
  useGetClosingSoon,
  useGetFeaturedMarket,
  useGetMarketStats,
  useGetNewestMarkets,
  useGetTrendingMarkets,
} from "@/api/market";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading } from "@/components/ui/typography";
import { useMainWallet } from "@/hooks/useMainWallet";
import { formatDate } from "@/utils";

// Helper to map icon names to actual Lucide components
const getIconByName = (name: string) => {
  switch (name) {
    case "activity":
      return <Activity className="size-5 text-primary" />;
    case "landmark":
      return <Landmark className="size-5 text-primary" />;
    case "rocket":
      return <Rocket className="size-5 text-primary" />;
    case "check":
      return <CheckCircle2 className="size-5 text-primary" />;
    case "trophy":
      return <Trophy className="size-5 text-primary" />;
    default:
      return <Activity className="size-5 text-primary" />;
  }
};

export default function Home() {
  const { data: categories, isLoading: isLoadingCat, error: errCat } = useGetCategories();
  const [activeCategory, setActiveCategory] = useState("");

  // Set the first category as active by default once loaded
  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
  }, [categories, activeCategory]);
  const {
    data: trendingMarkets,
    isLoading: isLoadingTrend,
    error: errTrend,
  } = useGetTrendingMarkets();
  const { data: newestMarkets, isLoading: isLoadingNew, error: errNew } = useGetNewestMarkets();
  const { data: closingSoon, isLoading: isLoadingClose, error: errClose } = useGetClosingSoon();
  const { data: marketStats, isLoading: isLoadingStats, error: errStats } = useGetMarketStats();
  const { data: featuredMarket, isLoading: isLoadingFeat, error: errFeat } = useGetFeaturedMarket();

  useMainWallet();

  const isLoading =
    isLoadingCat ||
    isLoadingTrend ||
    isLoadingNew ||
    isLoadingClose ||
    isLoadingStats ||
    isLoadingFeat;

  const error = errCat || errTrend || errNew || errClose || errStats || errFeat;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 md:p-8 flex flex-col gap-10 max-w-[1400px]">
        {/* Loading Skeletons */}
        <Skeleton className="w-full h-[400px] rounded-none bg-surface-container" />
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-24 h-10 rounded-none bg-surface-container" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 flex flex-col gap-10">
            <Skeleton className="w-full h-64 rounded-none bg-surface-container" />
            <Skeleton className="w-full h-48 rounded-none bg-surface-container" />
          </div>
          <Skeleton className="w-full h-[500px] rounded-none bg-surface-container" />
        </div>
      </div>
    );
  }

  if (
    error ||
    !categories ||
    !trendingMarkets ||
    !newestMarkets ||
    !closingSoon ||
    !marketStats ||
    !featuredMarket
  ) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500 font-sans">
        Failed to load market data.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 flex flex-col gap-16 max-w-[1400px]">
      {/* Featured Market Hero */}
      <Link href={`/markets/${featuredMarket.id}`} className="block">
        <Card className="bg-surface-container border-0 rounded-none overflow-hidden relative shadow-none p-0 group min-h-[300px] lg:min-h-[420px]">
          {/* Advanced CSS Background */}
          <div className="absolute inset-0 z-0">
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            ></div>
            <div className="absolute inset-0 bg-linear-to-r from-background via-background/90 to-transparent z-10 w-full lg:w-2/3"></div>
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/20 to-background z-10"></div>

            {/* Animated Glows */}
            <div className="absolute -top-24 -right-24 size-96 bg-primary/20 blur-[120px] rounded-full"></div>
            <div className="absolute top-1/2 -right-12 size-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
          </div>

          <div className="relative z-10 p-8 lg:p-12 lg:py-16 flex flex-col justify-center max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-sans font-bold text-emerald-500 uppercase tracking-[0.25em]">
                  {featuredMarket.tag || "FEATURED MARKET"}
                </span>
              </div>
            </div>

            <h1 className="text-4xl lg:text-6xl font-heading font-extrabold leading-[1.1] mb-8 tracking-tight text-[#f4fffa] max-w-2xl">
              {featuredMarket.titlePrefix}
            </h1>

            <div className="flex items-center gap-10 lg:gap-20 mb-10">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-muted-foreground">
                  YES PROBABILITY
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl lg:text-5xl font-heading font-bold text-primary">
                    {featuredMarket.probability}
                  </span>
                  <span className="text-xs font-sans font-bold text-emerald-500/60 flex items-center gap-0.5">
                    <ArrowUp className="size-3" /> 0.0%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-muted-foreground">
                  TOTAL VOLUME
                </span>
                <span className="text-4xl lg:text-5xl font-heading font-bold text-[#f4fffa]">
                  {featuredMarket.volume}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-muted-foreground">
                  ENDS IN
                </span>
                <span className="text-4xl lg:text-5xl font-heading font-bold text-[#f4fffa]">
                  {featuredMarket.endsIn || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                size="lg"
                className="h-12 px-10 text-[10px] font-sans font-bold tracking-[0.2em] uppercase rounded-none bg-primary text-black hover:bg-primary/90 flex items-center gap-2 border-0 shadow-xl shadow-primary/20"
              >
                PREDICT NOW <ArrowRight className="size-3" />
              </Button>
            </div>
          </div>
        </Card>
      </Link>

      {/* Categories and Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-8 py-4 px-1">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-none justify-center w-full">
          {categories.map((cat) => (
            <Button
              key={cat.name}
              variant="pill"
              size="pill"
              data-active={activeCategory === cat.name}
              onClick={() => setActiveCategory(cat.name)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2">
          <div>
            <Heading className="font-heading text-3xl font-bold tracking-tight text-[#f4fffa] mb-2">
              Trending Markets
            </Heading>
          </div>
          <Button
            variant="link"
            size="tab"
            className="flex items-center gap-1.5 mb-2 hover:opacity-70"
          >
            VIEW ALL ACTIVITY <ArrowRight className="size-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingMarkets.map((market) => (
            <Link key={market.id} href={`/markets/${market.id}`} className="block">
              <Card className="bg-surface-container-low border border-border hover:bg-surface-container transition-colors p-6 flex flex-col gap-6 h-full rounded-none shadow-none">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-surface-container-highest text-white font-sans font-bold text-[9px] uppercase tracking-widest rounded-none">
                    {market.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-sans">
                    {formatDate(market.resolutionTime)}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg leading-snug flex-1 text-[#f4fffa]">
                  {market.title}
                </h3>

                {/* Probabilities Bar */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between text-[9px] font-sans font-bold uppercase tracking-widest text-[#f4fffa]/40">
                    <span className="text-emerald-500">YES {market.chanceNum}%</span>
                    <span className="text-destructive">NO {100 - market.chanceNum}%</span>
                  </div>
                  <div className="w-full h-[3px] flex bg-surface-bright rounded-none overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${market.chanceNum}%` }}
                    ></div>
                    <div
                      className="h-full bg-destructive transition-all duration-500"
                      style={{ width: `${100 - market.chanceNum}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-3 mt-1">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 bg-emerald-500/10 text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all rounded-none font-sans font-bold text-[10px] tracking-widest uppercase"
                  >
                    PREDICT YES
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-11 bg-destructive/10 text-destructive border-destructive/50 hover:bg-destructive/20 hover:border-destructive transition-all rounded-none font-sans font-bold text-[10px] tracking-widest uppercase"
                  >
                    PREDICT NO
                  </Button>
                </div>
              </Card>
            </Link>
          ))}

          {/* Propose a Market Card */}
          <Card className="bg-surface-container border border-border p-8 flex flex-col justify-center items-center text-center gap-4 h-full rounded-none min-h-[300px]">
            <div className="size-12 rounded-none bg-surface-bright flex items-center justify-center mb-2">
              <Plus className="size-6 text-white" />
            </div>

            <div>
              <h3 className="font-heading font-bold text-xl text-[#f4fffa] mb-2">
                Propose a Market
              </h3>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-[80%] mx-auto mb-2">
                Staked users can submit new market ideas for community governance.
              </p>
            </div>

            <Button className="w-full bg-white hover:bg-white/90 text-black border-0 h-12 rounded-none font-sans font-bold text-[10px] tracking-widest uppercase mt-4">
              SUBMIT PROPOSAL
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
