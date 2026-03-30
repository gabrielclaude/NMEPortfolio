"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
} from "recharts";

interface PredictionData {
  project_id: string;
  project_name: string;
  predicted_ev: number;
  actual_ev: number;
  status: string;
}

interface PredictionScatterChartProps {
  data: PredictionData[];
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "on_track":
      return "#10b981"; // emerald-500
    case "at_risk":
      return "#f59e0b"; // amber-500
    case "critical":
      return "#ef4444"; // red-500
    default:
      return "#6b7280"; // gray-500
  }
}

export function PredictionScatterChart({ data }: PredictionScatterChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.predicted_ev, d.actual_ev))
  );

  const chartData = data.map((d) => ({
    ...d,
    x: d.actual_ev,
    y: d.predicted_ev,
    z: 100, // Size
    fill: getStatusColor(d.status),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          type="number"
          dataKey="x"
          name="Actual EV"
          tickFormatter={formatCurrency}
          domain={[0, maxValue * 1.1]}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={{ stroke: "#d1d5db" }}
          label={{
            value: "Actual EV",
            position: "bottom",
            offset: 0,
            style: { fontSize: 11, fill: "#6b7280" },
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Predicted EV"
          tickFormatter={formatCurrency}
          domain={[0, maxValue * 1.1]}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={{ stroke: "#d1d5db" }}
          label={{
            value: "Predicted EV",
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 11, fill: "#6b7280" },
          }}
        />
        <ZAxis type="number" dataKey="z" range={[50, 150]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                  <p className="font-medium text-gray-900 text-sm">{d.project_name}</p>
                  <p className="text-xs text-gray-500">{d.project_id}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs">
                      <span className="text-gray-500">Actual:</span>{" "}
                      <span className="font-medium">{formatCurrency(d.actual_ev)}</span>
                    </p>
                    <p className="text-xs">
                      <span className="text-gray-500">Predicted:</span>{" "}
                      <span className="font-medium">{formatCurrency(d.predicted_ev)}</span>
                    </p>
                    <p className="text-xs">
                      <span className="text-gray-500">Error:</span>{" "}
                      <span className="font-medium">
                        {formatCurrency(Math.abs(d.actual_ev - d.predicted_ev))}
                      </span>
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <ReferenceLine
          segment={[
            { x: 0, y: 0 },
            { x: maxValue, y: maxValue },
          ]}
          stroke="#3b82f6"
          strokeDasharray="5 5"
          strokeWidth={2}
        />
        <Scatter
          name="Projects"
          data={chartData}
          fill="#3b82f6"
          fillOpacity={0.7}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
