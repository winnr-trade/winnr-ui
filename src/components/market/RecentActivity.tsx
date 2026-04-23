import { ArrowDown, ArrowUp, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/typography";

interface RecentActivityProps {
  yesPrice: string;
  noPrice: string;
}

export function RecentActivity({ yesPrice, noPrice }: RecentActivityProps) {
  return (
    <Card className="bg-surface-container-low border border-border rounded-none shadow-none p-5 h-full">
      <div className="flex items-center gap-2 mb-6">
        <History className="size-5 text-white" />
        <Heading className="text-lg">Recent Activity</Heading>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-6 rounded-none bg-surface-container-highest flex items-center justify-center">
              <ArrowUp className="size-3 text-white" />
            </div>
            <span className="font-sans text-sm text-foreground">0x71...f32</span>
          </div>
          <span className="text-white font-bold font-mono text-xs">
            YES @ {yesPrice}
          </span>
          <span className="text-[10px] uppercase font-sans font-bold text-muted-foreground">
            2m ago
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-6 rounded-none bg-surface-container-highest flex items-center justify-center">
              <ArrowDown className="size-3 text-muted-foreground" />
            </div>
            <span className="font-sans text-sm text-foreground">whale_master</span>
          </div>
          <span className="text-destructive font-bold font-mono text-xs">
            NO @ {noPrice}
          </span>
          <span className="text-[10px] uppercase font-sans font-bold text-muted-foreground">
            5m ago
          </span>
        </div>
      </div>
    </Card>
  );
}
