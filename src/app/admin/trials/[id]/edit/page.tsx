import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TrialForm } from "@/components/admin/forms/TrialForm";
import { updateTrial } from "@/actions/trial.actions";

export default async function EditTrialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [trial, nmes, staff] = await Promise.all([
    prisma.clinicalTrial.findUnique({
      where: { id },
    }),
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

  if (!trial) {
    notFound();
  }

  // Create a bound action with the id
  const boundUpdateTrial = updateTrial.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/trials" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Trials
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-700">{trial.nctNumber}</span>
      </div>

      {/* Form */}
      <TrialForm
        action={boundUpdateTrial}
        mode="edit"
        nmes={nmes}
        staff={staff}
        defaultValues={{
          nctNumber: trial.nctNumber,
          title: trial.title,
          phase: trial.phase,
          status: trial.status,
          nmeId: trial.nmeId,
          leadStaffId: trial.leadStaffId,
          sponsorProtocolId: trial.sponsorProtocolId,
          primaryEndpoint: trial.primaryEndpoint,
          studyDesign: trial.studyDesign,
          targetEnrollment: String(trial.targetEnrollment),
          actualEnrollment: String(trial.actualEnrollment),
          plannedStartDate: trial.plannedStartDate?.toISOString().split("T")[0] ?? "",
          plannedEndDate: trial.plannedEndDate?.toISOString().split("T")[0] ?? "",
          actualStartDate: trial.actualStartDate?.toISOString().split("T")[0] ?? "",
          actualEndDate: trial.actualEndDate?.toISOString().split("T")[0] ?? "",
          sites: String(trial.sites),
          budget: trial.budget ? String(trial.budget) : "",
          notes: trial.notes,
        }}
      />
    </div>
  );
}
