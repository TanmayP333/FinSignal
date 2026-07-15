"use client";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PriceChart({ data }) {
  return (
    <div className="h-[400px] w-full bg-gray-900/50 p-4 rounded-xl border border-gray-800">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="date" stroke="#666" fontSize={12} tickFormatter={(str) => str.split('-').slice(1).join('/')} />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={12} domain={['auto', 'auto']} />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend />
          <Bar yAxisId="right" dataKey="volume" fill="#1f2937" name="Volume" />
          <Line yAxisId="left" type="monotone" dataKey="close" stroke="#3b82f6" dot={false} strokeWidth={2} name="Price ($)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
