import { notFound } from "next/navigation";
import { RmPersonnelForm } from "@/components/admin/forms/RmPersonnelForm";
import { updateRmPersonnel, getRmPersonnelById } from "@/actions/rm-personnel.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRmPersonnelPage({ params }: PageProps) {
  const { id } = await params;
  const personnelId = parseInt(id, 10);

  if (isNaN(personnelId)) {
    notFound();
  }

  const personnel = await getRmPersonnelById(personnelId);

  if (!personnel) {
    notFound();
  }

  const boundAction = updateRmPersonnel.bind(null, personnelId);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/rm/personnel"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Personnel
        </Link>
      </div>

      <RmPersonnelForm
        defaultValues={{
          id: personnel.id,
          name: personnel.name,
          totalAllocation: String(personnel.total_allocation),
          adjustment: String(personnel.adjustment),
        }}
        action={boundAction}
        mode="edit"
      />
    </div>
  );
}
