"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { THERAPEUTIC_AREA_COLORS, formatEnumLabel } from "@/lib/constants";

interface AreaDataItem {
  area: string;
  count: number;
}

export function TherapeuticAreaChart({ data }: { data: AreaDataItem[] }) {
  const chartData = data
    .sort((a, b) => b.count - a.count)
    .map((d) => ({
      name: formatEnumLabel(d.area),
      value: d.count,
      key: d.area,
      fill: THERAPEUTIC_AREA_COLORS[d.area] ?? "#94a3b8",
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11 }}
          width={130}
        />
        <Tooltip
          formatter={(value) => [`${value} NMEs`, ""]}
          cursor={{ fill: "#f3f4f6" }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
