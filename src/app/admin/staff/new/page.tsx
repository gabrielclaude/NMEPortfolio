import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StaffForm } from "@/components/admin/forms/StaffForm";
import { createStaff } from "@/actions/staff.actions";

export default function NewStaffPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/staff" className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          Back to Staff
        </Link>
      </div>

      {/* Form */}
      <StaffForm action={createStaff} mode="create" />
    </div>
  );
}
