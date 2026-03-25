import Link from "next/link";
import { EVMGauge, EVMStatusDot } from "./EVMGauge";
import { PROJECT_STATUS_COLORS, TRIAL_PHASE_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProjectEVMRow } from "@/types/evm";

type ProjectEVMRowFull = ProjectEVMRow & {
  sv: number; cv: number; spi: number; cpi: number;
  eac: number; etc: number; vac: number; tcpi: number;
};

export function ProjectEVMTable({ rows }: { rows: ProjectEVMRowFull[] }) {
  if (rows.length === 0) {
    return <p className="p-5 text-sm text-gray-400">No project EVM data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-500">Project</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">NME</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Phase</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">BAC</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">SV</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">CV</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">SPI</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">CPI</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">EAC</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">VAC</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">TCPI</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Task%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.project_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/projects/${row.project_id}`} className="font-medium text-blue-600 hover:underline">
                  {row.project_name}
                </Link>
                <span className="block text-xs font-mono text-gray-400">{row.project_code}</span>
              </td>
              <td className="px-4 py-3">
                <Link href={`/nmes/${row.nme_id}`} className="text-xs text-gray-600 hover:text-blue-600 hover:underline">
                  {row.nme_name}
                </Link>
                <span className="block text-xs font-mono text-gray-400">{row.nct_number}</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge value={row.trial_phase} colorMap={TRIAL_PHASE_COLORS} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge value={row.project_status} colorMap={PROJECT_STATUS_COLORS} />
              </td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(Number(row.bac))}</td>
              <td className={`px-4 py-3 text-right font-medium ${row.sv >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(row.sv)}
              </td>
              <td className={`px-4 py-3 text-right font-medium ${row.cv >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(row.cv)}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <EVMStatusDot value={row.spi} />
                  <EVMGauge value={row.spi} />
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <EVMStatusDot value={row.cpi} />
                  <EVMGauge value={row.cpi} />
                </div>
              </td>
              <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(row.eac)}</td>
              <td className={`px-4 py-3 text-right font-medium ${row.vac >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(row.vac)}
              </td>
              <td className="px-4 py-3 text-center">
                <EVMGauge value={row.tcpi} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(Number(row.task_completion_pct ?? 0), 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{Number(row.task_completion_pct ?? 0)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
