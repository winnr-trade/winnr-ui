"use client";

import { History, Layers, ShieldCheck, Sword, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { useVaultData } from "@/api/vault";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Display, Heading } from "@/components/ui/typography";

const getIconByName = (name: string, className: string) => {
  switch (name) {
    case "zap":
      return <Zap className={className} />;
    case "sword":
      return <Sword className={className} />;
    case "layout-grid":
    case "layers":
      return <Layers className={className} />;
    case "moon":
    case "shield":
      return <ShieldCheck className={className} />;
    default:
      return <Zap className={className} />;
  }
};

export default function VaultStats() {
  const { data: vault, isLoading, error } = useVaultData();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col gap-6 max-w-[1400px]">
        <div className="flex flex-col xl:flex-row gap-6">
          <Skeleton className="w-full xl:w-[40%] h-[280px] bg-surface-container rounded-none border border-border" />
          <Skeleton className="w-full xl:w-[60%] h-[280px] bg-surface-container rounded-none border border-border" />
        </div>
        <div className="flex flex-col xl:flex-row gap-6">
          <Skeleton className="w-full xl:w-[65%] h-[500px] bg-surface-container rounded-none border border-border" />
          <div className="w-full xl:w-[35%] flex flex-col gap-6">
            <Skeleton className="h-[250px] bg-surface-container rounded-none border border-border" />
            <Skeleton className="h-[226px] bg-surface-container rounded-none border border-border" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vault) {
    return (
      <div className="container mx-auto p-8 text-center text-red-500 font-sans">
        Failed to load pulse data.
      </div>
    );
  }

  // Determine which achievements are active based on the image:
  // Streak Master and Giant Slayer are lit, the rest dim.
  const mappedAchievements = vault.achievements.map((ach, i) => ({
    ...ach,
    active: i < 2, // First two are active in the image
    icon: i === 2 ? "layers" : i === 3 ? "shield" : ach.icon,
  }));

  return (
    <div className="container mx-auto p-6 md:p-8 flex flex-col gap-6 max-w-[1400px]">
      {/* Top Row: Intro & Net Worth + Performance Curve */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch">
        {/* Left: Your Pulse & Net Worth Card */}
        <div className="w-full xl:w-[40%] flex flex-col justify-between gap-8 py-2">
          <div>
            <Display className="mb-3 text-7xl md:text-8xl tracking-tight text-white">
              Your{" "}
              <span className="text-white font-bold">
                Pulse
              </span>
            </Display>
            <p className="text-muted-foreground font-sans text-[10px] uppercase tracking-widest md:text-xs max-w-[90%] leading-relaxed">
              Real-time performance metrics and predictive liquidity overview.
            </p>
          </div>

          <div className="bg-surface-container rounded-none p-6 md:p-8 relative border border-border shadow-none">
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div>
                <div className="uppercase tracking-[0.2em] text-[9px] text-muted-foreground font-bold font-sans mb-1 md:mb-2">
                  NET WORTH
                </div>
                <div className="text-3xl md:text-5xl font-heading font-extrabold text-white">
                  {vault.stats.netWorth}
                </div>
              </div>
              <div>
                <div className="uppercase tracking-[0.2em] text-[9px] text-muted-foreground font-bold font-sans mb-1 md:mb-2">
                  24H CHANGE
                </div>
                <div className="text-3xl md:text-5xl font-heading font-extrabold text-white">
                  {vault.stats.change24h}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Performance Curve */}
        <Card className="w-full xl:w-[60%] bg-surface-container border border-border shadow-none overflow-hidden relative flex flex-col h-[280px] xl:h-auto rounded-none">
          <div className="p-6 md:p-8 flex justify-between items-start z-20">
            <div>
              <Heading className="text-lg md:text-xl font-bold tracking-wide text-white">
                Performance Curve
              </Heading>
              <div className="uppercase tracking-[0.2em] text-[9px] text-muted-foreground font-bold font-sans mt-1">
                30 DAY TREND
              </div>
            </div>
            <div className="flex bg-surface-container p-1 rounded-none border border-border">
              <span className="bg-white px-3 py-1 text-[9px] tracking-widest font-bold font-sans text-black rounded-none cursor-pointer">
                1M
              </span>
              <span className="px-3 py-1 text-[9px] tracking-widest font-bold font-sans text-muted-foreground cursor-pointer hover:text-white transition-colors">
                ALL
              </span>
            </div>
          </div>

          {/* Floating Data Badge */}
          <div className="absolute right-12 md:right-24 top-20 md:top-24 z-20 bg-surface-container border border-border p-3 rounded-none flex flex-col shadow-none">
            <span className="text-[9px] text-muted-foreground uppercase font-sans font-bold tracking-widest mb-1 text-center">
              CURRENT
            </span>
            <span className="text-white font-heading font-bold text-sm">
              {vault.stats.change24h === "+12.4%" ? "+$12,402" : "+$0"}
            </span>
          </div>

          {/* SVG Glow Line */}
          <div className="absolute inset-0 z-0">
            <svg
              className="w-full h-full translate-y-[30%] scale-x-105"
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
              role="img"
              aria-label="Performance Curve"
            >
              <title>Performance Curve</title>
              {/* The squiggly trace approximating the vault image */}
              <path
                d="M 50,150 C 150,140 250,170 350,160 C 400,150 420,130 430,75 C 450,-10 520,130 550,140 C 600,160 620,-10 650,20 C 700,80 750,180 800,120 C 830,80 860,10 880,10"
                fill="none"
                stroke="#10B981"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch">
        {/* Left: Active Positions */}
        <Card className="w-full xl:w-[65%] bg-surface-container border border-border shadow-none p-6 md:p-8 flex flex-col rounded-none">
          <div className="flex justify-between items-center mb-6">
            <Heading className="text-2xl font-bold tracking-wide text-white">
              Active Positions
            </Heading>
            <span className="bg-surface-container border border-border px-3 py-1 rounded-none text-[9px] font-bold font-sans text-white uppercase tracking-[0.2em] shadow-none">
              {vault.activePositions.length} LIVE
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {vault.activePositions.map((pos, _idx) => {
              // Dimmed styles for specific items based on mock image
              const isDimmed =
                pos.prediction === "YES" && pos.pnl.includes("-");

              return (
                <Link
                  key={pos.id}
                  href={`/markets/${pos.id}`}
                  className="block group"
                >
                  <div className="bg-surface-container-low group-hover:bg-surface-container transition-colors rounded-none p-5 md:p-6 flex flex-col gap-5 border border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-heading font-bold text-lg text-white tracking-wide group-hover:text-white transition-colors">
                          {pos.title}
                        </div>
                        <div className="text-[10px] tracking-widest uppercase font-sans text-muted-foreground mt-1">
                          Prediction:{" "}
                          <span className="text-white">
                            {pos.prediction}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-heading font-bold text-xl ${pos.pnlColor}`}
                        >
                          {pos.pnl}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest font-sans text-muted-foreground mt-1">
                          Likelihood: {pos.likelihood}%
                        </div>
                      </div>
                    </div>
                    <div className="h-[2px] w-full bg-surface-container border border-border rounded-none overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${isDimmed ? "bg-muted" : "bg-emerald-500"}`}
                        style={{ width: `${pos.likelihood}%` }}
                       ></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Right: Achievements & Settled */}
        <div className="w-full xl:w-[35%] flex flex-col gap-6">
          {/* Achievements Card */}
          <Card className="bg-surface-container border border-border shadow-none p-6 md:p-8 rounded-none">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="size-5 text-white" />
              <Heading className="text-xl font-bold tracking-wide text-white">
                Achievements
              </Heading>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mappedAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`bg-surface-container-low p-5 rounded-none flex flex-col items-center justify-center text-center transition-all duration-300 border border-border
                  ${ach.active ? "opacity-100 shadow-none hover:bg-surface-container" : "opacity-40 grayscale hover:grayscale-0 hover:opacity-100"}`}
                >
                  <div
                    className={`${ach.active ? "" : ""}`}
                  >
                    {getIconByName(ach.icon, "size-7 text-white mb-3")}
                  </div>
                  <div className="font-heading font-extrabold text-[9px] text-white uppercase tracking-[0.2em]">
                    {ach.title}
                  </div>
                  <div className="text-[8px] text-muted-foreground tracking-widest uppercase font-sans mt-1">
                    {ach.subtitle}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Settled Card */}
          <Card className="bg-surface-container border border-border shadow-none p-6 md:p-8 flex-1 flex flex-col rounded-none">
            <div className="flex justify-between items-center mb-6">
              <Heading className="text-xl font-bold tracking-wide text-white">
                Settled
              </Heading>
              <History className="size-5 text-muted-foreground hover:text-white transition-colors cursor-pointer" />
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {vault.settled.map((set) => (
                <Link
                  key={set.id}
                  href={`/markets/${set.id}`}
                  className="block group"
                >
                  <div className="bg-surface-container-low border border-border p-4 md:p-5 rounded-none flex justify-between items-center group-hover:bg-surface-container transition-colors">
                    <div>
                      <div className="font-heading font-bold text-sm text-white group-hover:text-white transition-colors">
                        {set.title}
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.2em] font-sans text-muted-foreground mt-1">
                        Settled: {set.date}
                      </div>
                    </div>
                    <div className="font-heading font-bold text-lg text-white group-hover:text-white transition-colors">
                      {set.pnl}
                    </div>
                  </div>
                </Link>
              ))}

              <div className="pt-4 mt-auto">
                <Button className="w-full bg-white text-black h-12 text-[10px] tracking-widest font-sans uppercase font-bold border-0 shadow-none transition-all rounded-none hover:bg-white/90">
                  VIEW ALL HISTORY
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
