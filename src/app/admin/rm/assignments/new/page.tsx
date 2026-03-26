import { RmStaffAssignmentForm } from "@/components/admin/forms/RmStaffAssignmentForm";
import {
  createRmStaffAssignment,
  getRmStudiesForSelect,
  getRmPersonnelForSelect,
} from "@/actions/rm-staff-assignment.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewRmStaffAssignmentPage() {
  const [studies, personnel] = await Promise.all([
    getRmStudiesForSelect(),
    getRmPersonnelForSelect(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/rm/assignments"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Link>
      </div>

      <RmStaffAssignmentForm
        action={createRmStaffAssignment}
        mode="create"
        studies={studies}
        personnel={personnel}
      />
    </div>
  );
}
