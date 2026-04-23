import { Calendar, Share2 } from "lucide-react";
import { Display } from "@/components/ui/typography";

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
}: MarketDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-2">
      <Display className="text-4xl md:text-5xl leading-tight text-white max-w-3xl">
        {titlePrefix}
        <span className="text-white border-b-4 border-white pb-1 ml-2 mr-2">
          {titleHighlight}
        </span>
        {titleSuffix}
      </Display>

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
        <button className="text-muted-foreground hover:text-white transition-colors">
          <Share2 className="size-5" />
        </button>
      </div>

      <div className="flex items-center gap-4 mt-2">
        <div className="text-7xl font-heading font-bold text-white tracking-tighter">
          {liveProbability}
        </div>
        <div className="bg-[#1b3819] text-emerald-500 text-xs font-bold font-sans tracking-widest px-2 py-1 flex items-center">
          <svg
            className="w-3 h-3 mr-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          +2.4%
        </div>
      </div>

      {isFullyResolved && (
        <div className="mt-2 text-xl font-heading font-bold uppercase">
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
        <div className="mt-2 text-xl font-heading font-bold uppercase text-yellow-500">
          Awaiting Resolution
        </div>
      )}
    </div>
  );
}
