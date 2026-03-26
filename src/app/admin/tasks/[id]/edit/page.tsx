import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/admin/forms/TaskForm";
import { updateTask } from "@/actions/task.actions";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [task, milestones, staff] = await Promise.all([
    prisma.task.findUnique({
      where: { id },
    }),
    prisma.milestone.findMany({
      select: {
        id: true,
        name: true,
        project: { select: { code: true } },
      },
      orderBy: [{ project: { code: "asc" } }, { sortOrder: "asc" }],
    }),
    prisma.staff.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { lastName: "asc" },
    }),
  ]);

  if (!task) {
    notFound();
  }

  // Create a bound action with the id
  const boundUpdateTask = updateTask.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/tasks" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Tasks
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-700 truncate max-w-xs">{task.title}</span>
      </div>

      {/* Form */}
      <TaskForm
        action={boundUpdateTask}
        mode="edit"
        milestones={milestones}
        staff={staff}
        defaultValues={{
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          milestoneId: task.milestoneId,
          assigneeId: task.assigneeId,
          estimatedHours: task.estimatedHours ? String(task.estimatedHours) : "",
          actualHours: task.actualHours ? String(task.actualHours) : "",
          dueDate: task.dueDate?.toISOString().split("T")[0] ?? "",
          completedAt: task.completedAt?.toISOString().split("T")[0] ?? "",
        }}
      />
    </div>
  );
}
