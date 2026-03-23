export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  STAFF_ROLE_COLORS, TRIAL_PHASE_COLORS, TRIAL_STATUS_COLORS,
  TASK_STATUS_COLORS, TASK_PRIORITY_COLORS, formatEnumLabel,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, Mail } from "lucide-react";

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: {
      trialAssignments: {
        include: {
          trial: {
            include: { nme: { select: { name: true } } },
          },
        },
      },
      assignedTasks: {
        include: {
          milestone: {
            include: {
              project: {
                include: { trial: { include: { nme: { select: { name: true } } } } },
              },
            },
          },
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }],
        take: 20,
      },
    },
  });

  if (!staff) notFound();

  const openTasks = staff.assignedTasks.filter((t) => !["DONE", "CANCELLED"].includes(t.status));
  const completedTasks = staff.assignedTasks.filter((t) => t.status === "DONE");

  return (
    <div className="p-6 space-y-6">
      <Link href="/staff" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft className="h-4 w-4" />
        Staff Directory
      </Link>

      {/* Profile Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-white text-lg font-bold flex-shrink-0">
          {staff.firstName[0]}{staff.lastName[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{staff.firstName} {staff.lastName}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge value={staff.role} colorMap={STAFF_ROLE_COLORS} />
            <span className="text-sm text-gray-500">{staff.department}</span>
            <span className="text-sm text-gray-400">{staff.employeeId}</span>
          </div>
          <a href={`mailto:${staff.email}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1">
            <Mail className="h-3.5 w-3.5" />
            {staff.email}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{staff.yearsExperience}</p>
          <p className="text-xs text-gray-500 mt-1">Years Experience</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{staff.trialAssignments.length}</p>
          <p className="text-xs text-gray-500 mt-1">Trials Assigned</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{openTasks.length}</p>
          <p className="text-xs text-gray-500 mt-1">Open Tasks</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{completedTasks.length}</p>
          <p className="text-xs text-gray-500 mt-1">Completed Tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Trial Assignments */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-700">Trial Assignments</h2>
          </div>
          {staff.trialAssignments.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No trial assignments.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">NCT Number</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">NME</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Phase</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Effort</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.trialAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/trials/${a.trial.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                        {a.trial.nctNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.trial.nme.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={a.trial.phase} colorMap={TRIAL_PHASE_COLORS} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{Math.round(a.effort * 100)}% FTE</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Task List */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-700">Recent Tasks (Top 20)</h2>
          </div>
          {staff.assignedTasks.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No tasks assigned.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {staff.assignedTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between px-4 py-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {task.milestone.project.trial.nme.name} · {task.milestone.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <StatusBadge value={task.priority} colorMap={TASK_PRIORITY_COLORS} />
                    <StatusBadge value={task.status} colorMap={TASK_STATUS_COLORS} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
