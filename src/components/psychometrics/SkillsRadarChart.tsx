"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { FeatureStats } from "@/lib/psychometrics";
import { PSYCHOMETRIC_COLORS } from "@/lib/psychometrics";

interface SkillsRadarChartProps {
  stats: FeatureStats[];
}

export function SkillsRadarChart({ stats }: SkillsRadarChartProps) {
  // Filter out research experience for radar (different scale)
  const radarData = stats
    .filter(s => s.name !== 'researchExperience')
    .map(s => ({
      feature: s.displayName,
      suitable: s.suitableMean,
      unsuitable: s.unsuitableMean,
      fullMark: 10,
    }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="feature"
          tick={{ fill: '#6b7280', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fill: '#9ca3af', fontSize: 10 }}
        />
        <Radar
          name="Suitable Candidates"
          dataKey="suitable"
          stroke={PSYCHOMETRIC_COLORS.suitable}
          fill={PSYCHOMETRIC_COLORS.suitable}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Radar
          name="Unsuitable Candidates"
          dataKey="unsuitable"
          stroke={PSYCHOMETRIC_COLORS.unsuitable}
          fill={PSYCHOMETRIC_COLORS.unsuitable}
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Legend
          wrapperStyle={{ paddingTop: 10 }}
          formatter={(value) => (
            <span className="text-xs text-gray-600">{value}</span>
          )}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : String(value), '']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
