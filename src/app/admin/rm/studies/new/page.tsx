import { prisma } from "@/lib/prisma";
import { RmStudyForm } from "@/components/admin/forms/RmStudyForm";
import { createRmStudy } from "@/actions/rm-study.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewRmStudyPage() {
  const nmes = await prisma.nME.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });

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
        action={createRmStudy}
        mode="create"
        nmes={nmes}
      />
    </div>
  );
}
