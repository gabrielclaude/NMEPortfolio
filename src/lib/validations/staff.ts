import { z } from "zod";

export const StaffRoleValues = [
  "PRINCIPAL_SCIENTIST",
  "MEDICAL_MONITOR",
  "RESEARCH_ASSOCIATE",
  "CLINICAL_OPERATIONS_MANAGER",
  "DATA_MANAGER",
  "BIOSTATISTICIAN",
  "REGULATORY_AFFAIRS",
  "PROJECT_MANAGER",
] as const;

export const StaffClientFormSchema = z.object({
  employeeId: z
    .string()
    .min(1, "Employee ID is required")
    .max(20, "Employee ID must be 20 characters or less"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(StaffRoleValues, {
    message: "Please select a role",
  }),
  department: z
    .string()
    .min(1, "Department is required")
    .max(100, "Department must be 100 characters or less"),
  specialization: z
    .string()
    .max(100, "Specialization must be 100 characters or less")
    .optional()
    .nullable(),
  yearsExperience: z.string(),
  isActive: z.boolean(),
  hireDate: z.string().min(1, "Hire date is required"),
});

export type StaffFormValues = z.infer<typeof StaffClientFormSchema>;

export const StaffFormSchema = z.object({
  employeeId: z
    .string()
    .min(1, "Employee ID is required")
    .max(20, "Employee ID must be 20 characters or less"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be 50 characters or less"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(StaffRoleValues, {
    message: "Please select a role",
  }),
  department: z
    .string()
    .min(1, "Department is required")
    .max(100, "Department must be 100 characters or less"),
  specialization: z
    .string()
    .max(100, "Specialization must be 100 characters or less")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  yearsExperience: z
    .string()
    .transform((val) => (val === "" ? 0 : parseInt(val, 10)))
    .pipe(z.number().min(0).max(50)),
  isActive: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "on"),
  hireDate: z
    .string()
    .min(1, "Hire date is required")
    .transform((val) => new Date(val)),
});

export const StaffRoleLabels: Record<(typeof StaffRoleValues)[number], string> = {
  PRINCIPAL_SCIENTIST: "Principal Scientist",
  MEDICAL_MONITOR: "Medical Monitor",
  RESEARCH_ASSOCIATE: "Research Associate",
  CLINICAL_OPERATIONS_MANAGER: "Clinical Ops Manager",
  DATA_MANAGER: "Data Manager",
  BIOSTATISTICIAN: "Biostatistician",
  REGULATORY_AFFAIRS: "Regulatory Affairs",
  PROJECT_MANAGER: "Project Manager",
};
