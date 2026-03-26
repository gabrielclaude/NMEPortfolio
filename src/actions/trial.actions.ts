"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TrialFormSchema } from "@/lib/validations/trial";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createTrial(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = TrialFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate nctNumber
    const existing = await prisma.clinicalTrial.findUnique({
      where: { nctNumber: parsed.data.nctNumber },
    });
    if (existing) {
      return {
        success: false,
        error: "A trial with this NCT number already exists",
        fieldErrors: { nctNumber: ["This NCT number is already in use"] },
      };
    }

    await prisma.clinicalTrial.create({
      data: parsed.data,
    });

    revalidatePath("/admin/trials");
    revalidatePath("/trials");
  } catch (error) {
    console.error("Failed to create trial:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create trial",
    };
  }

  redirect("/admin/trials");
}

export async function updateTrial(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = TrialFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate nctNumber (excluding current record)
    const existing = await prisma.clinicalTrial.findFirst({
      where: { nctNumber: parsed.data.nctNumber, NOT: { id } },
    });
    if (existing) {
      return {
        success: false,
        error: "A trial with this NCT number already exists",
        fieldErrors: { nctNumber: ["This NCT number is already in use"] },
      };
    }

    await prisma.clinicalTrial.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/trials");
    revalidatePath("/trials");
    revalidatePath(`/trials/${id}`);
  } catch (error) {
    console.error("Failed to update trial:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update trial",
    };
  }

  redirect("/admin/trials");
}

export async function deleteTrial(id: string): Promise<ActionState> {
  try {
    const trialWithRelations = await prisma.clinicalTrial.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            staffAssignments: true,
          },
        },
      },
    });

    if (!trialWithRelations) {
      return { success: false, error: "Trial not found" };
    }

    const totalRelations =
      trialWithRelations._count.projects + trialWithRelations._count.staffAssignments;

    if (totalRelations > 0) {
      return {
        success: false,
        error: `Cannot delete trial with ${totalRelations} associated record(s). Delete projects and assignments first.`,
      };
    }

    await prisma.clinicalTrial.delete({ where: { id } });

    revalidatePath("/admin/trials");
    revalidatePath("/trials");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete trial:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete trial",
    };
  }
}
