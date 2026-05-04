import * as React from "react";
import { Calendar, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useMarketDetail } from "@/api/market";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Display } from "@/components/ui/typography";
import {
  deriveMarketState,
  formatFullDate,
  formatNumber,
  formatTimeUntil,
  formatUnits,
} from "@/utils";
import { ShareModal } from "./ShareModal";

interface MarketDetailHeaderProps {
  marketId: number;
}

export function MarketDetailHeader({ marketId }: MarketDetailHeaderProps) {
  const { data: market, isLoading: isMarketLoading } = useMarketDetail({ id: marketId });
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  if (isMarketLoading) {
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="max-w-3xl w-full">
          <Skeleton className="w-32 h-6 mb-4 bg-surface-container" />
          <Skeleton className="w-full h-16 bg-surface-container mb-2" />
          <Skeleton className="w-3/4 h-16 bg-surface-container" />
        </div>
      </div>
    );
  }

  if (!market) return null;

  const { isFullyResolved, isAwaitingResolution, resolvedOutcome } = deriveMarketState(market);

  const { category, question, resolutionTime, totalShares, probability, createdAt } = market;

  const creationDate = formatFullDate(createdAt);
  const isHighChance = probability >= 50;
  const displayProbability = `${probability}%`;
  const displayVolume = `$${formatNumber(formatUnits(market.totalVolume || 0, 6), 0, 0)}`;
  const displayOI = `$${formatNumber(totalShares, 0, 0)}`;
  const displayEndsIn = formatTimeUntil(resolutionTime);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="flex flex-col gap-3 mb-0">
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={currentUrl}
        title={question}
      />

      {/* Top Bar: Tags & Share */}
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-2 items-center">
          <div className="border border-border text-muted-foreground text-[10px] font-bold font-sans tracking-widest uppercase px-3 py-1">
            {category}
          </div>
          <div className="border border-border text-muted-foreground text-[10px] font-bold font-sans tracking-widest uppercase px-3 py-1 flex items-center gap-2">
            <Calendar className="size-3" />
            {creationDate}
          </div>
        </div>
        <IconButton
          onClick={() => setIsShareModalOpen(true)}
          icon={Share2}
          variant="ghost"
          className="-mr-2"
        />
      </div>

      {/* Main Question */}
      <Display className="text-4xl md:text-5xl leading-tight text-white max-w-4xl">
        {question}
      </Display>

      {/* Bottom Row: Resolution Info or Probability & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-end gap-10 pb-2">
          {/* Stats Section (Left Aligned) */}
          <div className="flex items-end gap-10">
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.2em]">
                VOLUME
              </span>
              <span className="text-2xl font-heading font-bold text-white leading-none">
                {displayVolume}
              </span>
            </div>
            <div className="h-8 w-px bg-border/60 mb-1" />
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.2em]">
                OPEN INTEREST
              </span>
              <span className="text-2xl font-heading font-bold text-white leading-none">
                {displayOI}
              </span>
            </div>
            <div className="h-8 w-px bg-border/60 mb-1" />
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.2em]">
                ENDS IN
              </span>
              <span className="text-2xl font-heading font-bold text-white leading-none">
                {displayEndsIn}
              </span>
            </div>
          </div>

          <div className="mb-0.5">
            {isFullyResolved && (
              <div className="text-xl font-heading font-bold uppercase">
                <span className="text-muted-foreground mr-2">Resolved:</span>
                <span
                  className={resolvedOutcome === "yes" ? "text-emerald-500" : "text-destructive"}
                >
                  {resolvedOutcome === "yes" ? "YES" : "NO"}
                </span>
              </div>
            )}
            {isAwaitingResolution && (
              <div className="text-xl font-heading font-bold uppercase text-yellow-500">
                Awaiting Resolution
              </div>
            )}
          </div>
        </div>

        {/* Probability Display (Right Aligned) */}
        <div className="flex flex-col items-end gap-2.5">
          <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.2em]">
            PROBABILITY
          </span>
          <div
            className={`text-7xl font-heading font-bold tracking-tighter leading-none ${isHighChance ? "text-emerald-500" : "text-destructive"}`}
          >
            {displayProbability}
          </div>
        </div>
      </div>
    </div>
  );
}
