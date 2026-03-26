"use client";

import { BulkUploadPage } from "@/components/admin/upload/BulkUploadPage";
import { bulkCreateMilestones } from "@/actions/upload.actions";
import type { FieldDefinition } from "@/components/admin/upload/ColumnMapper";
import { MilestoneStatusValues } from "@/lib/validations/milestone";

const milestoneFields: FieldDefinition[] = [
  { name: "name", label: "Name", required: true, type: "string" },
  { name: "description", label: "Description", required: false, type: "string" },
  { name: "status", label: "Status", required: true, type: "enum", enumValues: [...MilestoneStatusValues] },
  { name: "projectId", label: "Project ID", required: true, type: "string" },
  { name: "dueDate", label: "Due Date", required: true, type: "date" },
  { name: "completedDate", label: "Completed Date", required: false, type: "date" },
  { name: "isCriticalPath", label: "Is Critical Path", required: false, type: "boolean" },
  { name: "sortOrder", label: "Sort Order", required: false, type: "number" },
];

export default function MilestonesUploadPage() {
  return (
    <BulkUploadPage
      title="Bulk Upload Milestones"
      description="Upload multiple milestones from a CSV or Excel file"
      backHref="/admin/milestones"
      backLabel="Back to Milestones"
      fields={milestoneFields}
      onUpload={bulkCreateMilestones}
    />
  );
}
