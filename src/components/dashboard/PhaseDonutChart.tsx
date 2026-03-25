"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { PHASE_CHART_COLORS, formatEnumLabel } from "@/lib/constants";

interface PhaseDataItem {
  phase: string;
  count: number;
}

export function PhaseDonutChart({ data }: { data: PhaseDataItem[] }) {
  const chartData = data
    .sort((a, b) => b.count - a.count)
    .map((d) => ({
      name: formatEnumLabel(d.phase),
      value: d.count,
      fill: PHASE_CHART_COLORS[d.phase] ?? "#94a3b8",
    }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              `${value} trials (${Math.round((Number(value) / total) * 100)}%)`,
              "",
            ]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-500 -mt-2">{total} total trials</p>
    </div>
  );
}
