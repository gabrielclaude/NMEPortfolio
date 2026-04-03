"use client";

import type { ConfusionMatrixData, ModelMetrics } from "@/lib/psychometrics";
import { cn } from "@/lib/utils";

interface ConfusionMatrixChartProps {
  matrix: ConfusionMatrixData;
  metrics: ModelMetrics;
}

export function ConfusionMatrixChart({ matrix, metrics }: ConfusionMatrixChartProps) {
  const { truePositive, trueNegative, falsePositive, falseNegative } = matrix;
  const total = truePositive + trueNegative + falsePositive + falseNegative;

  const cells = [
    { label: 'TN', value: trueNegative, color: 'bg-emerald-100 text-emerald-800', row: 0, col: 0 },
    { label: 'FP', value: falsePositive, color: 'bg-red-100 text-red-800', row: 0, col: 1 },
    { label: 'FN', value: falseNegative, color: 'bg-red-100 text-red-800', row: 1, col: 0 },
    { label: 'TP', value: truePositive, color: 'bg-emerald-100 text-emerald-800', row: 1, col: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Matrix Grid */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Y-axis label */}
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-gray-500 whitespace-nowrap">
            Actual
          </div>

          <div className="ml-4">
            {/* X-axis label */}
            <div className="text-center mb-2 text-xs font-medium text-gray-500">
              Predicted
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-2 gap-1 mb-1 ml-16">
              <div className="text-center text-xs text-gray-500">Unsuitable</div>
              <div className="text-center text-xs text-gray-500">Suitable</div>
            </div>

            <div className="flex">
              {/* Row labels */}
              <div className="flex flex-col justify-around pr-2 w-16">
                <div className="text-xs text-gray-500 text-right">Unsuitable</div>
                <div className="text-xs text-gray-500 text-right">Suitable</div>
              </div>

              {/* Matrix cells */}
              <div className="grid grid-cols-2 gap-1">
                {cells.map((cell) => (
                  <div
                    key={cell.label}
                    className={cn(
                      "w-24 h-24 flex flex-col items-center justify-center rounded-lg",
                      cell.color
                    )}
                  >
                    <span className="text-2xl font-bold">{cell.value}</span>
                    <span className="text-xs mt-1">{cell.label}</span>
                    <span className="text-xs text-gray-500">
                      ({((cell.value / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <MetricCard label="Accuracy" value={metrics.accuracy} />
        <MetricCard label="Precision" value={metrics.precision} />
        <MetricCard label="Recall" value={metrics.recall} />
        <MetricCard label="F1 Score" value={metrics.f1Score} />
        <MetricCard label="Specificity" value={metrics.specificity} />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 85) return 'text-emerald-600';
    if (v >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={cn("text-lg font-bold", getColor(value))}>{value}%</p>
    </div>
  );
}
