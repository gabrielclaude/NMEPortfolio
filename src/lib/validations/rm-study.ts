import { z } from "zod";

export const RmStudyStatusValues = ["Active", "On Hold", "Completed", "Cancelled"] as const;
export const RmStudyComplexityValues = ["Low", "Medium", "High"] as const;

export const RmStudyClientFormSchema = z.object({
  id: z
    .string()
    .min(1, "Study ID is required")
    .max(50, "Study ID must be 50 characters or less")
    .regex(/^[A-Za-z0-9\-_]+$/, "Study ID can only contain letters, numbers, hyphens, and underscores"),
  phase: z.string().min(1, "Phase is required"),
  status: z.enum(RmStudyStatusValues, {
    message: "Please select a status",
  }),
  complexity: z.enum(RmStudyComplexityValues, {
    message: "Please select a complexity level",
  }),
  nmeId: z.string().optional().nullable(),
});

export type RmStudyFormValues = z.infer<typeof RmStudyClientFormSchema>;

export const RmStudyFormSchema = z.object({
  id: z
    .string()
    .min(1, "Study ID is required")
    .max(50, "Study ID must be 50 characters or less")
    .regex(/^[A-Za-z0-9\-_]+$/, "Study ID can only contain letters, numbers, hyphens, and underscores"),
  phase: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1, "Phase must be at least 1").max(4, "Phase must be at most 4")),
  status: z.enum(RmStudyStatusValues, {
    message: "Please select a status",
  }),
  complexity: z.enum(RmStudyComplexityValues, {
    message: "Please select a complexity level",
  }),
  nmeId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" || val === "none" ? null : val)),
});

export const RmStudyStatusLabels: Record<(typeof RmStudyStatusValues)[number], string> = {
  Active: "Active",
  "On Hold": "On Hold",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

export const RmStudyComplexityLabels: Record<(typeof RmStudyComplexityValues)[number], string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
};
