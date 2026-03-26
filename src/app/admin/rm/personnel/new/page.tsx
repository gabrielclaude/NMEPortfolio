import { RmPersonnelForm } from "@/components/admin/forms/RmPersonnelForm";
import { createRmPersonnel } from "@/actions/rm-personnel.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewRmPersonnelPage() {
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
        action={createRmPersonnel}
        mode="create"
      />
    </div>
  );
}
