"use client";

import { BulkUploadPage } from "@/components/admin/upload/BulkUploadPage";
import { bulkCreateNMEs } from "@/actions/upload.actions";
import type { FieldDefinition } from "@/components/admin/upload/ColumnMapper";
import {
  TherapeuticAreaValues,
  MoleculeTypeValues,
  NMEStatusValues,
} from "@/lib/validations/nme";

const nmeFields: FieldDefinition[] = [
  { name: "code", label: "Code", required: true, type: "string" },
  { name: "name", label: "Name", required: true, type: "string" },
  { name: "genericName", label: "Generic Name", required: false, type: "string" },
  { name: "therapeuticArea", label: "Therapeutic Area", required: true, type: "enum", enumValues: [...TherapeuticAreaValues] },
  { name: "moleculeType", label: "Molecule Type", required: true, type: "enum", enumValues: [...MoleculeTypeValues] },
  { name: "status", label: "Status", required: true, type: "enum", enumValues: [...NMEStatusValues] },
  { name: "targetIndication", label: "Target Indication", required: true, type: "string" },
  { name: "mechanismOfAction", label: "Mechanism of Action", required: false, type: "string" },
  { name: "originatorCompany", label: "Originator Company", required: false, type: "string" },
  { name: "patentExpiry", label: "Patent Expiry", required: false, type: "date" },
  { name: "indFilingDate", label: "IND Filing Date", required: false, type: "date" },
  { name: "discoveryDate", label: "Discovery Date", required: true, type: "date" },
  { name: "notes", label: "Notes", required: false, type: "string" },
];

export default function NMEsUploadPage() {
  return (
    <BulkUploadPage
      title="Bulk Upload NMEs"
      description="Upload multiple New Molecular Entities from a CSV or Excel file"
      backHref="/admin/nmes"
      backLabel="Back to NMEs"
      fields={nmeFields}
      onUpload={bulkCreateNMEs}
    />
  );
}
