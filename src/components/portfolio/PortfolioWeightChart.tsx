"use client";

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { THERAPEUTIC_AREA_COLORS } from "@/lib/constants";
import type { NMEPortfolioOptRow } from "@/types/nme-portfolio";

interface WeightEntry {
  nme_id: string;
  nme_code: string;
  nme_name: string;
  therapeutic_area: string;
  value: number;       // percentage 0–100
  color: string;
}

interface TooltipPayloadEntry { payload: WeightEntry }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs space-y-0.5">
      <p className="font-bold text-gray-900">{d.nme_name}</p>
      <p className="font-mono text-gray-400">{d.nme_code}</p>
      <p className="text-gray-500">{d.therapeutic_area.replace(/_/g, " ")}</p>
      <p className="text-indigo-600 font-semibold mt-1">{d.value.toFixed(1)}% allocation</p>
    </div>
  );
}

function CustomLegend({ entries }: { entries: WeightEntry[] }) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-1">
      {entries.map((e) => (
        <div key={e.nme_id} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: e.color }} />
            <span className="truncate text-gray-700 font-medium">{e.nme_code}</span>
            <span className="truncate text-gray-400 hidden sm:block">{e.nme_name}</span>
          </div>
          <span className="font-semibold text-gray-800 ml-2 flex-shrink-0">
            {e.value.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function PortfolioWeightChart({
  nmes,
  weightKey = "optimal_weight",
  title = "Max-Sharpe Allocation",
}: {
  nmes: NMEPortfolioOptRow[];
  weightKey?: "optimal_weight" | "min_var_weight";
  title?: string;
}) {
  const entries: WeightEntry[] = nmes
    .filter((n) => Number(n[weightKey]) > 0.005)
    .sort((a, b) => Number(b[weightKey]) - Number(a[weightKey]))
    .map((n) => ({
      nme_id: n.nme_id,
      nme_code: n.nme_code,
      nme_name: n.nme_name,
      therapeutic_area: n.therapeutic_area,
      value: Number(n[weightKey]) * 100,
      color: THERAPEUTIC_AREA_COLORS[n.therapeutic_area] ?? "#94a3b8",
    }));

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No allocation data available
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={entries}
            dataKey="value"
            nameKey="nme_code"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
          >
            {entries.map((e) => (
              <Cell key={e.nme_id} fill={e.color} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={() => null} />
        </PieChart>
      </ResponsiveContainer>
      <CustomLegend entries={entries} />
    </div>
  );
}
