"use client";

import { TrendingUp, Target, BarChart2, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelMetrics {
  mae: number;
  rmse: number;
  r2: number;
  mape: number;
}

interface ModelMetricsCardsProps {
  metrics: ModelMetrics;
  projectCount: number;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function ModelMetricsCards({ metrics, projectCount }: ModelMetricsCardsProps) {
  const r2Color = metrics.r2 >= 0.9 ? "text-emerald-600" :
                  metrics.r2 >= 0.7 ? "text-blue-600" :
                  metrics.r2 >= 0.5 ? "text-amber-600" : "text-red-600";

  const r2BgColor = metrics.r2 >= 0.9 ? "bg-emerald-50" :
                    metrics.r2 >= 0.7 ? "bg-blue-50" :
                    metrics.r2 >= 0.5 ? "bg-amber-50" : "bg-red-50";

  const mapeColor = metrics.mape <= 10 ? "text-emerald-600" :
                    metrics.mape <= 20 ? "text-blue-600" :
                    metrics.mape <= 30 ? "text-amber-600" : "text-red-600";

  const mapeBgColor = metrics.mape <= 10 ? "bg-emerald-50" :
                      metrics.mape <= 20 ? "bg-blue-50" :
                      metrics.mape <= 30 ? "bg-amber-50" : "bg-red-50";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* R² Score */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">R² Score</p>
            <p className={cn("mt-1 text-3xl font-bold", r2Color)}>
              {(metrics.r2 * 100).toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {metrics.r2 >= 0.9 ? "Excellent fit" :
               metrics.r2 >= 0.7 ? "Good fit" :
               metrics.r2 >= 0.5 ? "Moderate fit" : "Needs improvement"}
            </p>
          </div>
          <div className={cn("rounded-lg p-2.5", r2BgColor)}>
            <Target className={cn("h-5 w-5", r2Color)} />
          </div>
        </div>
      </div>

      {/* MAE */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Mean Absolute Error</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {formatCurrency(metrics.mae)}
            </p>
            <p className="mt-1 text-xs text-gray-400">Average prediction error</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-2.5">
            <BarChart2 className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* RMSE */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Root Mean Squared Error</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {formatCurrency(metrics.rmse)}
            </p>
            <p className="mt-1 text-xs text-gray-400">Penalizes large errors</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-2.5">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* MAPE */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Mean Absolute % Error</p>
            <p className={cn("mt-1 text-3xl font-bold", mapeColor)}>
              {metrics.mape.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {projectCount} projects analyzed
            </p>
          </div>
          <div className={cn("rounded-lg p-2.5", mapeBgColor)}>
            <Percent className={cn("h-5 w-5", mapeColor)} />
          </div>
        </div>
      </div>
    </div>
  );
}
