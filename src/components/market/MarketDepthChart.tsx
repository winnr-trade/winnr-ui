"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

interface MarketDepthChartProps {
  bids: [number, number][];
  asks: [number, number][];
}

export function MarketDepthChart({ bids, asks }: MarketDepthChartProps) {
  // Process bids: sort descending, calculate cumulative volume
  const sortedBids = [...bids].sort((a, b) => b[0] - a[0]);
  let cumulativeBids = 0;
  const bidData = sortedBids.map(([price, size]) => {
    cumulativeBids += size;
    return { price, bids: cumulativeBids, asks: null };
  }).reverse(); // Reverse so prices go left-to-right on X-axis

  // Process asks: sort ascending, calculate cumulative volume
  const sortedAsks = [...asks].sort((a, b) => a[0] - b[0]);
  let cumulativeAsks = 0;
  const askData = sortedAsks.map(([price, size]) => {
    cumulativeAsks += size;
    return { price, bids: null, asks: cumulativeAsks };
  });

  // Combine data for the chart
  const chartData = [...bidData, ...askData].sort((a, b) => a.price - b.price);

  return (
    <Card className="bg-surface-container-low border border-border rounded-none shadow-none flex flex-col relative h-[300px] p-6">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
          DEPTH CHART
        </span>
        <div className="flex gap-4">
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-500">BIDS</span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-destructive">ASKS</span>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAsks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="price" 
              hide 
              domain={['dataMin', 'dataMax']}
            />
            <YAxis hide />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-surface-container border border-border p-3 flex flex-col gap-1 rounded-none shadow-xl">
                      <div className="flex justify-between gap-6">
                        <span className="text-[10px] font-sans font-bold text-muted-foreground tracking-widest uppercase">
                          PRICE
                        </span>
                        <span className="text-[12px] font-heading font-bold text-white">
                          {data.price.toFixed(1)}¢
                        </span>
                      </div>
                      <div className="flex justify-between gap-6">
                        <span className="text-[10px] font-sans font-bold text-muted-foreground tracking-widest uppercase">
                          DEPTH
                        </span>
                        <span className="text-[12px] font-heading font-bold text-white">
                          {data.bids || data.asks}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="stepAfter"
              dataKey="bids"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#colorBids)"
              strokeWidth={2}
              connectNulls
            />
            <Area
              type="stepAfter"
              dataKey="asks"
              stroke="#EF4444"
              fillOpacity={1}
              fill="url(#colorAsks)"
              strokeWidth={2}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
