import { z } from "zod";

export const RmStaffRoleValues = [
  "Clinical Scientist",
  "Medical Monitor",
  "Support Medical Monitor",
  "Development Team Lead",
  "Clinical RA",
] as const;

export const RmStaffAssignmentClientFormSchema = z.object({
  studyId: z.string().min(1, "Study is required"),
  personnelId: z.string().min(1, "Personnel is required"),
  role: z.enum(RmStaffRoleValues, {
    message: "Please select a role",
  }),
  allocationPct: z.string().min(1, "Allocation percentage is required"),
});

export type RmStaffAssignmentFormValues = z.infer<typeof RmStaffAssignmentClientFormSchema>;

export const RmStaffAssignmentFormSchema = z.object({
  studyId: z.string().min(1, "Study is required"),
  personnelId: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1, "Personnel is required")),
  role: z.enum(RmStaffRoleValues, {
    message: "Please select a role",
  }),
  allocationPct: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Allocation must be 0 or greater").max(2, "Allocation must be 2 or less")),
});

export const RmStaffRoleLabels: Record<(typeof RmStaffRoleValues)[number], string> = {
  "Clinical Scientist": "Clinical Scientist",
  "Medical Monitor": "Medical Monitor",
  "Support Medical Monitor": "Support Medical Monitor",
  "Development Team Lead": "Development Team Lead",
  "Clinical RA": "Clinical Research Associate",
};
