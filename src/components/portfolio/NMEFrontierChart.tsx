"use client";

import {
  ComposedChart, Scatter, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label,
} from "recharts";
import type { NMEChartPoint, FrontierLinePoint } from "@/types/nme-portfolio";

const TIER_CONFIG = {
  CORE:      { color: "#10b981", label: "CORE — top quartile Sharpe" },
  GROWTH:    { color: "#6366f1", label: "GROWTH — above median Sharpe" },
  SATELLITE: { color: "#f59e0b", label: "SATELLITE — below median Sharpe" },
  EXCLUDE:   { color: "#ef4444", label: "EXCLUDE — bottom quartile" },
} as const;

// Dot size proportional to optimal_weight (max-Sharpe allocation)
function dotRadius(optW: number): number {
  if (optW >= 0.50) return 14;
  if (optW >= 0.20) return 10;
  if (optW >= 0.05) return 7;
  return 5;
}

interface DotProps { cx?: number; cy?: number; payload?: NMEChartPoint }

function NMEDot({ cx = 0, cy = 0, payload }: DotProps) {
  if (!payload) return null;
  const cfg  = TIER_CONFIG[payload.tier as keyof typeof TIER_CONFIG] ?? { color: "#9ca3af" };
  const r    = dotRadius(payload.optimal_weight);
  return (
    <>
      <circle cx={cx} cy={cy} r={r}
        fill={cfg.color} fillOpacity={0.85}
        stroke="#fff" strokeWidth={1.5} />
      {/* NME code label for larger dots */}
      {r >= 7 && (
        <text x={cx} y={cy - r - 3}
          textAnchor="middle" fontSize={9} fill="#374151" fontWeight={600}>
          {payload.nme_code}
        </text>
      )}
    </>
  );
}

interface SmallDotProps { cx?: number; cy?: number; payload?: NMEChartPoint }

function SmallDot({ cx = 0, cy = 0, payload }: SmallDotProps) {
  if (!payload) return null;
  const cfg = TIER_CONFIG[payload.tier as keyof typeof TIER_CONFIG] ?? { color: "#9ca3af" };
  const r   = dotRadius(payload.optimal_weight);
  return (
    <circle cx={cx} cy={cy} r={r}
      fill={cfg.color} fillOpacity={0.85}
      stroke="#fff" strokeWidth={1.5} />
  );
}

interface TooltipEntry { payload: NMEChartPoint | FrontierLinePoint }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (!("nme_id" in d)) return null;   // frontier line point — skip
  const cfg = TIER_CONFIG[d.tier as keyof typeof TIER_CONFIG];
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs max-w-[230px] space-y-1">
      <p className="font-bold text-gray-900 text-sm">{d.nme_name}</p>
      <p className="font-mono text-gray-400">{d.nme_code} · {d.therapeutic_area.replace(/_/g, " ")}</p>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: cfg?.color }} />
        <span className="font-semibold" style={{ color: cfg?.color }}>{d.tier}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 pt-1 border-t border-gray-100">
        <span className="text-gray-500">Return</span>
        <span className="font-medium text-right">{(d.y * 100).toFixed(1)}%</span>
        <span className="text-gray-500">Risk</span>
        <span className="font-medium text-right">{(d.x * 100).toFixed(1)}%</span>
        <span className="text-gray-500">Sharpe</span>
        <span className="font-medium text-right">{d.sharpe_ratio.toFixed(2)}</span>
        <span className="text-gray-500">Max-Sharpe Wt</span>
        <span className="font-medium text-right">{(d.optimal_weight * 100).toFixed(1)}%</span>
        <span className="text-gray-500">Min-Var Wt</span>
        <span className="font-medium text-right">{(d.min_var_weight * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

function TierLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-xs mt-3">
      {(Object.entries(TIER_CONFIG) as [string, { color: string; label: string }][]).map(([, cfg]) => (
        <div key={cfg.label} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
          <span className="text-gray-600">{cfg.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 border-l pl-3 ml-1">
        <span className="text-gray-400">— Efficient Frontier Curve</span>
      </div>
    </div>
  );
}

export function NMEFrontierChart({
  nmePoints,
  frontierLine,
}: {
  nmePoints: NMEChartPoint[];
  frontierLine: FrontierLinePoint[];
}) {
  // Group NMEs by tier for separate Scatter series
  const grouped = Object.fromEntries(
    Object.keys(TIER_CONFIG).map((t) => [t, nmePoints.filter((p) => p.tier === t)])
  ) as Record<string, NMEChartPoint[]>;

  // Frontier line data: sort by x (risk) for a clean curve
  const lineData = [...frontierLine].sort((a, b) => a.x - b.x);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={440}>
        <ComposedChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number" dataKey="x"
            domain={[0, 0.8]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 11 }} name="Risk"
          >
            <Label value="Portfolio Risk →" offset={-10} position="insideBottom"
              style={{ fontSize: 11, fill: "#6b7280" }} />
          </XAxis>
          <YAxis
            type="number" dataKey="y"
            domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 11 }} name="Return"
          >
            <Label value="Portfolio Return →" angle={-90} position="insideLeft"
              style={{ fontSize: 11, fill: "#6b7280" }} />
          </YAxis>

          <ReferenceLine x={0.4} stroke="#e5e7eb" strokeDasharray="4 2" />
          <ReferenceLine y={0.5} stroke="#e5e7eb" strokeDasharray="4 2" />

          <Tooltip content={<CustomTooltip />} />

          {/* Efficient frontier curve */}
          <Line
            data={lineData}
            dataKey="y"
            type="monotone"
            stroke="#6366f1"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            dot={false}
            name="Efficient Frontier"
            isAnimationActive={false}
          />

          {/* NME scatter points by tier */}
          {(Object.entries(grouped) as [string, NMEChartPoint[]][]).map(([tier, pts]) =>
            pts.length > 0 ? (
              <Scatter
                key={tier}
                name={tier}
                data={pts}
                shape={tier === "CORE" ? <NMEDot /> : <SmallDot />}
                fill={TIER_CONFIG[tier as keyof typeof TIER_CONFIG]?.color ?? "#9ca3af"}
              />
            ) : null
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <TierLegend />
    </div>
  );
}
