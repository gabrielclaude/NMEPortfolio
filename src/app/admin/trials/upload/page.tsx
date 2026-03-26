"use client";

import { BulkUploadPage } from "@/components/admin/upload/BulkUploadPage";
import { bulkCreateTrials } from "@/actions/upload.actions";
import type { FieldDefinition } from "@/components/admin/upload/ColumnMapper";
import { TrialPhaseValues, TrialStatusValues } from "@/lib/validations/trial";

const trialFields: FieldDefinition[] = [
  { name: "nctNumber", label: "NCT Number", required: true, type: "string" },
  { name: "title", label: "Title", required: true, type: "string" },
  { name: "phase", label: "Phase", required: true, type: "enum", enumValues: [...TrialPhaseValues] },
  { name: "status", label: "Status", required: true, type: "enum", enumValues: [...TrialStatusValues] },
  { name: "nmeId", label: "NME ID", required: true, type: "string" },
  { name: "leadStaffId", label: "Lead Staff ID", required: false, type: "string" },
  { name: "sponsorProtocolId", label: "Sponsor Protocol ID", required: false, type: "string" },
  { name: "primaryEndpoint", label: "Primary Endpoint", required: false, type: "string" },
  { name: "studyDesign", label: "Study Design", required: false, type: "string" },
  { name: "targetEnrollment", label: "Target Enrollment", required: true, type: "number" },
  { name: "actualEnrollment", label: "Actual Enrollment", required: false, type: "number" },
  { name: "plannedStartDate", label: "Planned Start Date", required: true, type: "date" },
  { name: "plannedEndDate", label: "Planned End Date", required: true, type: "date" },
  { name: "actualStartDate", label: "Actual Start Date", required: false, type: "date" },
  { name: "actualEndDate", label: "Actual End Date", required: false, type: "date" },
  { name: "sites", label: "Number of Sites", required: false, type: "number" },
  { name: "budget", label: "Budget", required: false, type: "number" },
  { name: "notes", label: "Notes", required: false, type: "string" },
];

export default function TrialsUploadPage() {
  return (
    <BulkUploadPage
      title="Bulk Upload Trials"
      description="Upload multiple clinical trials from a CSV or Excel file"
      backHref="/admin/trials"
      backLabel="Back to Trials"
      fields={trialFields}
      onUpload={bulkCreateTrials}
    />
  );
}
