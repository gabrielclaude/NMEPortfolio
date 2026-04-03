"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { FeatureStats } from "@/lib/psychometrics";
import { PSYCHOMETRIC_COLORS } from "@/lib/psychometrics";

interface FeatureDistributionChartProps {
  stats: FeatureStats[];
}

export function FeatureDistributionChart({ stats }: FeatureDistributionChartProps) {
  const chartData = stats.map(s => ({
    name: s.displayName.length > 12 ? s.displayName.slice(0, 12) + '...' : s.displayName,
    fullName: s.displayName,
    suitable: s.suitableMean,
    unsuitable: s.unsuitableMean,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280', fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          domain={[0, 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value) => [
            typeof value === 'number' ? value.toFixed(2) : String(value),
            '',
          ]}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return payload[0].payload.fullName;
            }
            return label;
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: 20 }}
          formatter={(value) => (
            <span className="text-xs text-gray-600">
              {value === 'suitable' ? 'Suitable Candidates' : 'Unsuitable Candidates'}
            </span>
          )}
        />
        <Bar
          dataKey="suitable"
          fill={PSYCHOMETRIC_COLORS.suitable}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="unsuitable"
          fill={PSYCHOMETRIC_COLORS.unsuitable}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
