"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MilestoneFormSchema } from "@/lib/validations/milestone";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createMilestone(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = MilestoneFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    await prisma.milestone.create({
      data: parsed.data,
    });

    revalidatePath("/admin/milestones");
  } catch (error) {
    console.error("Failed to create milestone:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create milestone",
    };
  }

  redirect("/admin/milestones");
}

export async function updateMilestone(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = MilestoneFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    await prisma.milestone.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/milestones");
  } catch (error) {
    console.error("Failed to update milestone:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update milestone",
    };
  }

  redirect("/admin/milestones");
}

export async function deleteMilestone(id: string): Promise<ActionState> {
  try {
    const milestoneWithRelations = await prisma.milestone.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true, assignments: true },
        },
      },
    });

    if (!milestoneWithRelations) {
      return { success: false, error: "Milestone not found" };
    }

    const totalRelations =
      milestoneWithRelations._count.tasks + milestoneWithRelations._count.assignments;

    if (totalRelations > 0) {
      return {
        success: false,
        error: `Cannot delete milestone with ${totalRelations} associated record(s). Delete tasks first.`,
      };
    }

    await prisma.milestone.delete({ where: { id } });

    revalidatePath("/admin/milestones");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete milestone:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete milestone",
    };
  }
}
