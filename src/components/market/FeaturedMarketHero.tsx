"use client";

import { ArrowRight, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useGetFeaturedMarket } from "@/api/market";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedMarketHero() {
  const { data: featuredMarket, isLoading, error } = useGetFeaturedMarket();

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] lg:h-[420px] rounded-none bg-surface-container" />;
  }

  if (error || !featuredMarket) return null;

  return (
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
  );
}
