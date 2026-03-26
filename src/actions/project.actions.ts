"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProjectFormSchema } from "@/lib/validations/project";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createProject(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = ProjectFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate code
    const existing = await prisma.project.findUnique({
      where: { code: parsed.data.code },
    });
    if (existing) {
      return {
        success: false,
        error: "A project with this code already exists",
        fieldErrors: { code: ["This code is already in use"] },
      };
    }

    await prisma.project.create({
      data: parsed.data,
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
  } catch (error) {
    console.error("Failed to create project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }

  redirect("/admin/projects");
}

export async function updateProject(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = ProjectFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate code (excluding current record)
    const existing = await prisma.project.findFirst({
      where: { code: parsed.data.code, NOT: { id } },
    });
    if (existing) {
      return {
        success: false,
        error: "A project with this code already exists",
        fieldErrors: { code: ["This code is already in use"] },
      };
    }

    await prisma.project.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
  } catch (error) {
    console.error("Failed to update project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project",
    };
  }

  redirect("/admin/projects");
}

export async function deleteProject(id: string): Promise<ActionState> {
  try {
    const projectWithRelations = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { milestones: true },
        },
      },
    });

    if (!projectWithRelations) {
      return { success: false, error: "Project not found" };
    }

    if (projectWithRelations._count.milestones > 0) {
      return {
        success: false,
        error: `Cannot delete project with ${projectWithRelations._count.milestones} milestone(s). Delete milestones first.`,
      };
    }

    await prisma.project.delete({ where: { id } });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}
