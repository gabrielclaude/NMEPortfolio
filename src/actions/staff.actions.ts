"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StaffFormSchema } from "@/lib/validations/staff";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createStaff(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = StaffFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate employeeId
    const existingById = await prisma.staff.findUnique({
      where: { employeeId: parsed.data.employeeId },
    });
    if (existingById) {
      return {
        success: false,
        error: "An employee with this ID already exists",
        fieldErrors: { employeeId: ["This employee ID is already in use"] },
      };
    }

    // Check for duplicate email
    const existingByEmail = await prisma.staff.findUnique({
      where: { email: parsed.data.email },
    });
    if (existingByEmail) {
      return {
        success: false,
        error: "An employee with this email already exists",
        fieldErrors: { email: ["This email is already in use"] },
      };
    }

    await prisma.staff.create({
      data: parsed.data,
    });

    revalidatePath("/admin/staff");
    revalidatePath("/staff");
  } catch (error) {
    console.error("Failed to create staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create staff",
    };
  }

  redirect("/admin/staff");
}

export async function updateStaff(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = StaffFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate employeeId (excluding current record)
    const existingById = await prisma.staff.findFirst({
      where: { employeeId: parsed.data.employeeId, NOT: { id } },
    });
    if (existingById) {
      return {
        success: false,
        error: "An employee with this ID already exists",
        fieldErrors: { employeeId: ["This employee ID is already in use"] },
      };
    }

    // Check for duplicate email (excluding current record)
    const existingByEmail = await prisma.staff.findFirst({
      where: { email: parsed.data.email, NOT: { id } },
    });
    if (existingByEmail) {
      return {
        success: false,
        error: "An employee with this email already exists",
        fieldErrors: { email: ["This email is already in use"] },
      };
    }

    await prisma.staff.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/staff");
    revalidatePath("/staff");
    revalidatePath(`/staff/${id}`);
  } catch (error) {
    console.error("Failed to update staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update staff",
    };
  }

  redirect("/admin/staff");
}

export async function deleteStaff(id: string): Promise<ActionState> {
  try {
    // Check for associated records
    const staffWithRelations = await prisma.staff.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignedTasks: true,
            trialAssignments: true,
            ledTrials: true,
          },
        },
      },
    });

    if (!staffWithRelations) {
      return { success: false, error: "Staff member not found" };
    }

    const totalRelations =
      staffWithRelations._count.assignedTasks +
      staffWithRelations._count.trialAssignments +
      staffWithRelations._count.ledTrials;

    if (totalRelations > 0) {
      return {
        success: false,
        error: `Cannot delete staff with ${totalRelations} associated record(s). Remove assignments first.`,
      };
    }

    await prisma.staff.delete({ where: { id } });

    revalidatePath("/admin/staff");
    revalidatePath("/staff");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete staff:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete staff",
    };
  }
}
