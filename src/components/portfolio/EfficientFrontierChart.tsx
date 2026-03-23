"use client";

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label,
} from "recharts";
import type { ChartPoint } from "@/types/portfolio";

const TIER_CONFIG = {
  SELECT:  { color: "#10b981", label: "SELECT (Frontier + Nash)" },
  CONSIDER:{ color: "#6366f1", label: "CONSIDER (Frontier or Nash)" },
  MONITOR: { color: "#f59e0b", label: "MONITOR" },
  DEFER:   { color: "#ef4444", label: "DEFER" },
} as const;

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartPoint;
}

function CustomDot({ cx = 0, cy = 0, payload }: CustomDotProps) {
  if (!payload) return null;
  const cfg = TIER_CONFIG[payload.recommendation as keyof typeof TIER_CONFIG] ??
    { color: "#9ca3af" };
  const r   = payload.is_frontier ? 8 : payload.nash_preferred ? 6 : 4;
  const strokeW = payload.is_frontier ? 2.5 : 1.5;
  return (
    <circle
      cx={cx} cy={cy} r={r}
      fill={cfg.color}
      fillOpacity={0.85}
      stroke="#fff"
      strokeWidth={strokeW}
    />
  );
}

interface TooltipPayloadEntry {
  payload: ChartPoint;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cfg = TIER_CONFIG[d.recommendation as keyof typeof TIER_CONFIG];
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs space-y-1 max-w-[220px]">
      <p className="font-semibold text-gray-800 text-sm leading-tight">{d.project_name}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span
          className="inline-block h-2 w-2 rounded-full flex-shrink-0"
          style={{ background: cfg?.color }}
        />
        <span className="font-medium" style={{ color: cfg?.color }}>
          {d.recommendation}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 pt-1">
        <span className="text-gray-500">Return</span>
        <span className="font-medium text-right">{(d.y * 100).toFixed(1)}%</span>
        <span className="text-gray-500">Risk</span>
        <span className="font-medium text-right">{(d.x * 100).toFixed(1)}%</span>
        <span className="text-gray-500">Score</span>
        <span className="font-medium text-right">{d.combined_score.toFixed(3)}</span>
        <span className="text-gray-500">Frontier</span>
        <span className="font-medium text-right">{d.is_frontier ? "Yes" : "No"}</span>
        <span className="text-gray-500">Nash</span>
        <span className="font-medium text-right">{d.nash_preferred ? "Yes" : "No"}</span>
      </div>
    </div>
  );
}

function LegendContent() {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-xs mt-2">
      {(Object.entries(TIER_CONFIG) as [string, { color: string; label: string }][]).map(([, cfg]) => (
        <div key={cfg.label} className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full" style={{ background: cfg.color }} />
          <span className="text-gray-600">{cfg.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 ml-2 border-l pl-2">
        <span className="inline-block h-4 w-4 rounded-full border-2 border-gray-400 bg-transparent" />
        <span className="text-gray-500">Larger = frontier</span>
      </div>
    </div>
  );
}

export function EfficientFrontierChart({ points }: { points: ChartPoint[] }) {
  // Group by recommendation for separate Scatter series (needed for legend colours)
  const grouped = Object.fromEntries(
    Object.keys(TIER_CONFIG).map((tier) => [
      tier,
      points.filter((p) => p.recommendation === tier),
    ])
  ) as Record<string, ChartPoint[]>;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 11 }}
          >
            <Label value="Risk Score →" offset={-10} position="insideBottom" style={{ fontSize: 11, fill: "#6b7280" }} />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 11 }}
          >
            <Label value="Return Score →" angle={-90} position="insideLeft" style={{ fontSize: 11, fill: "#6b7280" }} />
          </YAxis>

          {/* Quadrant guidelines */}
          <ReferenceLine x={0.5} stroke="#e5e7eb" strokeDasharray="4 2" />
          <ReferenceLine y={0.5} stroke="#e5e7eb" strokeDasharray="4 2" />

          <Tooltip content={<CustomTooltip />} />
          <Legend content={<LegendContent />} />

          {(Object.entries(grouped) as [string, ChartPoint[]][]).map(([tier, pts]) => (
            <Scatter
              key={tier}
              name={tier}
              data={pts}
              shape={<CustomDot />}
              fill={TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.color ?? "#9ca3af"}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant labels */}
      <div className="relative -mt-2 mx-8 h-0">
        <span className="absolute left-0 top-0 text-xs text-gray-300 select-none">
          ← Low risk / Low return
        </span>
        <span className="absolute right-0 top-0 text-xs text-gray-300 select-none">
          High risk / High return →
        </span>
      </div>
    </div>
  );
}
