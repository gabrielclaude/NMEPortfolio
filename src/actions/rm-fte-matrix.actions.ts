"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RmFteMatrixFormSchema } from "@/lib/validations/rm-fte-matrix";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createRmFteMatrix(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmFteMatrixFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate entry
    const existing = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_fte_matrix
      WHERE complexity = ${parsed.data.complexity}
        AND role = ${parsed.data.role}
        AND phase = ${parsed.data.phase}
        AND activity = ${parsed.data.activity}
    `;
    if (Number(existing[0].count) > 0) {
      return {
        success: false,
        error: "An entry with this combination already exists",
        fieldErrors: { complexity: ["This combination already exists"] },
      };
    }

    await prisma.$executeRaw`
      INSERT INTO rm_fte_matrix (complexity, role, phase, activity, fte_per_month)
      VALUES (${parsed.data.complexity}, ${parsed.data.role}, ${parsed.data.phase}, ${parsed.data.activity}, ${parsed.data.ftePerMonth})
    `;

    revalidatePath("/admin/rm/fte-matrix");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to create RM FTE matrix entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create entry",
    };
  }

  redirect("/admin/rm/fte-matrix");
}

export async function updateRmFteMatrix(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmFteMatrixFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate entry (excluding current record)
    const existing = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_fte_matrix
      WHERE complexity = ${parsed.data.complexity}
        AND role = ${parsed.data.role}
        AND phase = ${parsed.data.phase}
        AND activity = ${parsed.data.activity}
        AND id != ${id}
    `;
    if (Number(existing[0].count) > 0) {
      return {
        success: false,
        error: "An entry with this combination already exists",
        fieldErrors: { complexity: ["This combination already exists"] },
      };
    }

    await prisma.$executeRaw`
      UPDATE rm_fte_matrix
      SET complexity = ${parsed.data.complexity},
          role = ${parsed.data.role},
          phase = ${parsed.data.phase},
          activity = ${parsed.data.activity},
          fte_per_month = ${parsed.data.ftePerMonth}
      WHERE id = ${id}
    `;

    revalidatePath("/admin/rm/fte-matrix");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to update RM FTE matrix entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update entry",
    };
  }

  redirect("/admin/rm/fte-matrix");
}

export async function deleteRmFteMatrix(id: number): Promise<ActionState> {
  try {
    await prisma.$executeRaw`DELETE FROM rm_fte_matrix WHERE id = ${id}`;

    revalidatePath("/admin/rm/fte-matrix");
    revalidatePath("/rm");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete RM FTE matrix entry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete entry",
    };
  }
}

export async function getRmFteMatrixEntries() {
  return prisma.$queryRaw<{
    id: number;
    complexity: string;
    role: string;
    phase: number;
    activity: string;
    fte_per_month: number;
  }[]>`
    SELECT id, complexity, role, phase, activity, fte_per_month::float as fte_per_month
    FROM rm_fte_matrix
    ORDER BY complexity, role, phase, activity
  `;
}

export async function getRmFteMatrixById(id: number) {
  const rows = await prisma.$queryRaw<{
    id: number;
    complexity: string;
    role: string;
    phase: number;
    activity: string;
    fte_per_month: number;
  }[]>`
    SELECT id, complexity, role, phase, activity, fte_per_month::float as fte_per_month
    FROM rm_fte_matrix
    WHERE id = ${id}
  `;
  return rows[0] ?? null;
}
