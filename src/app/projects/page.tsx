export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PROJECT_STATUS_COLORS, TASK_PRIORITY_COLORS, formatEnumLabel } from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      trial: {
        include: { nme: { select: { name: true, code: true } } },
      },
      _count: { select: { milestones: true } },
    },
    orderBy: [{ status: "asc" }, { plannedEnd: "asc" }],
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="text-sm text-gray-500 mt-1">{projects.length} projects across all trials</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Project Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trial / NME</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Progress</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Milestones</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Budget</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Planned End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/projects/${project.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      {project.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{project.name}</td>
                  <td className="px-4 py-3">
                    <Link href={`/trials/${project.trial.id}`} className="text-xs text-blue-600 hover:underline block">
                      {project.trial.nctNumber ?? project.trial.id.slice(0, 8)}
                    </Link>
                    <span className="text-xs text-gray-500">{project.trial.nme.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={project.status} colorMap={PROJECT_STATUS_COLORS} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={project.priority} colorMap={TASK_PRIORITY_COLORS} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${project.percentComplete}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{project.percentComplete}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{project._count.milestones}</td>
                  <td className="px-4 py-3 text-gray-500">{formatCurrency(project.budget ? Number(project.budget) : null)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(project.plannedEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
