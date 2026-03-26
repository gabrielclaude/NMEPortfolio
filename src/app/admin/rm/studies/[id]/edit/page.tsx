import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RmStudyForm } from "@/components/admin/forms/RmStudyForm";
import { updateRmStudy, getRmStudyById } from "@/actions/rm-study.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRmStudyPage({ params }: PageProps) {
  const { id } = await params;
  const study = await getRmStudyById(id);

  if (!study) {
    notFound();
  }

  const nmes = await prisma.nME.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

  const boundAction = updateRmStudy.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/rm/studies"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Studies
        </Link>
      </div>

      <RmStudyForm
        defaultValues={{
          id: study.id,
          phase: String(study.phase),
          status: study.status as "Active" | "On Hold" | "Completed" | "Cancelled",
          complexity: study.complexity as "Low" | "Medium" | "High",
          nmeId: study.nme_id,
        }}
        action={boundAction}
        mode="edit"
        nmes={nmes}
      />
    </div>
  );
}
