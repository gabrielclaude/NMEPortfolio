export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  PROJECT_STATUS_COLORS, MILESTONE_STATUS_COLORS,
  TASK_STATUS_COLORS, TASK_PRIORITY_COLORS,
} from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { EVMGauge, EVMStatusDot } from "@/components/evm/EVMGauge";
import { computeEVMDerived } from "@/types/evm";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      trial: {
        include: { nme: { select: { id: true, name: true, code: true } } },
      },
      milestones: {
        include: {
          tasks: {
            include: { assignee: { select: { firstName: true, lastName: true } } },
            orderBy: { priority: "desc" },
          },
        },
        orderBy: [{ isCriticalPath: "desc" }, { sortOrder: "asc" }],
      },
    },
  });

  if (!project) notFound();

  const now = new Date();

  // Compute EVM metrics from project data + task hours
  const bac = project.budget ? Number(project.budget) : 0;
  const allTasks = project.milestones.flatMap((m) => m.tasks);
  const totalEstHours = allTasks.reduce((s, t) => s + (t.estimatedHours ?? 0), 0);
  const totalActHours = allTasks.reduce((s, t) => s + (t.actualHours ?? 0), 0);

  // PV = BAC × elapsed fraction
  const plannedStart = project.plannedStart.getTime();
  const plannedEnd = project.plannedEnd.getTime();
  const elapsed = Math.max(0, Math.min(1, (Date.now() - plannedStart) / (plannedEnd - plannedStart || 1)));
  const pv = bac * elapsed;

  // EV = BAC × (percentComplete / 100)
  const ev = bac * (project.percentComplete / 100);

  // AC = BAC × (actualHours / estimatedHours), fallback to EV
  const ac = totalEstHours > 0 ? bac * (totalActHours / totalEstHours) : ev;

  const evm = computeEVMDerived({ bac, pv, ev, ac });

  const completedTasks = allTasks.filter((t) => t.status === "DONE").length;
  const taskCompletionPct = allTasks.length > 0
    ? Math.round((completedTasks / allTasks.length) * 1000) / 10
    : 0;

  return (
    <div className="p-6 space-y-6">
      <Link href="/projects" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft className="h-4 w-4" />
        Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-gray-500">{project.code}</span>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            <StatusBadge value={project.status} colorMap={PROJECT_STATUS_COLORS} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Trial:{" "}
            <Link href={`/trials/${project.trial.id}`} className="text-blue-600 hover:underline">
              {project.trial.nctNumber}
            </Link>
            {" · "}NME:{" "}
            <Link href={`/nmes/${project.trial.nme.id}`} className="text-blue-600 hover:underline">
              {project.trial.nme.name}
            </Link>
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{project.percentComplete}%</p>
          <p className="text-xs text-gray-500 mt-1">Complete</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${project.percentComplete}%` }} />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{project.milestones.length}</p>
          <p className="text-xs text-gray-500 mt-1">Milestones</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{allTasks.length}</p>
          <p className="text-xs text-gray-500 mt-1">Tasks</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-900">{formatCurrency(bac || null)}</p>
          <p className="text-xs text-gray-500 mt-1">Budget</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(project.plannedStart)} – {formatDate(project.plannedEnd)}</p>
        </div>
      </div>

      {/* EVM Panel */}
      {bac > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-700">Earned Value Management</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Budget at Completion: {formatCurrency(bac)} · Task Completion: {taskCompletionPct}%
            </p>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide">BAC</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(bac)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide">PV</p>
              <p className="text-lg font-bold text-gray-700 mt-1">{formatCurrency(pv)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide">EV</p>
              <p className="text-lg font-bold text-gray-700 mt-1">{formatCurrency(ev)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide">AC</p>
              <p className="text-lg font-bold text-gray-700 mt-1">{formatCurrency(ac)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide">SV</p>
              <p className={`text-lg font-bold mt-1 ${evm.sv >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(evm.sv)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wide">CV</p>
              <p className={`text-lg font-bold mt-1 ${evm.cv >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(evm.cv)}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-100 px-5 py-4 flex flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">SPI</p>
              <div className="flex items-center gap-1">
                <EVMStatusDot value={evm.spi} />
                <EVMGauge value={evm.spi} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">CPI</p>
              <div className="flex items-center gap-1">
                <EVMStatusDot value={evm.cpi} />
                <EVMGauge value={evm.cpi} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">TCPI</p>
              <EVMGauge value={evm.tcpi} />
            </div>
            <div className="border-l border-gray-200 pl-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">EAC</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{formatCurrency(evm.eac)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">ETC</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{formatCurrency(evm.etc)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">VAC</p>
              <p className={`text-sm font-semibold mt-0.5 ${evm.vac >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(evm.vac)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Milestones + Tasks */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Milestones & Tasks</h2>
        {project.milestones.map((milestone) => {
          const isOverdue = milestone.status !== "COMPLETED" && milestone.dueDate < now;
          return (
            <div key={milestone.id} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Milestone header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  {milestone.isCriticalPath && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">CRITICAL</span>
                  )}
                  <span className="font-medium text-gray-800">{milestone.name}</span>
                  <StatusBadge value={milestone.status} colorMap={MILESTONE_STATUS_COLORS} />
                  {isOverdue && (
                    <span className="flex items-center gap-1 text-xs text-red-600">
                      <AlertTriangle className="h-3 w-3" /> Overdue
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">Due: {formatDate(milestone.dueDate)}</span>
              </div>

              {/* Tasks */}
              {milestone.tasks.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-2 text-left text-xs font-medium text-gray-400">Task</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Priority</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Assignee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Due</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Est. Hrs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {milestone.tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-5 py-2.5 text-gray-800">{task.title}</td>
                        <td className="px-4 py-2.5">
                          <StatusBadge value={task.status} colorMap={TASK_STATUS_COLORS} />
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge value={task.priority} colorMap={TASK_PRIORITY_COLORS} />
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">
                          {task.assignee ? (
                            <Link href={`/staff/${task.assigneeId}`} className="hover:text-blue-600 hover:underline">
                              {task.assignee.firstName} {task.assignee.lastName}
                            </Link>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{formatDate(task.dueDate)}</td>
                        <td className="px-4 py-2.5 text-gray-500">{task.estimatedHours ? `${task.estimatedHours}h` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-5 py-3 text-xs text-gray-400">No tasks</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
