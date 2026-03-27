import { RmFteMatrixForm } from "@/components/admin/forms/RmFteMatrixForm";
import { createRmFteMatrix } from "@/actions/rm-fte-matrix.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewRmFteMatrixPage() {
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
        action={createRmFteMatrix}
        mode="create"
      />
    </div>
  );
}
