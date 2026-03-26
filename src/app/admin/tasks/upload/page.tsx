"use client";

import { BulkUploadPage } from "@/components/admin/upload/BulkUploadPage";
import { bulkCreateTasks } from "@/actions/upload.actions";
import type { FieldDefinition } from "@/components/admin/upload/ColumnMapper";
import { TaskStatusValues, TaskPriorityValues } from "@/lib/validations/task";

const taskFields: FieldDefinition[] = [
  { name: "title", label: "Title", required: true, type: "string" },
  { name: "description", label: "Description", required: false, type: "string" },
  { name: "status", label: "Status", required: true, type: "enum", enumValues: [...TaskStatusValues] },
  { name: "priority", label: "Priority", required: true, type: "enum", enumValues: [...TaskPriorityValues] },
  { name: "milestoneId", label: "Milestone ID", required: true, type: "string" },
  { name: "assigneeId", label: "Assignee ID", required: false, type: "string" },
  { name: "estimatedHours", label: "Estimated Hours", required: false, type: "number" },
  { name: "actualHours", label: "Actual Hours", required: false, type: "number" },
  { name: "dueDate", label: "Due Date", required: false, type: "date" },
  { name: "completedAt", label: "Completed At", required: false, type: "date" },
];

export default function TasksUploadPage() {
  return (
    <BulkUploadPage
      title="Bulk Upload Tasks"
      description="Upload multiple tasks from a CSV or Excel file"
      backHref="/admin/tasks"
      backLabel="Back to Tasks"
      fields={taskFields}
      onUpload={bulkCreateTasks}
    />
  );
}
