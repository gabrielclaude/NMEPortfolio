import { z } from "zod";

export const TrialPhaseValues = [
  "PHASE_1",
  "PHASE_1B",
  "PHASE_2",
  "PHASE_2B",
  "PHASE_3",
  "PHASE_3B",
  "PHASE_4",
  "EXPANDED_ACCESS",
] as const;

export const TrialStatusValues = [
  "PLANNING",
  "RECRUITING",
  "ACTIVE",
  "ENROLLMENT_COMPLETE",
  "COMPLETED",
  "SUSPENDED",
  "TERMINATED",
  "WITHDRAWN",
] as const;

export const TrialClientFormSchema = z.object({
  nctNumber: z
    .string()
    .min(1, "NCT Number is required")
    .max(20, "NCT Number must be 20 characters or less"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(500, "Title must be 500 characters or less"),
  phase: z.enum(TrialPhaseValues, {
    message: "Please select a phase",
  }),
  status: z.enum(TrialStatusValues, {
    message: "Please select a status",
  }),
  nmeId: z.string().min(1, "Please select an NME"),
  leadStaffId: z.string().optional().nullable(),
  sponsorProtocolId: z.string().max(50).optional().nullable(),
  primaryEndpoint: z.string().max(500).optional().nullable(),
  studyDesign: z.string().max(200).optional().nullable(),
  targetEnrollment: z.string(),
  actualEnrollment: z.string(),
  plannedStartDate: z.string().min(1, "Planned start date is required"),
  plannedEndDate: z.string().min(1, "Planned end date is required"),
  actualStartDate: z.string().optional().nullable(),
  actualEndDate: z.string().optional().nullable(),
  sites: z.string(),
  budget: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type TrialFormValues = z.infer<typeof TrialClientFormSchema>;

export const TrialFormSchema = z.object({
  nctNumber: z
    .string()
    .min(1, "NCT Number is required")
    .max(20, "NCT Number must be 20 characters or less"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(500, "Title must be 500 characters or less"),
  phase: z.enum(TrialPhaseValues, {
    message: "Please select a phase",
  }),
  status: z.enum(TrialStatusValues, {
    message: "Please select a status",
  }),
  nmeId: z.string().min(1, "Please select an NME"),
  leadStaffId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  sponsorProtocolId: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  primaryEndpoint: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  studyDesign: z
    .string()
    .max(200)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  targetEnrollment: z.string().transform((val) => parseInt(val, 10) || 0),
  actualEnrollment: z.string().transform((val) => parseInt(val, 10) || 0),
  plannedStartDate: z
    .string()
    .min(1, "Planned start date is required")
    .transform((val) => new Date(val)),
  plannedEndDate: z
    .string()
    .min(1, "Planned end date is required")
    .transform((val) => new Date(val)),
  actualStartDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? new Date(val) : null)),
  actualEndDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? new Date(val) : null)),
  sites: z.string().transform((val) => parseInt(val, 10) || 0),
  budget: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? parseFloat(val) : null)),
  notes: z
    .string()
    .max(2000)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

export const TrialPhaseLabels: Record<(typeof TrialPhaseValues)[number], string> = {
  PHASE_1: "Phase 1",
  PHASE_1B: "Phase 1b",
  PHASE_2: "Phase 2",
  PHASE_2B: "Phase 2b",
  PHASE_3: "Phase 3",
  PHASE_3B: "Phase 3b",
  PHASE_4: "Phase 4",
  EXPANDED_ACCESS: "Expanded Access",
};

export const TrialStatusLabels: Record<(typeof TrialStatusValues)[number], string> = {
  PLANNING: "Planning",
  RECRUITING: "Recruiting",
  ACTIVE: "Active",
  ENROLLMENT_COMPLETE: "Enrollment Complete",
  COMPLETED: "Completed",
  SUSPENDED: "Suspended",
  TERMINATED: "Terminated",
  WITHDRAWN: "Withdrawn",
};
