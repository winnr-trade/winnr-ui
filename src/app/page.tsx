"use client";

import { FeaturedMarketHero } from "@/components/market/FeaturedMarketHero";
import { MarketCategories } from "@/components/market/MarketCategories";
import { TrendingMarkets } from "@/components/market/TrendingMarkets";

export default function Home() {
  return (
    <div className="container mx-auto p-6 md:p-8 flex flex-col gap-16 max-w-[1400px]">
      <FeaturedMarketHero />
      <MarketCategories />
      <TrendingMarkets />
    </div>
  );
}
