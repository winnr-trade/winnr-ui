import { Calendar, Share2 } from "lucide-react";
import { Display } from "@/components/ui/typography";
import { toast } from "sonner";

interface MarketDetailHeaderProps {
  category: string;
  subcategory: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  liveProbability: string;
  isFullyResolved: boolean;
  isAwaitingResolution: boolean;
  resolvedOutcome: "yes" | "no" | null;
  resolutionDate?: string;
  volume?: string;
  liquidity?: string;
}

export function MarketDetailHeader({
  category,
  subcategory,
  titlePrefix,
  titleHighlight,
  titleSuffix,
  liveProbability,
  isFullyResolved,
  isAwaitingResolution,
  resolvedOutcome,
  resolutionDate = "DEC 31, 2024",
  volume = "$0",
  liquidity = "$0",
}: MarketDetailHeaderProps) {
  const probValue = parseInt(liveProbability);
  const isHighChance = probValue >= 50;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Market link copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-3 mb-0">
      {/* Top Bar: Tags & Share */}
      <div className="flex justify-between items-center w-full">
        <div className="flex gap-2 items-center">
          <div className="border border-border text-muted-foreground text-[10px] font-bold font-sans tracking-widest uppercase px-3 py-1">
            {category}
          </div>
          <div className="border border-border text-muted-foreground text-[10px] font-bold font-sans tracking-widest uppercase px-3 py-1 flex items-center gap-2">
            <Calendar className="size-3" />
            {resolutionDate}
          </div>
        </div>
        <button 
          onClick={handleShare}
          className="text-muted-foreground hover:text-white transition-colors p-2 -mr-2"
        >
          <Share2 className="size-5" />
        </button>
      </div>

      {/* Main Question */}
      <Display className="text-4xl md:text-5xl leading-tight text-white max-w-4xl">
        {titlePrefix}
        {titleHighlight && (
          <span className="text-white border-b-4 border-white pb-1 ml-2 mr-2">
            {titleHighlight}
          </span>
        )}
        {titleSuffix}
      </Display>

      {/* Bottom Row: Resolution Info or Probability & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-10">
          {/* Stats Section (Left Aligned) */}
          <div className="flex items-center gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.2em]">
                VOLUME
              </span>
              <span className="text-[20px] font-heading font-bold text-white leading-none">
                {volume}
              </span>
            </div>
            <div className="h-8 w-px bg-border/60" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.2em]">
                LIQUIDITY
              </span>
              <span className="text-[20px] font-heading font-bold text-white leading-none">
                {liquidity}
              </span>
            </div>
          </div>

          <div>
            {isFullyResolved && (
              <div className="text-xl font-heading font-bold uppercase">
                <span className="text-muted-foreground mr-2">Resolved:</span>
                <span
                  className={
                    resolvedOutcome === "yes" ? "text-emerald-500" : "text-destructive"
                  }
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
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.2em] mb-1">
            PROBABILITY
          </span>
          <div className={`text-7xl font-heading font-bold tracking-tighter leading-none ${isHighChance ? "text-emerald-500" : "text-destructive"}`}>
            {liveProbability}
          </div>
        </div>
      </div>
    </div>
  );
}
