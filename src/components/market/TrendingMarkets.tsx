"use client";

import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useGetTrendingMarkets } from "@/api/market";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading } from "@/components/ui/typography";
import { formatDate } from "@/utils";

export function TrendingMarkets() {
  const { data: trendingMarkets, isLoading, error } = useGetTrendingMarkets();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-[300px] rounded-none bg-surface-container" />
        ))}
      </div>
    );
  }

  if (error || !trendingMarkets) return null;

  return (
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
  );
}
