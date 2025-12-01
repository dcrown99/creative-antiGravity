"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HistoryEntry } from "@/services/analytics.service";
import { formatCurrency } from "@/lib/utils";

interface OverviewProps {
  data: HistoryEntry[];
}

export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
          formatter={(value: number) => [formatCurrency(value), '総資産']}
          labelFormatter={(label) => new Date(label).toLocaleDateString('ja-JP')}
        />
        <Line
          type="monotone"
          dataKey="totalValue"
          stroke="#adfa1d"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: "#adfa1d" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
