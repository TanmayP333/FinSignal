'use client';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceChart({ data }) {
  // Graceful fallback for empty data
  if (!data || data.length === 0) {
    return <div className="w-full h-64 bg-[#141b22] border border-[#1e2a35] rounded flex items-center justify-center text-[#4a6070] font-mono text-xs">Awaiting Chart Data...</div>;
  }

  return (
    <div className="w-full h-64 bg-[#141b22] border border-[#1e2a35] rounded p-4 relative overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2a35" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#4a6070', fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(val) => val.substring(5)} // Strips YYYY- to just show MM-DD
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis 
            yAxisId="price"
            domain={['auto', 'auto']}
            tick={{ fill: '#4a6070', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            domain={[0, 'dataMax * 3']} // Keeps volume bars in the lower third of the chart
            tick={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0e1318', border: '1px solid #1e2a35', borderRadius: '4px', fontSize: '12px' }}
            itemStyle={{ color: '#c8d8e4', fontFamily: 'monospace' }}
            labelStyle={{ color: '#7a9ab0', fontFamily: 'monospace', marginBottom: '4px' }}
          />
          <Bar yAxisId="volume" dataKey="volume" name="Volume" fill="#4a6070" opacity={0.3} />
          <Line yAxisId="price" type="monotone" dataKey="close" name="Close Price" stroke="#e8a020" dot={false} strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
