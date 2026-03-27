export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getRmFteMatrixEntries } from "@/actions/rm-fte-matrix.actions";
import { DeleteRmFteMatrixButton } from "./DeleteRmFteMatrixButton";

const COMPLEXITY_COLORS: Record<string, string> = {
  Low: "green",
  Medium: "amber",
  High: "red",
};

const ACTIVITY_COLORS: Record<string, string> = {
  "Start Up": "indigo",
  "Conduct": "emerald",
  "Close Out": "amber",
};

export default async function AdminRmFteMatrixPage() {
  const entries = await getRmFteMatrixEntries();

  // Group by complexity for summary
  const complexityGroups = new Map<string, typeof entries>();
  for (const entry of entries) {
    const group = complexityGroups.get(entry.complexity) ?? [];
    group.push(entry);
    complexityGroups.set(entry.complexity, group);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FTE Attribute Matrix</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Reference FTE values by complexity, role, phase, and activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/rm/fte-matrix/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Entry
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-center font-medium text-gray-500">Complexity</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Phase</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Activity</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">FTE/Month</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-center">
                  <StatusBadge value={entry.complexity} colorMap={COMPLEXITY_COLORS} />
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {entry.role}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    {entry.phase}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge value={entry.activity} colorMap={ACTIVITY_COLORS} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {entry.fte_per_month.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/admin/rm/fte-matrix/${entry.id}/edit`}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Link>
                    </Button>
                    <DeleteRmFteMatrixButton
                      id={entry.id}
                      complexity={entry.complexity}
                      role={entry.role}
                      activity={entry.activity}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No FTE matrix entries found. Add your first entry to get started.</p>
          </div>
        )}
      </div>

      {/* Summary by Complexity */}
      {complexityGroups.size > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Summary by Complexity</h2>
          <div className="grid grid-cols-3 gap-4">
            {["Low", "Medium", "High"].map((complexity) => {
              const group = complexityGroups.get(complexity) ?? [];
              const avgFte = group.length > 0
                ? group.reduce((sum, e) => sum + e.fte_per_month, 0) / group.length
                : 0;
              return (
                <div key={complexity} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge value={complexity} colorMap={COMPLEXITY_COLORS} />
                    <span className="text-xs text-gray-500">{group.length} entries</span>
                  </div>
                  <div className="text-lg font-bold text-indigo-600">
                    {avgFte.toFixed(2)} FTE
                  </div>
                  <div className="text-xs text-gray-500">
                    Average FTE/month
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 mb-2">Reference</p>
        <p><strong>Complexity:</strong> Low · Medium · High — reflects study complexity level</p>
        <p><strong>Activities:</strong> <strong>SU</strong> = Start Up (CCS to FPI) · <strong>C</strong> = Conduct (FPI to LPLV) · <strong>CO</strong> = Close Out (DBL to CSR)</p>
        <p><strong>FTE/Month:</strong> Base FTE allocation for the combination, prorated by active days in actual segments</p>
      </div>
    </div>
  );
}
