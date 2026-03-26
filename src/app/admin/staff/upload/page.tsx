"use client";

import { BulkUploadPage } from "@/components/admin/upload/BulkUploadPage";
import { bulkCreateStaff } from "@/actions/upload.actions";
import type { FieldDefinition } from "@/components/admin/upload/ColumnMapper";
import { StaffRoleValues } from "@/lib/validations/staff";

const staffFields: FieldDefinition[] = [
  { name: "employeeId", label: "Employee ID", required: true, type: "string" },
  { name: "firstName", label: "First Name", required: true, type: "string" },
  { name: "lastName", label: "Last Name", required: true, type: "string" },
  { name: "email", label: "Email", required: true, type: "string" },
  { name: "role", label: "Role", required: true, type: "enum", enumValues: [...StaffRoleValues] },
  { name: "department", label: "Department", required: true, type: "string" },
  { name: "specialization", label: "Specialization", required: false, type: "string" },
  { name: "yearsExperience", label: "Years Experience", required: true, type: "number" },
  { name: "isActive", label: "Is Active", required: false, type: "boolean" },
  { name: "hireDate", label: "Hire Date", required: true, type: "date" },
];

export default function StaffUploadPage() {
  return (
    <BulkUploadPage
      title="Bulk Upload Staff"
      description="Upload multiple staff members from a CSV or Excel file"
      backHref="/admin/staff"
      backLabel="Back to Staff"
      fields={staffFields}
      onUpload={bulkCreateStaff}
    />
  );
}
