import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StaffForm } from "@/components/admin/forms/StaffForm";
import { updateStaff } from "@/actions/staff.actions";

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const staff = await prisma.staff.findUnique({
    where: { id },
  });

  if (!staff) {
    notFound();
  }

  // Create a bound action with the id
  const boundUpdateStaff = updateStaff.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/staff" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Staff
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-700">{staff.firstName} {staff.lastName}</span>
      </div>

      {/* Form */}
      <StaffForm
        action={boundUpdateStaff}
        mode="edit"
        defaultValues={{
          employeeId: staff.employeeId,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          role: staff.role,
          department: staff.department,
          specialization: staff.specialization,
          yearsExperience: String(staff.yearsExperience),
          isActive: staff.isActive,
          hireDate: staff.hireDate.toISOString().split("T")[0],
        }}
      />
    </div>
  );
}
