"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TaskFormSchema } from "@/lib/validations/task";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createTask(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = TaskFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    await prisma.task.create({
      data: parsed.data,
    });

    revalidatePath("/admin/tasks");
  } catch (error) {
    console.error("Failed to create task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }

  redirect("/admin/tasks");
}

export async function updateTask(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = TaskFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    await prisma.task.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/tasks");
  } catch (error) {
    console.error("Failed to update task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }

  redirect("/admin/tasks");
}

export async function deleteTask(id: string): Promise<ActionState> {
  try {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    await prisma.task.delete({ where: { id } });

    revalidatePath("/admin/tasks");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}
