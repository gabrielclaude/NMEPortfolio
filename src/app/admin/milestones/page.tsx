export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Upload, Pencil, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MILESTONE_STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { MilestoneStatusLabels } from "@/lib/validations/milestone";
import { DeleteMilestoneButton } from "./DeleteMilestoneButton";

export default async function AdminMilestonesPage() {
  const milestones = await prisma.milestone.findMany({
    orderBy: [{ project: { code: "asc" } }, { sortOrder: "asc" }],
    include: {
      project: { select: { code: true, name: true } },
      _count: {
        select: { tasks: true, assignments: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Milestones</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create, edit, and delete milestones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/milestones/upload">
              <Upload className="h-4 w-4 mr-1" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/milestones/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Milestone
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Project</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Due Date</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Critical</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Tasks</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {milestones.map((milestone) => {
              const totalRelations = milestone._count.tasks + milestone._count.assignments;
              return (
                <tr key={milestone.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-indigo-600">{milestone.project.code}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{milestone.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      value={milestone.status}
                      colorMap={MILESTONE_STATUS_COLORS}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(milestone.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {milestone.isCriticalPath && (
                      <Flag className="h-4 w-4 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {milestone._count.tasks}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/milestones/${milestone.id}/edit`}>
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Link>
                      </Button>
                      <DeleteMilestoneButton
                        id={milestone.id}
                        name={milestone.name}
                        relationCount={totalRelations}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {milestones.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No milestones found. Create your first milestone to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
