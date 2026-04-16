"use client";

import {
  Activity,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  Clock,
  Landmark,
  Rocket,
  Search,
  Trophy,
} from "lucide-react";
import Link from "next/link";
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
import { useUserWallet } from "@/hooks/useUserWallet";

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
  const {
    data: trendingMarkets,
    isLoading: isLoadingTrend,
    error: errTrend,
  } = useGetTrendingMarkets();
  const { data: newestMarkets, isLoading: isLoadingNew, error: errNew } = useGetNewestMarkets();
  const { data: closingSoon, isLoading: isLoadingClose, error: errClose } = useGetClosingSoon();
  const { data: marketStats, isLoading: isLoadingStats, error: errStats } = useGetMarketStats();
  const { data: featuredMarket, isLoading: isLoadingFeat, error: errFeat } = useGetFeaturedMarket();

  useUserWallet();

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
        <Skeleton className="w-full h-[400px] rounded-2xl bg-surface-container" />
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-24 h-10 rounded-md bg-surface-container" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 flex flex-col gap-10">
            <Skeleton className="w-full h-64 rounded-xl bg-surface-container" />
            <Skeleton className="w-full h-48 rounded-xl bg-surface-container" />
          </div>
          <Skeleton className="w-full h-[500px] rounded-xl bg-surface-container" />
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
    <div className="container mx-auto p-6 md:p-8 flex flex-col gap-10 max-w-[1400px]">
      {/* Featured Market Hero */}
      <Link href={`/markets/${featuredMarket.id}`} className="block">
        <Card className="bg-surface-container border-0 rounded-2xl overflow-hidden relative flex flex-col lg:flex-row shadow-none p-0 group hover:opacity-95 transition-opacity">
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center z-10">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-sm bg-primary/10 text-primary text-[10px] font-sans font-bold tracking-widest uppercase border border-primary/20">
                {featuredMarket.tag}
              </span>
              <span className="text-xs font-sans text-muted-foreground flex items-center gap-1.5">
                <Activity className="size-3" /> {featuredMarket.volume}
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-heading font-extrabold leading-tight mb-8 max-w-xl">
              {featuredMarket.titlePrefix}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(159,251,6,0.3)]">
                {featuredMarket.titleHighlight}
              </span>
              {featuredMarket.titleSuffix}
            </h1>

            <div className="flex items-center gap-12 mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-muted-foreground">
                  Probability
                </span>
                <span className="text-5xl font-heading font-bold text-primary">
                  {featuredMarket.probability}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-muted-foreground">
                  Ends In
                </span>
                <span className="text-2xl font-heading font-bold text-white mt-1">
                  {featuredMarket.endsIn}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button className="h-14 px-8 text-xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  YES {featuredMarket.yesPrice}{" "}
                  <ArrowUp className="size-5 transition-transform group-hover:-translate-y-1" />
                </span>
              </Button>
              <Button
                variant="secondary"
                className="h-14 px-8 text-xl bg-surface-container-highest hover:bg-surface-container-high text-neutral-300 border-0"
              >
                NO {featuredMarket.noPrice}
              </Button>
            </div>
          </div>

          {/* Hero Chart Section */}
          <div className="flex-1 relative min-h-[300px] lg:min-h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-surface-container to-transparent z-10 lg:w-32"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8 lg:p-12 overflow-hidden">
              {/* Glowing Current Odds Badge */}
              <div className="absolute right-12 top-1/4 z-20 border border-surface-container-highest bg-surface-container/80 backdrop-blur-sm rounded-lg p-3 text-center pointer-events-auto">
                <div className="text-[9px] uppercase tracking-widest font-sans text-muted-foreground mb-1">
                  Current Odds
                </div>
                <div className="text-primary font-heading font-bold text-xl">
                  {featuredMarket.currentOdds}
                </div>
              </div>

              <svg
                className="w-full h-full drop-shadow-[0_0_20px_rgba(159,251,6,0.5)] z-0"
                viewBox="0 0 500 300"
                preserveAspectRatio="none"
                role="img"
                aria-label="Market Trajectory"
              >
                <title>Featured Market Trajectory</title>
                <path
                  d="M 10,220 C 150,210 250,180 350,100 C 420,60 480,40 500,40"
                  fill="none"
                  stroke="var(--primary-fixed)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle
                  cx="500"
                  cy="40"
                  r="6"
                  fill="var(--primary-fixed)"
                  className="drop-shadow-[0_0_10px_rgba(159,251,6,1)]"
                />
              </svg>
            </div>
          </div>
        </Card>
      </Link>

      {/* Categories and Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-none mask-fade-edges-x">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              className={`whitespace-nowrap px-6 py-2.5 rounded-md font-sans font-bold text-sm transition-colors ${
                cat.active
                  ? "bg-primary text-black shadow-[0_0_15px_rgba(159,251,6,0.3)]"
                  : "bg-surface-container-high text-muted-foreground hover:bg-surface-container-highest hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search markets by title, category, or tag..."
            className="w-full h-12 bg-surface-container-high border border-surface-container-highest rounded-xl pl-12 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column (Main Feeds) */}
        <div className="xl:col-span-2 flex flex-col gap-10">
          {/* Trending Markets */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
              <div>
                <Heading>Trending Markets</Heading>
                <p className="text-muted-foreground font-sans text-sm mt-1">
                  Highest activity in the last 24 hours
                </p>
              </div>
              <button
                type="button"
                className="text-primary font-sans font-bold text-sm flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingMarkets.map((market) => (
                <Link key={market.id} href={`/markets/${market.id}`} className="block">
                  <Card className="bg-[#131b14] border-0 shadow-none hover:bg-surface-container transition-colors p-5 flex flex-col gap-4 h-full">
                    <div className="flex justify-between items-start">
                      <div className="size-10 rounded-md bg-surface-container-highest flex items-center justify-center">
                        {getIconByName(market.iconName)}
                      </div>
                      <span className="text-[10px] font-sans text-muted-foreground">
                        {market.category}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg leading-snug flex-1">
                      {market.title}
                    </h3>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          Chance
                        </span>
                        <span className="text-2xl font-heading font-bold text-primary">
                          {market.chance}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          Vol
                        </span>
                        <span className="text-sm font-sans font-semibold text-white">
                          {market.volume}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Newest Markets */}
          <section className="flex flex-col gap-6">
            <Heading>Newest Markets</Heading>
            <div className="flex flex-col gap-4">
              {newestMarkets.map((market) => (
                <Link key={market.id} href={`/markets/${market.id}`} className="block">
                  <Card className="bg-surface-container border-0 shadow-none hover:bg-surface-container-high transition-colors p-4 flex items-center gap-6">
                    <div className="size-12 rounded-md bg-surface-container-highest flex items-center justify-center shrink-0">
                      {getIconByName(market.iconName)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-heading font-bold text-lg">{market.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-sans text-muted-foreground">
                          {market.tags[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-sans text-muted-foreground">
                          {market.tags[1]}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-sans font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        {market.metricLabel}
                      </span>
                      <span className={`text-xl font-heading font-bold ${market.metricColor}`}>
                        {market.metricValue}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Sidebars) */}
        <div className="flex flex-col gap-8">
          {/* Closing Soon */}
          <Card className="bg-surface-container border-0 shadow-none p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="size-5 text-red-400" />
              <Heading className="text-xl">Closing Soon</Heading>
            </div>

            <div className="flex flex-col gap-6">
              {closingSoon.map((item) => (
                <Link key={item.id} href={`/markets/${item.id}`} className="block group">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span
                        className={`text-[10px] font-sans font-bold tracking-widest uppercase ${item.tagColor}`}
                      >
                        {item.tag}
                      </span>
                      <span className="text-[10px] font-sans text-muted-foreground">
                        {item.time}
                      </span>
                    </div>
                    <p className="font-heading font-semibold text-sm leading-snug text-neutral-200 group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-surface-container-low transition-all"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Button
              variant="secondary"
              className="w-full mt-2 bg-[#1b251b] hover:bg-surface-container-highest text-white border-0 h-12"
            >
              View Resolution Feed
            </Button>
          </Card>

          {/* Market Stats */}
          <Card className="bg-surface-container border-0 shadow-none p-6 flex flex-col gap-6">
            <Heading className="text-xl">Market Stats</Heading>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-sans text-muted-foreground">24h Traders</span>
                <span className="text-sm font-sans font-bold text-primary">
                  {marketStats.traders24h}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-sans text-muted-foreground">Total TVL</span>
                <span className="text-sm font-sans font-bold text-primary">
                  {marketStats.totalTvl}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-sans text-muted-foreground">Active Markets</span>
                <span className="text-sm font-sans font-bold text-primary">
                  {marketStats.activeMarkets}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
