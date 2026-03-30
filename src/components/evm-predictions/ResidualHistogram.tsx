"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

interface PredictionData {
  residual: number;
}

interface ResidualHistogramProps {
  data: PredictionData[];
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function ResidualHistogram({ data }: ResidualHistogramProps) {
  // Create histogram bins
  const residuals = data.map((d) => d.residual);
  const minResidual = Math.min(...residuals);
  const maxResidual = Math.max(...residuals);
  const range = maxResidual - minResidual;
  const binCount = 15;
  const binWidth = range / binCount;

  // Initialize bins
  const bins: { min: number; max: number; count: number; label: string }[] = [];
  for (let i = 0; i < binCount; i++) {
    const binMin = minResidual + i * binWidth;
    const binMax = minResidual + (i + 1) * binWidth;
    bins.push({
      min: binMin,
      max: binMax,
      count: 0,
      label: formatCurrency((binMin + binMax) / 2),
    });
  }

  // Count residuals in each bin
  residuals.forEach((r) => {
    const binIndex = Math.min(
      Math.floor((r - minResidual) / binWidth),
      binCount - 1
    );
    if (binIndex >= 0 && binIndex < bins.length) {
      bins[binIndex].count++;
    }
  });

  // Calculate mean and std
  const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const std = Math.sqrt(
    residuals.reduce((sum, r) => sum + (r - mean) ** 2, 0) / residuals.length
  );

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={bins}
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            axisLine={{ stroke: "#d1d5db" }}
            interval={2}
            label={{
              value: "Residual (Actual - Predicted)",
              position: "bottom",
              offset: 0,
              style: { fontSize: 11, fill: "#6b7280" },
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={{ stroke: "#d1d5db" }}
            label={{
              value: "Frequency",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "#6b7280" },
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                    <p className="text-xs text-gray-500">Residual Range</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {formatCurrency(d.min)} to {formatCurrency(d.max)}
                    </p>
                    <p className="text-sm font-semibold text-emerald-600 mt-1">
                      Count: {d.count}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine x={formatCurrency(0)} stroke="#ef4444" strokeWidth={2} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {bins.map((bin, index) => {
              const midpoint = (bin.min + bin.max) / 2;
              const color = midpoint < 0 ? "#f97316" : "#10b981"; // orange for negative, green for positive
              return <Cell key={index} fill={color} fillOpacity={0.8} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Statistics */}
      <div className="flex justify-center gap-8 text-sm">
        <div className="text-center">
          <p className="text-gray-500">Mean Residual</p>
          <p className="font-semibold text-gray-900">{formatCurrency(mean)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Std Deviation</p>
          <p className="font-semibold text-gray-900">{formatCurrency(std)}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Projects</p>
          <p className="font-semibold text-gray-900">{data.length}</p>
        </div>
      </div>
    </div>
  );
}
