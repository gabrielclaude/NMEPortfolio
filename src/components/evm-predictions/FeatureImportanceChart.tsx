"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface FeatureData {
  feature: string;
  importance: number;
  description: string;
}

interface FeatureImportanceChartProps {
  features: FeatureData[];
}

const COLORS = [
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
  "#f97316", // orange-500
];

export function FeatureImportanceChart({ features }: FeatureImportanceChartProps) {
  const sortedFeatures = [...features].sort((a, b) => b.importance - a.importance);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={sortedFeatures}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 0.35]}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={{ stroke: "#d1d5db" }}
        />
        <YAxis
          type="category"
          dataKey="feature"
          tick={{ fontSize: 11, fill: "#374151" }}
          axisLine={{ stroke: "#d1d5db" }}
          width={100}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload as FeatureData;
              return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg max-w-xs">
                  <p className="font-medium text-gray-900 text-sm">{d.feature}</p>
                  <p className="text-xs text-gray-500 mt-1">{d.description}</p>
                  <p className="text-sm font-semibold text-blue-600 mt-2">
                    Importance: {(d.importance * 100).toFixed(1)}%
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
          {sortedFeatures.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
