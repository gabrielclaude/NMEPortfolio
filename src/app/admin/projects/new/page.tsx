import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/forms/ProjectForm";
import { createProject } from "@/actions/project.actions";

export default async function NewProjectPage() {
  const trials = await prisma.clinicalTrial.findMany({
    select: { id: true, nctNumber: true, title: true },
    orderBy: { nctNumber: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/projects" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      {/* Form */}
      <ProjectForm action={createProject} mode="create" trials={trials} />
    </div>
  );
}
