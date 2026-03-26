import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { NMEForm } from "@/components/admin/forms/NMEForm";
import { updateNME } from "@/actions/nme.actions";

export default async function EditNMEPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const nme = await prisma.nME.findUnique({
    where: { id },
  });

  if (!nme) {
    notFound();
  }

  // Create a bound action with the id
  const boundUpdateNME = updateNME.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/nmes" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to NMEs
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-700">{nme.code}</span>
      </div>

      {/* Form */}
      <NMEForm
        action={boundUpdateNME}
        mode="edit"
        defaultValues={{
          code: nme.code,
          name: nme.name,
          genericName: nme.genericName,
          therapeuticArea: nme.therapeuticArea,
          moleculeType: nme.moleculeType,
          status: nme.status,
          targetIndication: nme.targetIndication,
          mechanismOfAction: nme.mechanismOfAction,
          originatorCompany: nme.originatorCompany,
          patentExpiry: nme.patentExpiry?.toISOString().split("T")[0],
          indFilingDate: nme.indFilingDate?.toISOString().split("T")[0],
          discoveryDate: nme.discoveryDate.toISOString().split("T")[0],
          notes: nme.notes,
        }}
      />
    </div>
  );
}
