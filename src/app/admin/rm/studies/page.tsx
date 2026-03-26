export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Plus, Pencil, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getRmStudies } from "@/actions/rm-study.actions";
import { DeleteRmStudyButton } from "./DeleteRmStudyButton";

const STATUS_COLORS: Record<string, string> = {
  Active: "emerald",
  "On Hold": "amber",
  Completed: "blue",
  Cancelled: "gray",
};

const COMPLEXITY_COLORS: Record<string, string> = {
  Low: "green",
  Medium: "amber",
  High: "red",
};

export default async function AdminRmStudiesPage() {
  const studies = await getRmStudies();

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage RM Studies</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create, edit, and delete resource management studies
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/rm/studies/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Study
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Study ID</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Phase</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Complexity</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">NME</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Segments</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Assignments</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {studies.map((study) => {
              const totalRelations = Number(study.segment_count) + Number(study.assignment_count);
              return (
                <tr key={study.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-rose-600">{study.id}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {study.phase}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge value={study.status} colorMap={STATUS_COLORS} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge value={study.complexity} colorMap={COMPLEXITY_COLORS} />
                  </td>
                  <td className="px-4 py-3">
                    {study.nme_code ? (
                      <Link
                        href={`/nmes/${study.nme_id}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        {study.nme_code}
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {Number(study.segment_count)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {Number(study.assignment_count)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/rm/studies/${study.id}/edit`}>
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Link>
                      </Button>
                      <DeleteRmStudyButton
                        id={study.id}
                        relationCount={totalRelations}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {studies.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No RM studies found. Add your first study to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
