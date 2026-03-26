import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MilestoneForm } from "@/components/admin/forms/MilestoneForm";
import { createMilestone } from "@/actions/milestone.actions";

export default async function NewMilestonePage() {
  const projects = await prisma.project.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/milestones" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Milestones
        </Link>
      </div>

      {/* Form */}
      <MilestoneForm action={createMilestone} mode="create" projects={projects} />
    </div>
  );
}
