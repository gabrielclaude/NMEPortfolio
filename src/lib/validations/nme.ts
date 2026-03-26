import { z } from "zod";

// Enum values matching Prisma schema
export const TherapeuticAreaValues = [
  "ONCOLOGY",
  "CARDIOVASCULAR",
  "NEUROLOGY",
  "IMMUNOLOGY",
  "INFECTIOUS_DISEASE",
  "METABOLIC",
  "RESPIRATORY",
  "RARE_DISEASE",
  "OPHTHALMOLOGY",
  "DERMATOLOGY",
] as const;

export const MoleculeTypeValues = [
  "SMALL_MOLECULE",
  "BIOLOGIC",
  "ANTIBODY",
  "PEPTIDE",
  "OLIGONUCLEOTIDE",
  "GENE_THERAPY",
  "CELL_THERAPY",
] as const;

export const NMEStatusValues = [
  "PRECLINICAL",
  "IND_FILED",
  "PHASE_1",
  "PHASE_2",
  "PHASE_3",
  "PHASE_4",
  "NDA_FILED",
  "APPROVED",
  "DISCONTINUED",
  "ON_HOLD",
] as const;

// Schema for form validation (client-side, uses strings for dates)
export const NMEClientFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be 20 characters or less")
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase letters, numbers, and hyphens only"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  genericName: z
    .string()
    .max(100, "Generic name must be 100 characters or less")
    .optional()
    .nullable(),
  therapeuticArea: z.enum(TherapeuticAreaValues, {
    message: "Please select a therapeutic area",
  }),
  moleculeType: z.enum(MoleculeTypeValues, {
    message: "Please select a molecule type",
  }),
  status: z.enum(NMEStatusValues, {
    message: "Please select a status",
  }),
  targetIndication: z
    .string()
    .min(1, "Target indication is required")
    .max(500, "Target indication must be 500 characters or less"),
  mechanismOfAction: z
    .string()
    .max(500, "Mechanism of action must be 500 characters or less")
    .optional()
    .nullable(),
  originatorCompany: z
    .string()
    .max(100, "Originator company must be 100 characters or less")
    .optional()
    .nullable(),
  patentExpiry: z.string().optional().nullable(),
  indFilingDate: z.string().optional().nullable(),
  discoveryDate: z.string().min(1, "Discovery date is required"),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or less")
    .optional()
    .nullable(),
});

export type NMEFormValues = z.infer<typeof NMEClientFormSchema>;

// Schema for server action (transforms to database types)
export const NMEFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be 20 characters or less")
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase letters, numbers, and hyphens only"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  genericName: z
    .string()
    .max(100, "Generic name must be 100 characters or less")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  therapeuticArea: z.enum(TherapeuticAreaValues, {
    message: "Please select a therapeutic area",
  }),
  moleculeType: z.enum(MoleculeTypeValues, {
    message: "Please select a molecule type",
  }),
  status: z.enum(NMEStatusValues, {
    message: "Please select a status",
  }),
  targetIndication: z
    .string()
    .min(1, "Target indication is required")
    .max(500, "Target indication must be 500 characters or less"),
  mechanismOfAction: z
    .string()
    .max(500, "Mechanism of action must be 500 characters or less")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  originatorCompany: z
    .string()
    .max(100, "Originator company must be 100 characters or less")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
  patentExpiry: z
    .string()
    .optional()
    .nullable()
    .transform(val => {
      if (!val || val === "") return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }),
  indFilingDate: z
    .string()
    .optional()
    .nullable()
    .transform(val => {
      if (!val || val === "") return null;
      const date = new Date(val);
      return isNaN(date.getTime()) ? null : date;
    }),
  discoveryDate: z
    .string()
    .min(1, "Discovery date is required")
    .transform(val => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return date;
    }),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or less")
    .optional()
    .nullable()
    .transform(val => val === "" ? null : val),
});

// Labels for display
export const TherapeuticAreaLabels: Record<typeof TherapeuticAreaValues[number], string> = {
  ONCOLOGY: "Oncology",
  CARDIOVASCULAR: "Cardiovascular",
  NEUROLOGY: "Neurology",
  IMMUNOLOGY: "Immunology",
  INFECTIOUS_DISEASE: "Infectious Disease",
  METABOLIC: "Metabolic",
  RESPIRATORY: "Respiratory",
  RARE_DISEASE: "Rare Disease",
  OPHTHALMOLOGY: "Ophthalmology",
  DERMATOLOGY: "Dermatology",
};

export const MoleculeTypeLabels: Record<typeof MoleculeTypeValues[number], string> = {
  SMALL_MOLECULE: "Small Molecule",
  BIOLOGIC: "Biologic",
  ANTIBODY: "Antibody",
  PEPTIDE: "Peptide",
  OLIGONUCLEOTIDE: "Oligonucleotide",
  GENE_THERAPY: "Gene Therapy",
  CELL_THERAPY: "Cell Therapy",
};

export const NMEStatusLabels: Record<typeof NMEStatusValues[number], string> = {
  PRECLINICAL: "Preclinical",
  IND_FILED: "IND Filed",
  PHASE_1: "Phase 1",
  PHASE_2: "Phase 2",
  PHASE_3: "Phase 3",
  PHASE_4: "Phase 4",
  NDA_FILED: "NDA Filed",
  APPROVED: "Approved",
  DISCONTINUED: "Discontinued",
  ON_HOLD: "On Hold",
};
