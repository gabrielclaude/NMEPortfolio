"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { MonthlyDemandChartRow } from "@/types/resource-management";

const ROLE_COLORS: Record<string, string> = {
  "Clinical Scientist": "#6366f1",
  "Medical Monitor":    "#10b981",
  "Clinical RA":        "#f59e0b",
};

const ROLES = ["Clinical Scientist", "Medical Monitor", "Clinical RA"] as const;

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs space-y-1 min-w-[180px]">
      <p className="font-bold text-gray-900 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
            <span className="text-gray-600">{p.name}</span>
          </div>
          <span className="font-semibold text-gray-800">{p.value.toFixed(2)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-gray-100 pt-1 mt-1">
        <span className="text-gray-500 font-medium">Total</span>
        <span className="font-bold text-gray-900">{total.toFixed(2)} FTE</span>
      </div>
    </div>
  );
}

export function FTEDemandChart({ data }: { data: MonthlyDemandChartRow[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 0);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, bottom: 50, left: 10 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month_label"
            tick={{ fontSize: 9, fill: "#6b7280" }}
            angle={-45}
            textAnchor="end"
            interval={2}
            height={55}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickFormatter={(v) => `${v.toFixed(0)}`}
            label={{
              value: "FTE Demand",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10, fill: "#6b7280" },
              offset: 10,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="square"
            iconSize={10}
          />
          {maxTotal > 0 && (
            <ReferenceLine
              y={maxTotal * 0.8}
              stroke="#ef4444"
              strokeDasharray="4 2"
              label={{ value: "80% peak", fontSize: 9, fill: "#ef4444" }}
            />
          )}
          {ROLES.map((role) => (
            <Bar
              key={role}
              dataKey={role}
              stackId="fte"
              fill={ROLE_COLORS[role]}
              name={role}
              radius={role === "Clinical RA" ? [3, 3, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
