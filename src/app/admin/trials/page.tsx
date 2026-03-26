export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TRIAL_STATUS_COLORS } from "@/lib/constants";
import { TrialPhaseLabels, TrialStatusLabels } from "@/lib/validations/trial";
import { DeleteTrialButton } from "./DeleteTrialButton";

export default async function AdminTrialsPage() {
  const trials = await prisma.clinicalTrial.findMany({
    orderBy: { nctNumber: "asc" },
    include: {
      nme: { select: { code: true, name: true } },
      leadStaff: { select: { firstName: true, lastName: true } },
      _count: {
        select: {
          projects: true,
          staffAssignments: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Trials</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create, edit, and delete clinical trials
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/trials/upload">
              <Upload className="h-4 w-4 mr-1" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/trials/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Trial
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">NCT Number</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">NME</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Phase</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Lead</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trials.map((trial) => {
              const totalRelations = trial._count.projects + trial._count.staffAssignments;
              return (
                <tr key={trial.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-indigo-600">{trial.nctNumber}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {trial.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="font-mono text-xs">{trial.nme.code}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {TrialPhaseLabels[trial.phase as keyof typeof TrialPhaseLabels]}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      value={trial.status}
                      colorMap={TRIAL_STATUS_COLORS}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {trial.leadStaff
                      ? `${trial.leadStaff.firstName} ${trial.leadStaff.lastName}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/trials/${trial.id}/edit`}>
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Link>
                      </Button>
                      <DeleteTrialButton
                        id={trial.id}
                        nctNumber={trial.nctNumber}
                        relationCount={totalRelations}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {trials.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No trials found. Create your first trial to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
