export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { TaskStatusLabels, TaskPriorityLabels } from "@/lib/validations/task";
import { DeleteTaskButton } from "./DeleteTaskButton";

export default async function AdminTasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      milestone: {
        select: {
          name: true,
          project: { select: { code: true } },
        },
      },
      assignee: { select: { firstName: true, lastName: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create, edit, and delete tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/tasks/upload">
              <Upload className="h-4 w-4 mr-1" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/tasks/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Milestone</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Assignee</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Due Date</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                  {task.title}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs text-indigo-600">
                      {task.milestone.project.code}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-32">
                      {task.milestone.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    value={task.status}
                    colorMap={TASK_STATUS_COLORS}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    value={task.priority}
                    colorMap={TASK_PRIORITY_COLORS}
                  />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {task.assignee
                    ? `${task.assignee.firstName} ${task.assignee.lastName}`
                    : "-"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {task.dueDate ? formatDate(task.dueDate) : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/admin/tasks/${task.id}/edit`}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Link>
                    </Button>
                    <DeleteTaskButton id={task.id} title={task.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No tasks found. Create your first task to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
