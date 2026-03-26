import { z } from "zod";

export const ProjectStatusValues = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
  "AT_RISK",
] as const;

export const TaskPriorityValues = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const ProjectClientFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be 20 characters or less"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(ProjectStatusValues, {
    message: "Please select a status",
  }),
  priority: z.enum(TaskPriorityValues, {
    message: "Please select a priority",
  }),
  trialId: z.string().min(1, "Please select a trial"),
  plannedStart: z.string().min(1, "Planned start date is required"),
  plannedEnd: z.string().min(1, "Planned end date is required"),
  actualStart: z.string().optional().nullable(),
  actualEnd: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  percentComplete: z.string(),
});

export type ProjectFormValues = z.infer<typeof ProjectClientFormSchema>;

export const ProjectFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be 20 characters or less"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  status: z.enum(ProjectStatusValues, {
    message: "Please select a status",
  }),
  priority: z.enum(TaskPriorityValues, {
    message: "Please select a priority",
  }),
  trialId: z.string().min(1, "Please select a trial"),
  plannedStart: z
    .string()
    .min(1, "Planned start date is required")
    .transform((val) => new Date(val)),
  plannedEnd: z
    .string()
    .min(1, "Planned end date is required")
    .transform((val) => new Date(val)),
  actualStart: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? new Date(val) : null)),
  actualEnd: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? new Date(val) : null)),
  budget: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? parseFloat(val) : null)),
  percentComplete: z
    .string()
    .transform((val) => Math.min(100, Math.max(0, parseInt(val, 10) || 0))),
});

export const ProjectStatusLabels: Record<(typeof ProjectStatusValues)[number], string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  AT_RISK: "At Risk",
};

export const TaskPriorityLabels: Record<(typeof TaskPriorityValues)[number], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};
