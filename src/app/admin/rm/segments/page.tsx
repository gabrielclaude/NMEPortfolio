export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getRmStudySegments } from "@/actions/rm-study-segment.actions";
import { DeleteRmStudySegmentButton } from "./DeleteRmStudySegmentButton";
import { formatDate } from "@/lib/utils";

const ACTIVITY_COLORS: Record<string, string> = {
  "Start Up": "indigo",
  "Conduct": "emerald",
  "Close Out": "amber",
};

const COMPLEXITY_COLORS: Record<string, string> = {
  Low: "green",
  Medium: "amber",
  High: "red",
};

export default async function AdminRmSegmentsPage() {
  const segments = await getRmStudySegments();

  // Group by study for summary
  const studyGroups = new Map<string, typeof segments>();
  for (const seg of segments) {
    const group = studyGroups.get(seg.study_id) ?? [];
    group.push(seg);
    studyGroups.set(seg.study_id, group);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Study Segments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Define FTE segments for each study phase and activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/rm/segments/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Segment
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
              <th className="px-4 py-3 text-center font-medium text-gray-500">Activity</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Complexity</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Start</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">End</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Days</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">FTE/Month</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {segments.map((segment) => (
              <tr key={segment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/rm/studies/${segment.study_id}/edit`}
                    className="font-mono font-semibold text-rose-600 hover:text-rose-800"
                  >
                    {segment.study_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge value={segment.activity} colorMap={ACTIVITY_COLORS} />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {segment.role}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge value={segment.complexity} colorMap={COMPLEXITY_COLORS} />
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {formatDate(segment.start_date)}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {formatDate(segment.end_date)}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {segment.days}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {segment.fte_per_month.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/admin/rm/segments/${segment.id}/edit`}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Link>
                    </Button>
                    <DeleteRmStudySegmentButton
                      id={segment.id}
                      studyId={segment.study_id}
                      activity={segment.activity}
                      role={segment.role}
                      monthlyFteCount={Number(segment.monthly_fte_count)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {segments.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No study segments found. Add your first segment to get started.</p>
          </div>
        )}
      </div>

      {/* Summary by Study */}
      {studyGroups.size > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Summary by Study</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from(studyGroups.entries()).map(([studyId, studySegments]) => {
              const totalFte = studySegments.reduce((sum, s) => sum + s.fte_per_month, 0);
              const activities = new Set(studySegments.map((s) => s.activity));
              return (
                <div key={studyId} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-semibold text-rose-600">{studyId}</span>
                    <span className="text-xs text-gray-500">{studySegments.length} segments</span>
                  </div>
                  <div className="text-lg font-bold text-indigo-600">
                    {totalFte.toFixed(2)} FTE
                  </div>
                  <div className="flex gap-1 mt-2">
                    {Array.from(activities).map((act) => (
                      <span
                        key={act}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          act === "Start Up"
                            ? "bg-indigo-100 text-indigo-700"
                            : act === "Conduct"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {act === "Start Up" ? "SU" : act === "Conduct" ? "C" : "CO"}
                      </span>
                    ))}
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
