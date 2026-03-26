import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TaskForm } from "@/components/admin/forms/TaskForm";
import { createTask } from "@/actions/task.actions";

export default async function NewTaskPage() {
  const [milestones, staff] = await Promise.all([
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/tasks" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Tasks
        </Link>
      </div>

      {/* Form */}
      <TaskForm action={createTask} mode="create" milestones={milestones} staff={staff} />
    </div>
  );
}
