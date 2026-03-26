import { z } from "zod";

export const RmPersonnelClientFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  totalAllocation: z.string().min(1, "Total allocation is required"),
  adjustment: z.string().optional(),
});

export type RmPersonnelFormValues = z.infer<typeof RmPersonnelClientFormSchema>;

export const RmPersonnelFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  totalAllocation: z
    .string()
    .transform((val) => (val === "" ? 0 : parseFloat(val)))
    .pipe(z.number().min(0, "Allocation must be 0 or greater").max(10, "Allocation must be 10 or less")),
  adjustment: z
    .string()
    .optional()
    .transform((val) => (val === "" || val === undefined ? 0 : parseFloat(val)))
    .pipe(z.number().min(-5, "Adjustment must be -5 or greater").max(5, "Adjustment must be 5 or less")),
});
