export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PROJECT_STATUS_COLORS, TASK_PRIORITY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ProjectStatusLabels, TaskPriorityLabels } from "@/lib/validations/project";
import { DeleteProjectButton } from "./DeleteProjectButton";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { code: "asc" },
    include: {
      trial: { select: { nctNumber: true } },
      _count: {
        select: { milestones: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create, edit, and delete projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/projects/upload">
              <Upload className="h-4 w-4 mr-1" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Trial</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Priority</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Progress</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Planned End</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold text-indigo-600">{project.code}</span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{project.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  <span className="font-mono text-xs">{project.trial.nctNumber}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    value={project.status}
                    colorMap={PROJECT_STATUS_COLORS}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    value={project.priority}
                    colorMap={TASK_PRIORITY_COLORS}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${project.percentComplete}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{project.percentComplete}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(project.plannedEnd)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/admin/projects/${project.id}/edit`}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Link>
                    </Button>
                    <DeleteProjectButton
                      id={project.id}
                      name={project.name}
                      milestoneCount={project._count.milestones}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No projects found. Create your first project to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
