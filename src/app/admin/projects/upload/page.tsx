"use client";

import { BulkUploadPage } from "@/components/admin/upload/BulkUploadPage";
import { bulkCreateProjects } from "@/actions/upload.actions";
import type { FieldDefinition } from "@/components/admin/upload/ColumnMapper";
import { ProjectStatusValues, TaskPriorityValues } from "@/lib/validations/project";

const projectFields: FieldDefinition[] = [
  { name: "code", label: "Code", required: true, type: "string" },
  { name: "name", label: "Name", required: true, type: "string" },
  { name: "description", label: "Description", required: false, type: "string" },
  { name: "status", label: "Status", required: true, type: "enum", enumValues: [...ProjectStatusValues] },
  { name: "priority", label: "Priority", required: true, type: "enum", enumValues: [...TaskPriorityValues] },
  { name: "trialId", label: "Trial ID", required: true, type: "string" },
  { name: "plannedStart", label: "Planned Start", required: true, type: "date" },
  { name: "plannedEnd", label: "Planned End", required: true, type: "date" },
  { name: "actualStart", label: "Actual Start", required: false, type: "date" },
  { name: "actualEnd", label: "Actual End", required: false, type: "date" },
  { name: "budget", label: "Budget", required: false, type: "number" },
  { name: "percentComplete", label: "Percent Complete", required: false, type: "number" },
];

export default function ProjectsUploadPage() {
  return (
    <BulkUploadPage
      title="Bulk Upload Projects"
      description="Upload multiple projects from a CSV or Excel file"
      backHref="/admin/projects"
      backLabel="Back to Projects"
      fields={projectFields}
      onUpload={bulkCreateProjects}
    />
  );
}
