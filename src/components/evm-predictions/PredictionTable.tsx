"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVMGauge } from "@/components/evm/EVMGauge";

interface PredictionData {
  project_id: string;
  project_name: string;
  nme_name: string;
  therapeutic_area: string;
  bac: number;
  pv: number;
  actual_ev: number;
  predicted_ev: number;
  ac: number;
  percent_complete: number;
  residual: number;
  percent_error: number;
  predicted_spi: number;
  predicted_cpi: number;
  status: string;
}

interface PredictionTableProps {
  data: PredictionData[];
}

type SortKey = "project_name" | "bac" | "actual_ev" | "predicted_ev" | "percent_error" | "predicted_spi" | "predicted_cpi";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function getStatusBadge(status: string) {
  const styles = {
    on_track: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    at_risk: "bg-amber-50 text-amber-700 ring-amber-200",
    critical: "bg-red-50 text-red-700 ring-red-200",
  };
  const labels = {
    on_track: "On Track",
    at_risk: "At Risk",
    critical: "Critical",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status as keyof typeof styles] || "bg-gray-50 text-gray-700 ring-gray-200"
      )}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

export function PredictionTable({ data }: PredictionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("bac");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => handleSort(sortKeyName)}
      className="flex items-center gap-1 text-left hover:text-gray-900"
    >
      {label}
      {sortKey === sortKeyName ? (
        sortDir === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600">
              <SortHeader label="Project" sortKeyName="project_name" />
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-gray-600">
              NME / Area
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-gray-600">
              <SortHeader label="BAC" sortKeyName="bac" />
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-gray-600">
              <SortHeader label="Actual EV" sortKeyName="actual_ev" />
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-gray-600">
              <SortHeader label="Predicted EV" sortKeyName="predicted_ev" />
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-gray-600">
              <SortHeader label="Error %" sortKeyName="percent_error" />
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold text-gray-600">
              <SortHeader label="Pred. SPI" sortKeyName="predicted_spi" />
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold text-gray-600">
              <SortHeader label="Pred. CPI" sortKeyName="predicted_cpi" />
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-center text-xs font-semibold text-gray-600">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedData.map((row) => (
            <tr key={row.project_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{row.project_name}</p>
                  <p className="text-xs text-gray-500">{row.project_id}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="text-gray-900">{row.nme_name}</p>
                  <p className="text-xs text-gray-500">{row.therapeutic_area.replace(/_/g, " ")}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">
                {formatCurrency(row.bac)}
              </td>
              <td className="px-4 py-3 text-right text-gray-700">
                {formatCurrency(row.actual_ev)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-blue-600">
                {formatCurrency(row.predicted_ev)}
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={cn(
                    "font-medium",
                    row.percent_error <= 5 ? "text-emerald-600" :
                    row.percent_error <= 15 ? "text-amber-600" : "text-red-600"
                  )}
                >
                  {row.percent_error.toFixed(1)}%
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <EVMGauge value={row.predicted_spi} />
              </td>
              <td className="px-4 py-3 text-center">
                <EVMGauge value={row.predicted_cpi} />
              </td>
              <td className="px-4 py-3 text-center">
                {getStatusBadge(row.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedData.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No prediction data available
        </div>
      )}
    </div>
  );
}
