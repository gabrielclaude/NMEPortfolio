import { z } from "zod";

export const RmSegmentActivityValues = [
  "Start Up",
  "Conduct",
  "Close Out",
] as const;

export const RmSegmentRoleValues = [
  "Clinical Scientist",
  "Medical Monitor",
  "Clinical RA",
] as const;

export const RmSegmentComplexityValues = ["Low", "Medium", "High"] as const;

export const RmStudySegmentClientFormSchema = z.object({
  studyId: z.string().min(1, "Study is required"),
  activity: z.enum(RmSegmentActivityValues, {
    message: "Please select an activity",
  }),
  role: z.enum(RmSegmentRoleValues, {
    message: "Please select a role",
  }),
  complexity: z.enum(RmSegmentComplexityValues, {
    message: "Please select a complexity",
  }),
  phase: z.string().min(1, "Phase is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  ftePerMonth: z.string().min(1, "FTE per month is required"),
});

export type RmStudySegmentFormValues = z.infer<typeof RmStudySegmentClientFormSchema>;

export const RmStudySegmentFormSchema = z.object({
  studyId: z.string().min(1, "Study is required"),
  activity: z.enum(RmSegmentActivityValues, {
    message: "Please select an activity",
  }),
  role: z.enum(RmSegmentRoleValues, {
    message: "Please select a role",
  }),
  complexity: z.enum(RmSegmentComplexityValues, {
    message: "Please select a complexity",
  }),
  phase: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(4)),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .transform((val) => new Date(val)),
  endDate: z
    .string()
    .min(1, "End date is required")
    .transform((val) => new Date(val)),
  ftePerMonth: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "FTE must be 0 or greater").max(5, "FTE must be 5 or less")),
});

export const RmSegmentActivityLabels: Record<(typeof RmSegmentActivityValues)[number], string> = {
  "Start Up": "Start Up (SU)",
  "Conduct": "Conduct (C)",
  "Close Out": "Close Out (CO)",
};

export const RmSegmentRoleLabels: Record<(typeof RmSegmentRoleValues)[number], string> = {
  "Clinical Scientist": "Clinical Scientist",
  "Medical Monitor": "Medical Monitor",
  "Clinical RA": "Clinical Research Associate",
};

export const RmSegmentComplexityLabels: Record<(typeof RmSegmentComplexityValues)[number], string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
};
