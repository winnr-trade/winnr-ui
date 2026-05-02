import { useState } from "react";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { useMarketChart, useMarketDetail } from "@/api/market";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { deriveMarketState } from "@/utils/market";

const chartConfig = {
  price: {
    label: "Price (¢)",
    color: "#10B981",
  },
} satisfies ChartConfig;

type Resolution = "1m" | "15m" | "1h" | "1d" | "1w" | "all";

interface MarketPriceChartProps {
  marketId: number;
}

const RESOLUTION_OPTIONS: { label: string; val: Resolution }[] = [
  { label: "1H", val: "1h" },
  { label: "1D", val: "1d" },
  { label: "1W", val: "1w" },
  { label: "ALL", val: "all" },
];

export function MarketPriceChart({ marketId }: MarketPriceChartProps) {
  const [resolution, setResolution] = useState<Resolution>("all");
  const { data: market, isLoading: isMarketLoading } = useMarketDetail({ id: marketId });
  const { data: chartDataResponse, isLoading: isChartLoading } = useMarketChart({
    marketId,
    resolution,
  });

  const chartData = chartDataResponse?.data || [];
  const { isPastResolution, resolvedOutcome } = deriveMarketState(market);
  const isLoading = isMarketLoading || isChartLoading;
  const isEnded = isPastResolution;

  // Format chart data with resolution-aware labels
  const formattedChartData = [...chartData]
    .sort((a, b) => Number(a.time) - Number(b.time))
    .map((d) => {
      const date = new Date(Number(d.time));
      let timeLabel: string;
      if (resolution === "all" || resolution === "1w" || resolution === "1d") {
        timeLabel = date.toLocaleDateString([], { month: "short", day: "numeric" });
      } else {
        timeLabel = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return {
        time: timeLabel,
        fullTime: date.toLocaleString(), // for tooltip
        price: d.price / 100,
        volume: Math.random() * 100 + 20,
      };
    });

  // If market is resolved, append terminal data point
  if (market && isEnded && resolvedOutcome !== null && formattedChartData.length > 0) {
    const terminalPrice = resolvedOutcome === "yes" ? 100 : 0;
    const resolutionMs = new Date(market.resolutionTime).getTime();
    const date = new Date(resolutionMs);
    const terminalTime =
      resolution === "all" || resolution === "1w" || resolution === "1d"
        ? date.toLocaleDateString([], { month: "short", day: "numeric" })
        : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    formattedChartData.push({
      time: terminalTime,
      fullTime: date.toLocaleString(),
      price: terminalPrice,
      volume: 50,
    });
  }

  const getStatus = () => {
    if (isLoading) return "CONNECTING...";
    if (isEnded) return "ENDED";
    return "LIVE";
  };

  const status = getStatus();

  return (
    <Card className="bg-surface-container-low border border-border rounded-none shadow-none flex flex-col relative h-[400px]">
      {/* Chart Header */}
      <div className="p-6 flex justify-between items-center z-10 border-b border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${
                status === "LIVE"
                  ? "bg-emerald-500 animate-breathe"
                  : "bg-muted-foreground"
              }`}
            ></div>
            <span
              className={`text-[10px] font-sans uppercase tracking-widest ${
                status === "LIVE" ? "text-emerald-500" : "text-muted-foreground"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="flex border border-border rounded-none overflow-hidden">
          {RESOLUTION_OPTIONS.map((res) => (
            <Button
              key={res.val}
              variant="ghost"
              className={`h-8 px-3 rounded-none text-[10px] font-sans font-bold tracking-widest hover:bg-surface-container hover:text-white ${
                resolution === res.val
                  ? "bg-surface-container text-white border-b-2 border-white"
                  : "text-muted-foreground"
              }`}
              onClick={() => setResolution(res.val)}
            >
              {res.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Graphic Area */}
      <div className="flex-1 w-full relative px-0 pb-0 flex pt-6">
        <ChartContainer
          config={chartConfig}
          className="absolute inset-0 size-full z-0 h-full w-full"
        >
          <AreaChart data={formattedChartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#555555"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={30}
              padding={{ right: 20 }}
            />
            <YAxis
              yAxisId="price"
              domain={[0, 100]}
              stroke="#555555"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
              width={40}
            />

            <ChartTooltip
              cursor={{ stroke: "#ffffff", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.3 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-surface-container border border-border p-3 flex flex-col gap-1 rounded-none shadow-xl">
                      <div className="flex justify-between gap-6">
                        <span className="text-[10px] font-sans font-bold text-muted-foreground tracking-widest uppercase">
                          PROB
                        </span>
                        <span className="text-[14px] font-heading font-bold text-white">
                          {data.price.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between gap-6">
                        <span className="text-[10px] font-sans font-bold text-muted-foreground tracking-widest uppercase">
                          TIME
                        </span>
                        <span className="text-[10px] font-sans text-muted-foreground">
                          {data.fullTime || data.time}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              yAxisId="price"
              type="linear"
              dataKey="price"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#chartGradient)"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, index } = props;
                if (index === formattedChartData.length - 1) {
                  return (
                    <g key="dot">
                      <circle cx={cx} cy={cy} r={4} fill="#10B981" stroke="none">
                        <animate
                          attributeName="r"
                          from="4"
                          to="16"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          from="0.6"
                          to="0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx={cx} cy={cy} r={4} fill="#10B981" stroke="none" />
                    </g>
                  );
                }
                return null;
              }}
              activeDot={{ r: 4, fill: "#10B981", stroke: "none" }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
