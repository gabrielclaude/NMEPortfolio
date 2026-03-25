export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { NME_STATUS_COLORS, TRIAL_PHASE_COLORS, TRIAL_STATUS_COLORS, formatEnumLabel } from "@/lib/constants";
import { formatDate, formatCurrency, formatEnrollment } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { EVMGauge, EVMStatusDot } from "@/components/evm/EVMGauge";
import type { NMEEVMRow } from "@/types/evm";

export default async function NMEDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [nme, evmRows] = await Promise.all([
    prisma.nME.findUnique({
      where: { id },
      include: {
        trials: {
          include: {
            _count: { select: { projects: true } },
            leadStaff: { select: { firstName: true, lastName: true } },
          },
          orderBy: { plannedStartDate: "desc" },
        },
      },
    }),
    prisma.$queryRaw<NMEEVMRow[]>`SELECT * FROM v_nme_evm WHERE nme_id = ${id}`,
  ]);

  if (!nme) notFound();

  const evm = evmRows[0] ?? null;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Link href="/nmes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft className="h-4 w-4" />
        NME Portfolio
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-gray-500">{nme.code}</span>
            <h1 className="text-2xl font-bold text-gray-900">{nme.name}</h1>
            <StatusBadge value={nme.status} colorMap={NME_STATUS_COLORS} />
          </div>
          {nme.genericName && <p className="text-sm text-gray-400 mt-1 italic">{nme.genericName}</p>}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Metadata + EVM */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Compound Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Therapeutic Area</dt>
                <dd className="font-medium text-gray-800">{formatEnumLabel(nme.therapeuticArea)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Molecule Type</dt>
                <dd className="font-medium text-gray-800">{formatEnumLabel(nme.moleculeType)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Target Indication</dt>
                <dd className="font-medium text-gray-800 text-right max-w-[180px]">{nme.targetIndication}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Mechanism</dt>
                <dd className="font-medium text-gray-800 text-right max-w-[180px]">{nme.mechanismOfAction ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Originator</dt>
                <dd className="font-medium text-gray-800">{nme.originatorCompany ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Discovery Date</dt>
                <dd className="font-medium text-gray-800">{formatDate(nme.discoveryDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">IND Filing</dt>
                <dd className="font-medium text-gray-800">{formatDate(nme.indFilingDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Patent Expiry</dt>
                <dd className="font-medium text-gray-800">{formatDate(nme.patentExpiry)}</dd>
              </div>
            </dl>
          </div>

          {/* EVM Panel */}
          {evm && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Portfolio EVM</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Projects</dt>
                  <dd className="font-medium text-gray-800">{evm.project_count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total BAC</dt>
                  <dd className="font-medium text-gray-800">{formatCurrency(Number(evm.total_bac))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Planned Value</dt>
                  <dd className="font-medium text-gray-800">{formatCurrency(Number(evm.total_pv))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Earned Value</dt>
                  <dd className="font-medium text-gray-800">{formatCurrency(Number(evm.total_ev))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Actual Cost</dt>
                  <dd className="font-medium text-gray-800">{formatCurrency(Number(evm.total_ac))}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">SPI</dt>
                  <dd className="flex items-center gap-1">
                    <EVMStatusDot value={evm.portfolio_spi} />
                    <EVMGauge value={evm.portfolio_spi} />
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">CPI</dt>
                  <dd className="flex items-center gap-1">
                    <EVMStatusDot value={evm.portfolio_cpi} />
                    <EVMGauge value={evm.portfolio_cpi} />
                  </dd>
                </div>
                {evm.portfolio_eac != null && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">EAC</dt>
                    <dd className="font-medium text-gray-800">{formatCurrency(Number(evm.portfolio_eac))}</dd>
                  </div>
                )}
                {evm.portfolio_vac != null && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">VAC</dt>
                    <dd className={`font-medium ${Number(evm.portfolio_vac) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(Number(evm.portfolio_vac))}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Task Completion</dt>
                  <dd className="font-medium text-gray-800">{Number(evm.task_completion_pct ?? 0)}%</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Right: Trials */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-700">Clinical Trials ({nme.trials.length})</h2>
            </div>
            {nme.trials.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No trials associated with this NME.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">NCT Number</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Phase</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Enrollment</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Budget</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Lead</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {nme.trials.map((trial) => (
                    <tr key={trial.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/trials/${trial.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                          {trial.nctNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={trial.phase} colorMap={TRIAL_PHASE_COLORS} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={trial.status} colorMap={TRIAL_STATUS_COLORS} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatEnrollment(trial.actualEnrollment, trial.targetEnrollment)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatCurrency(trial.budget ? Number(trial.budget) : null)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {trial.leadStaff ? `${trial.leadStaff.firstName} ${trial.leadStaff.lastName}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
