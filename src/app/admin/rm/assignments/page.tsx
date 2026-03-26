export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getRmStaffAssignments } from "@/actions/rm-staff-assignment.actions";
import { DeleteRmStaffAssignmentButton } from "./DeleteRmStaffAssignmentButton";

const STATUS_COLORS: Record<string, string> = {
  Active: "emerald",
  "On Hold": "amber",
  Completed: "blue",
  Cancelled: "gray",
};

export default async function AdminRmAssignmentsPage() {
  const assignments = await getRmStaffAssignments();

  // Group by study for better visualization
  const studyGroups = new Map<string, typeof assignments>();
  for (const a of assignments) {
    const group = studyGroups.get(a.study_id) ?? [];
    group.push(a);
    studyGroups.set(a.study_id, group);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Staff Assignments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Assign personnel to studies with specific roles and FTE allocation
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/rm/assignments/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Assignment
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Study</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Phase</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Personnel</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Allocation</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/rm/studies/${assignment.study_id}/edit`}
                    className="font-mono font-semibold text-rose-600 hover:text-rose-800"
                  >
                    {assignment.study_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    {assignment.study_phase}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge value={assignment.study_status} colorMap={STATUS_COLORS} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/rm/personnel/${assignment.personnel_id}/edit`}
                    className="font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {assignment.personnel_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {assignment.role}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {(assignment.allocation_pct * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/admin/rm/assignments/${assignment.id}/edit`}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Link>
                    </Button>
                    <DeleteRmStaffAssignmentButton
                      id={assignment.id}
                      studyId={assignment.study_id}
                      personnelName={assignment.personnel_name}
                      role={assignment.role}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No staff assignments found. Add your first assignment to get started.</p>
          </div>
        )}
      </div>

      {/* Summary by Study */}
      {studyGroups.size > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Summary by Study</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from(studyGroups.entries()).map(([studyId, studyAssignments]) => {
              const totalAlloc = studyAssignments.reduce((sum, a) => sum + a.allocation_pct, 0);
              return (
                <div key={studyId} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-semibold text-rose-600">{studyId}</span>
                    <span className="text-xs text-gray-500">{studyAssignments.length} staff</span>
                  </div>
                  <div className="text-lg font-bold text-indigo-600">
                    {totalAlloc.toFixed(2)} FTE
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Total allocation
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
