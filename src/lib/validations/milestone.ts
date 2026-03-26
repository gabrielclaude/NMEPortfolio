import { z } from "zod";

export const MilestoneStatusValues = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "DELAYED",
  "SKIPPED",
] as const;

export const MilestoneClientFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(MilestoneStatusValues, {
    message: "Please select a status",
  }),
  projectId: z.string().min(1, "Please select a project"),
  dueDate: z.string().min(1, "Due date is required"),
  completedDate: z.string().optional().nullable(),
  isCriticalPath: z.boolean(),
  sortOrder: z.string(),
});

export type MilestoneFormValues = z.infer<typeof MilestoneClientFormSchema>;

export const MilestoneFormSchema = z.object({
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
  status: z.enum(MilestoneStatusValues, {
    message: "Please select a status",
  }),
  projectId: z.string().min(1, "Please select a project"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .transform((val) => new Date(val)),
  completedDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? new Date(val) : null)),
  isCriticalPath: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "on"),
  sortOrder: z.string().transform((val) => parseInt(val, 10) || 0),
});

export const MilestoneStatusLabels: Record<(typeof MilestoneStatusValues)[number], string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DELAYED: "Delayed",
  SKIPPED: "Skipped",
};
