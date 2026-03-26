export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRmPersonnel } from "@/actions/rm-personnel.actions";
import { DeleteRmPersonnelButton } from "./DeleteRmPersonnelButton";

export default async function AdminRmPersonnelPage() {
  const personnel = await getRmPersonnel();

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage RM Personnel</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create, edit, and delete resource management personnel
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/rm/personnel/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Personnel
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Total Allocation (FTE)</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Adjustment</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Effective Capacity</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Assignments</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Utilization</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {personnel.map((person) => {
              const effectiveCapacity = person.total_allocation + person.adjustment;
              const utilPct = effectiveCapacity > 0 ? (person.utilization / effectiveCapacity) * 100 : 0;
              const utilColor = utilPct > 100 ? "text-red-600" : utilPct >= 80 ? "text-amber-600" : "text-emerald-600";
              const barColor = utilPct > 100 ? "bg-red-400" : utilPct >= 80 ? "bg-amber-400" : "bg-emerald-400";

              return (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{person.name}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {person.total_allocation.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {person.adjustment !== 0 ? (
                      <span className={person.adjustment > 0 ? "text-emerald-600" : "text-red-600"}>
                        {person.adjustment > 0 ? "+" : ""}{person.adjustment.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-indigo-600">
                    {effectiveCapacity.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {Number(person.assignment_count)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full ${barColor}`}
                          style={{ width: `${Math.min(utilPct, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${utilColor}`}>
                        {Math.round(utilPct)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/rm/personnel/${person.id}/edit`}>
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Link>
                      </Button>
                      <DeleteRmPersonnelButton
                        id={person.id}
                        name={person.name}
                        assignmentCount={Number(person.assignment_count)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {personnel.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No personnel found. Add your first team member to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
