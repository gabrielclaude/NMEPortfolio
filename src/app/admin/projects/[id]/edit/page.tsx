import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/forms/ProjectForm";
import { updateProject } from "@/actions/project.actions";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, trials] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
    }),
    prisma.clinicalTrial.findMany({
      select: { id: true, nctNumber: true, title: true },
      orderBy: { nctNumber: "asc" },
    }),
  ]);

  if (!project) {
    notFound();
  }

  // Create a bound action with the id
  const boundUpdateProject = updateProject.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/projects" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-700">{project.code}</span>
      </div>

      {/* Form */}
      <ProjectForm
        action={boundUpdateProject}
        mode="edit"
        trials={trials}
        defaultValues={{
          code: project.code,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          trialId: project.trialId,
          plannedStart: project.plannedStart.toISOString().split("T")[0],
          plannedEnd: project.plannedEnd.toISOString().split("T")[0],
          actualStart: project.actualStart?.toISOString().split("T")[0] ?? "",
          actualEnd: project.actualEnd?.toISOString().split("T")[0] ?? "",
          budget: project.budget ? String(project.budget) : "",
          percentComplete: String(project.percentComplete),
        }}
      />
    </div>
  );
}
