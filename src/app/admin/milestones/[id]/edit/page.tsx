import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MilestoneForm } from "@/components/admin/forms/MilestoneForm";
import { updateMilestone } from "@/actions/milestone.actions";

export default async function EditMilestonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [milestone, projects] = await Promise.all([
    prisma.milestone.findUnique({
      where: { id },
    }),
    prisma.project.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { code: "asc" },
    }),
  ]);

  if (!milestone) {
    notFound();
  }

  // Create a bound action with the id
  const boundUpdateMilestone = updateMilestone.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/milestones" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Milestones
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-700">{milestone.name}</span>
      </div>

      {/* Form */}
      <MilestoneForm
        action={boundUpdateMilestone}
        mode="edit"
        projects={projects}
        defaultValues={{
          name: milestone.name,
          description: milestone.description,
          status: milestone.status,
          projectId: milestone.projectId,
          dueDate: milestone.dueDate.toISOString().split("T")[0],
          completedDate: milestone.completedDate?.toISOString().split("T")[0] ?? "",
          isCriticalPath: milestone.isCriticalPath,
          sortOrder: String(milestone.sortOrder),
        }}
      />
    </div>
  );
}
