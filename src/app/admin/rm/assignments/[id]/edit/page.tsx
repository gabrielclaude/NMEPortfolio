import { notFound } from "next/navigation";
import { RmStaffAssignmentForm } from "@/components/admin/forms/RmStaffAssignmentForm";
import {
  updateRmStaffAssignment,
  getRmStaffAssignmentById,
  getRmStudiesForSelect,
  getRmPersonnelForSelect,
} from "@/actions/rm-staff-assignment.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRmStaffAssignmentPage({ params }: PageProps) {
  const { id } = await params;
  const assignmentId = parseInt(id, 10);

  if (isNaN(assignmentId)) {
    notFound();
  }

  const [assignment, studies, personnel] = await Promise.all([
    getRmStaffAssignmentById(assignmentId),
    getRmStudiesForSelect(),
    getRmPersonnelForSelect(),
  ]);

  if (!assignment) {
    notFound();
  }

  const boundAction = updateRmStaffAssignment.bind(null, assignmentId);

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
        defaultValues={{
          id: assignment.id,
          studyId: assignment.study_id,
          personnelId: String(assignment.personnel_id),
          role: assignment.role as "Clinical Scientist" | "Medical Monitor" | "Support Medical Monitor" | "Development Team Lead" | "Clinical RA",
          allocationPct: String(assignment.allocation_pct),
        }}
        action={boundAction}
        mode="edit"
        studies={studies}
        personnel={personnel}
      />
    </div>
  );
}
