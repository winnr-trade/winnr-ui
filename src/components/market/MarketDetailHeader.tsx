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
}: MarketDetailHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-surface-container-high px-2 py-1 rounded text-primary text-[10px] font-bold font-sans tracking-widest uppercase">
            {category}
          </span>
          <span className="text-muted-foreground text-[10px] font-bold font-sans tracking-widest uppercase">
            / {subcategory}
          </span>
        </div>
        <Display className="text-4xl md:text-6xl leading-tight">
          {titlePrefix}
          <span className="text-primary border-b-4 border-primary pb-1">
            {titleHighlight}
          </span>
          {titleSuffix}
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
  );
}
