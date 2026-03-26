import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NMEForm } from "@/components/admin/forms/NMEForm";
import { createNME } from "@/actions/nme.actions";

export default function NewNMEPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/nmes" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to NMEs
        </Link>
      </div>

      {/* Form */}
      <NMEForm action={createNME} mode="create" />
    </div>
  );
}
