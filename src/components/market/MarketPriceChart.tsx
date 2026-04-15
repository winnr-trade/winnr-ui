import { Area, AreaChart } from "recharts";
import { Card } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  price: {
    label: "Price (¢)",
    color: "#9ffb06",
  },
} satisfies ChartConfig;

type Resolution = "1m" | "15m" | "1h" | "1d" | "1w" | "all";

interface MarketPriceChartProps {
  chartData: { time: string; price: number }[];
  resolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
  isConnected: boolean;
  volume: string;
  liquidity: string;
  resolutionDate: string;
}

const RESOLUTION_OPTIONS: { label: string; val: Resolution }[] = [
  { label: "1H", val: "1h" },
  { label: "1D", val: "1d" },
  { label: "1W", val: "1w" },
  { label: "ALL", val: "all" },
];

export function MarketPriceChart({
  chartData,
  resolution,
  onResolutionChange,
  isConnected,
  volume,
  liquidity,
  resolutionDate,
}: MarketPriceChartProps) {
  return (
    <Card className="bg-surface-container-high border-0 shadow-none overflow-hidden flex flex-col relative h-[450px]">
      {/* Chart Header */}
      <div className="p-6 flex justify-between items-center z-10">
        <div className="flex gap-4 text-xs font-sans font-bold">
          {RESOLUTION_OPTIONS.map((res) => (
            <button
              type="button"
              key={res.val}
              onClick={() => onResolutionChange(res.val)}
              className={
                resolution === res.val
                  ? "bg-surface-container-highest px-3 py-1.5 rounded-sm text-primary cursor-pointer active"
                  : "text-muted-foreground hover:text-foreground cursor-pointer px-3 py-1.5"
              }
            >
              {res.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`size-2 rounded-full ${isConnected ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
          ></div>
          <span className="text-xs text-muted-foreground font-sans">
            {isConnected ? "Live Updates" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Chart Graphic Area */}
      <div className="flex-1 w-full relative px-0 pb-0 flex mt-4 drop-shadow-[0_0_15px_rgba(159,251,6,0.3)]">
        <ChartContainer
          config={chartConfig}
          className="absolute inset-0 size-full z-0 h-full w-full"
        >
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Optional Tooltip overlay details over exactly where the mouse is. The indicator draws the dot */}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" labelKey="time" />}
            />
            <Area
              type="linear"
              dataKey="price"
              stroke="var(--color-price)"
              fillOpacity={1}
              fill="url(#chartGradient)"
              strokeWidth={4}
            />
          </AreaChart>
        </ChartContainer>
      </div>

      {/* Bottom Stats */}
      <div className="p-6 flex justify-between items-end border-t border-surface-container-highest z-10 bg-surface-container-high w-full">
        <div>
          <div className="text-[10px] text-muted-foreground font-bold font-sans uppercase tracking-widest mb-1">
            VOLUME
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">
            {volume}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground font-bold font-sans uppercase tracking-widest mb-1">
            LIQUIDITY
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">
            {liquidity}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground font-bold font-sans uppercase tracking-widest mb-1">
            RESOLUTION
          </div>
          <div className="text-2xl font-heading font-bold text-foreground">
            {resolutionDate}
          </div>
        </div>
      </div>
    </Card>
  );
}
