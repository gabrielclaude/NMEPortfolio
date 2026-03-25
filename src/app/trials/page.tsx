export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TRIAL_PHASE_COLORS, TRIAL_STATUS_COLORS, formatEnumLabel } from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function TrialsPage() {
  const trials = await prisma.clinicalTrial.findMany({
    include: {
      nme: { select: { id: true, name: true, code: true, therapeuticArea: true } },
      leadStaff: { select: { firstName: true, lastName: true } },
      _count: { select: { projects: true, staffAssignments: true } },
    },
    orderBy: [{ status: "asc" }, { phase: "asc" }],
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clinical Trials</h1>
        <p className="text-sm text-gray-500 mt-1">{trials.length} trials across all phases</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">NCT Number</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">NME</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Therapeutic Area</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Phase</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Enrollment</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Sites</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Budget</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Lead Staff</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Planned End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trials.map((trial) => {
                const pct = trial.targetEnrollment > 0
                  ? Math.round((trial.actualEnrollment / trial.targetEnrollment) * 100)
                  : 0;
                return (
                  <tr key={trial.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/trials/${trial.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                        {trial.nctNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/nmes/${trial.nme.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {trial.nme.name}
                      </Link>
                      <span className="block text-xs text-gray-400 font-mono">{trial.nme.code}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatEnumLabel(trial.nme.therapeuticArea)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={trial.phase} colorMap={TRIAL_PHASE_COLORS} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={trial.status} colorMap={TRIAL_STATUS_COLORS} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {trial.actualEnrollment}/{trial.targetEnrollment}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{trial.sites}</td>
                    <td className="px-4 py-3 text-gray-500">{formatCurrency(trial.budget ? Number(trial.budget) : null)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {trial.leadStaff ? `${trial.leadStaff.firstName} ${trial.leadStaff.lastName}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(trial.plannedEndDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
