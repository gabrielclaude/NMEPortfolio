import { notFound } from "next/navigation";
import { RmFteMatrixForm } from "@/components/admin/forms/RmFteMatrixForm";
import { updateRmFteMatrix, getRmFteMatrixById } from "@/actions/rm-fte-matrix.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRmFteMatrixPage({ params }: PageProps) {
  const { id } = await params;
  const entryId = parseInt(id, 10);

  if (isNaN(entryId)) {
    notFound();
  }

  const entry = await getRmFteMatrixById(entryId);

  if (!entry) {
    notFound();
  }

  const boundAction = updateRmFteMatrix.bind(null, entryId);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/rm/fte-matrix"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to FTE Matrix
        </Link>
      </div>

      <RmFteMatrixForm
        defaultValues={{
          id: entry.id,
          complexity: entry.complexity as "Low" | "Medium" | "High",
          role: entry.role as "Clinical Scientist" | "Medical Monitor" | "Clinical RA",
          phase: String(entry.phase),
          activity: entry.activity as "Start Up" | "Conduct" | "Close Out",
          ftePerMonth: String(entry.fte_per_month),
        }}
        action={boundAction}
        mode="edit"
      />
    </div>
  );
}
