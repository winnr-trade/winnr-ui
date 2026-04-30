import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";

const chartConfig = {
  price: {
    label: "Price (¢)",
    color: "#10B981",
  },
} satisfies ChartConfig;

type Resolution = "1m" | "15m" | "1h" | "1d" | "1w" | "all";

interface MarketPriceChartProps {
  chartData: { time: string; price: number }[];
  resolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
  isConnected: boolean;
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
}: MarketPriceChartProps) {
  return (
    <Card className="bg-surface-container-low border border-border rounded-none shadow-none flex flex-col relative h-[400px]">
      {/* Chart Header */}
      <div className="p-6 flex justify-between items-center z-10 border-b border-border/50">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
            PROBABILITY
          </span>
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-none ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`}
            ></div>
            <span className="text-[10px] text-muted-foreground font-sans uppercase tracking-widest">
              {isConnected ? "LIVE" : "CONNECTING..."}
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
              onClick={() => onResolutionChange(res.val)}
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
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
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
                if (index === chartData.length - 1) {
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
