import { z } from "zod";

export const TaskStatusValues = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "BLOCKED",
  "CANCELLED",
] as const;

export const TaskPriorityValues = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const TaskClientFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(TaskStatusValues, {
    message: "Please select a status",
  }),
  priority: z.enum(TaskPriorityValues, {
    message: "Please select a priority",
  }),
  milestoneId: z.string().min(1, "Please select a milestone"),
  assigneeId: z.string().optional().nullable(),
  estimatedHours: z.string().optional().nullable(),
  actualHours: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof TaskClientFormSchema>;

export const TaskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  status: z.enum(TaskStatusValues, {
    message: "Please select a status",
  }),
  priority: z.enum(TaskPriorityValues, {
    message: "Please select a priority",
  }),
  milestoneId: z.string().min(1, "Please select a milestone"),
  assigneeId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  estimatedHours: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? parseFloat(val) : null)),
  actualHours: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? parseFloat(val) : null)),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? new Date(val) : null)),
  completedAt: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? new Date(val) : null)),
});

export const TaskStatusLabels: Record<(typeof TaskStatusValues)[number], string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  BLOCKED: "Blocked",
  CANCELLED: "Cancelled",
};

export const TaskPriorityLabels: Record<(typeof TaskPriorityValues)[number], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};
