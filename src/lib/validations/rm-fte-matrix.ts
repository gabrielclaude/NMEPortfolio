import { z } from "zod";

export const RmFteMatrixComplexityValues = ["Low", "Medium", "High"] as const;
export const RmFteMatrixRoleValues = ["Clinical Scientist", "Medical Monitor", "Clinical RA"] as const;
export const RmFteMatrixActivityValues = ["Start Up", "Conduct", "Close Out"] as const;

export const RmFteMatrixClientFormSchema = z.object({
  complexity: z.enum(RmFteMatrixComplexityValues, {
    message: "Please select a complexity level",
  }),
  role: z.enum(RmFteMatrixRoleValues, {
    message: "Please select a role",
  }),
  phase: z.string().min(1, "Phase is required"),
  activity: z.enum(RmFteMatrixActivityValues, {
    message: "Please select an activity",
  }),
  ftePerMonth: z.string().min(1, "FTE per month is required"),
});

export type RmFteMatrixFormValues = z.infer<typeof RmFteMatrixClientFormSchema>;

export const RmFteMatrixFormSchema = z.object({
  complexity: z.enum(RmFteMatrixComplexityValues, {
    message: "Please select a complexity level",
  }),
  role: z.enum(RmFteMatrixRoleValues, {
    message: "Please select a role",
  }),
  phase: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1, "Phase must be at least 1").max(4, "Phase must be at most 4")),
  activity: z.enum(RmFteMatrixActivityValues, {
    message: "Please select an activity",
  }),
  ftePerMonth: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "FTE must be 0 or greater").max(10, "FTE must be 10 or less")),
});

export const RmFteMatrixComplexityLabels: Record<(typeof RmFteMatrixComplexityValues)[number], string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
};

export const RmFteMatrixRoleLabels: Record<(typeof RmFteMatrixRoleValues)[number], string> = {
  "Clinical Scientist": "Clinical Scientist",
  "Medical Monitor": "Medical Monitor",
  "Clinical RA": "Clinical Research Associate",
};

export const RmFteMatrixActivityLabels: Record<(typeof RmFteMatrixActivityValues)[number], string> = {
  "Start Up": "Start Up (SU)",
  "Conduct": "Conduct (C)",
  "Close Out": "Close Out (CO)",
};
