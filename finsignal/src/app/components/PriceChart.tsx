import React from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { StockHistoryItem } from "../types";

interface PriceChartProps {
  data: StockHistoryItem[];
  symbol: string;
}

export default function PriceChart({ data, symbol }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500">
        No charting data available for {symbol}.
      </div>
    );
  }

  // Format date strings for chart axis
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  // Custom chart tooltip styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-zinc-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
          <p className="font-mono text-xs font-semibold text-zinc-400">{label}</p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-6 justify-between text-xs">
              <span className="text-zinc-500">Price:</span>
              <span className="font-mono font-bold text-blue-600">
                ${payload[1]?.value ? payload[1].value.toFixed(2) : payload[0]?.value?.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-6 justify-between text-xs">
              <span className="text-zinc-500">Volume:</span>
              <span className="font-mono font-bold text-zinc-800">
                {payload[0]?.value ? payload[0].value.toLocaleString() : "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1.5 pt-1.5 border-t border-zinc-100 text-[10px] text-zinc-400 font-mono">
              <div>O: ${payload[0]?.payload?.open?.toFixed(2)}</div>
              <div>H: ${payload[0]?.payload?.high?.toFixed(2)}</div>
              <div>L: ${payload[0]?.payload?.low?.toFixed(2)}</div>
              <div>C: ${payload[0]?.payload?.close?.toFixed(2)}</div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 italic block mb-1">
            Forensic Volume Profiler
          </span>
          <h3 className="font-display text-base font-bold text-zinc-900 tracking-tight">
            100-Day Composite Price & Vol Ledger
          </h3>
        </div>
        <div className="flex gap-4 font-mono text-[10px] uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-blue-600">
            <span className="h-2.5 w-2.5 rounded bg-blue-600" />
            <span>Price</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="h-2.5 w-2.5 rounded bg-zinc-200" />
            <span>Volume</span>
          </div>
        </div>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={formattedData}
            margin={{ top: 10, right: -15, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              stroke="#94a3b8"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              dy={10}
            />
            {/* Left YAxis - Price */}
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#2563eb"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(val) => `$${val}`}
            />
            {/* Right YAxis - Volume */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94a3b8"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              tickFormatter={(val) =>
                val >= 1e6 ? `${(val / 1e6).toFixed(1)}M` : val >= 1e3 ? `${(val / 1e3).toFixed(0)}k` : val
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(0, 0, 0, 0.1)", strokeWidth: 1 }} />
            {/* Right Axis Bar Chart (Volume) */}
            <Bar
              yAxisId="right"
              dataKey="volume"
              fill="rgba(0, 0, 0, 0.05)"
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            />
            {/* Left Axis Line Chart (Price) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="close"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#dc2626" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
