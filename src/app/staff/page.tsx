export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STAFF_ROLE_COLORS, formatEnumLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function StaffPage() {
  const staff = await prisma.staff.findMany({
    include: {
      _count: {
        select: {
          trialAssignments: true,
          assignedTasks: true,
          milestoneAssignments: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { lastName: "asc" }],
  });

  const openTaskCounts = await prisma.task.groupBy({
    by: ["assigneeId"],
    where: {
      status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"] },
      assigneeId: { not: null },
    },
    _count: { id: true },
  });
  const openTaskMap = new Map(openTaskCounts.map((t) => [t.assigneeId, t._count.id]));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
        <p className="text-sm text-gray-500 mt-1">{staff.length} team members</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Employee ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Department</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Specialization</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Exp.</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trials</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Open Tasks</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Hire Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((s) => {
                const openTasks = openTaskMap.get(s.id) ?? 0;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-500">{s.employeeId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/staff/${s.id}`} className="font-medium text-blue-600 hover:underline">
                        {s.firstName} {s.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={s.role} colorMap={STAFF_ROLE_COLORS} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.department}</td>
                    <td className="px-4 py-3 text-gray-500">{s.specialization ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.yearsExperience}y</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                        {s._count.trialAssignments}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        openTasks > 5 ? "bg-red-50 text-red-700" : openTasks > 2 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {openTasks}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(s.hireDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
