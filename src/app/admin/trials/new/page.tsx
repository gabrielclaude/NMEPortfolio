import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TrialForm } from "@/components/admin/forms/TrialForm";
import { createTrial } from "@/actions/trial.actions";

export default async function NewTrialPage() {
  const [nmes, staff] = await Promise.all([
    prisma.nME.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { code: "asc" },
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
        <Link href="/admin/trials" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Trials
        </Link>
      </div>

      {/* Form */}
      <TrialForm action={createTrial} mode="create" nmes={nmes} staff={staff} />
    </div>
  );
}
