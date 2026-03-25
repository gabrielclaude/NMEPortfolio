import Link from "next/link";
import { EVMGauge, EVMStatusDot } from "./EVMGauge";
import { NME_STATUS_COLORS, formatEnumLabel } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { NMEEVMRow } from "@/types/evm";

export function NMEEVMTable({ rows }: { rows: NMEEVMRow[] }) {
  if (rows.length === 0) {
    return <p className="p-5 text-sm text-gray-400">No NME EVM data available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-500">NME</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Area</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">BAC</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">PV</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">EV</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">AC</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">SPI</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">CPI</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">EAC</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">VAC</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Task%</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500">Projects</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => {
            const spi = row.portfolio_spi ?? 1;
            const cpi = row.portfolio_cpi ?? 1;
            const sv = Number(row.total_ev) - Number(row.total_pv);
            const cv = Number(row.total_ev) - Number(row.total_ac);

            return (
              <tr key={row.nme_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/nmes/${row.nme_id}`} className="font-medium text-blue-600 hover:underline">
                    {row.nme_name}
                  </Link>
                  <span className="block text-xs font-mono text-gray-400">{row.nme_code}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={row.nme_status} colorMap={NME_STATUS_COLORS} />
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatEnumLabel(row.therapeutic_area)}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(Number(row.total_bac))}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(Number(row.total_pv))}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(Number(row.total_ev))}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(Number(row.total_ac))}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <EVMStatusDot value={spi} />
                    <EVMGauge value={spi} />
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <EVMStatusDot value={cpi} />
                    <EVMGauge value={cpi} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {row.portfolio_eac != null ? formatCurrency(Number(row.portfolio_eac)) : "—"}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${
                  row.portfolio_vac == null ? "text-gray-400" :
                  Number(row.portfolio_vac) >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  {row.portfolio_vac != null ? formatCurrency(Number(row.portfolio_vac)) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(row.task_completion_pct ?? 0, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{row.task_completion_pct ?? 0}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                    {row.project_count}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
