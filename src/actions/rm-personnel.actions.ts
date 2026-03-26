"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RmPersonnelFormSchema } from "@/lib/validations/rm-personnel";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createRmPersonnel(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmPersonnelFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate name
    const existing = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_personnel WHERE LOWER(name) = LOWER(${parsed.data.name})
    `;
    if (Number(existing[0].count) > 0) {
      return {
        success: false,
        error: "A person with this name already exists",
        fieldErrors: { name: ["This name is already in use"] },
      };
    }

    await prisma.$executeRaw`
      INSERT INTO rm_personnel (name, total_allocation, adjustment)
      VALUES (${parsed.data.name}, ${parsed.data.totalAllocation}, ${parsed.data.adjustment})
    `;

    revalidatePath("/admin/rm/personnel");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to create RM personnel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create personnel",
    };
  }

  redirect("/admin/rm/personnel");
}

export async function updateRmPersonnel(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmPersonnelFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate name (excluding current record)
    const existing = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_personnel
      WHERE LOWER(name) = LOWER(${parsed.data.name}) AND id != ${id}
    `;
    if (Number(existing[0].count) > 0) {
      return {
        success: false,
        error: "A person with this name already exists",
        fieldErrors: { name: ["This name is already in use"] },
      };
    }

    await prisma.$executeRaw`
      UPDATE rm_personnel
      SET name = ${parsed.data.name},
          total_allocation = ${parsed.data.totalAllocation},
          adjustment = ${parsed.data.adjustment}
      WHERE id = ${id}
    `;

    revalidatePath("/admin/rm/personnel");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to update RM personnel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update personnel",
    };
  }

  redirect("/admin/rm/personnel");
}

export async function deleteRmPersonnel(id: number): Promise<ActionState> {
  try {
    // Check for associated assignments
    const assignmentCount = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_staff_assignment WHERE personnel_id = ${id}
    `;

    if (Number(assignmentCount[0].count) > 0) {
      return {
        success: false,
        error: `Cannot delete personnel with ${Number(assignmentCount[0].count)} study assignment(s). Remove assignments first.`,
      };
    }

    await prisma.$executeRaw`DELETE FROM rm_personnel WHERE id = ${id}`;

    revalidatePath("/admin/rm/personnel");
    revalidatePath("/rm");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete RM personnel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete personnel",
    };
  }
}

export async function getRmPersonnel() {
  return prisma.$queryRaw<{
    id: number;
    name: string;
    total_allocation: number;
    adjustment: number;
    assignment_count: bigint;
    utilization: number;
  }[]>`
    SELECT
      p.id, p.name,
      p.total_allocation::float as total_allocation,
      p.adjustment::float as adjustment,
      (SELECT COUNT(*) FROM rm_staff_assignment WHERE personnel_id = p.id) as assignment_count,
      COALESCE(
        (SELECT SUM(allocation_pct) FROM rm_staff_assignment WHERE personnel_id = p.id),
        0
      )::float as utilization
    FROM rm_personnel p
    ORDER BY p.name
  `;
}

export async function getRmPersonnelById(id: number) {
  const rows = await prisma.$queryRaw<{
    id: number;
    name: string;
    total_allocation: number;
    adjustment: number;
  }[]>`
    SELECT id, name, total_allocation::float as total_allocation, adjustment::float as adjustment
    FROM rm_personnel
    WHERE id = ${id}
  `;
  return rows[0] ?? null;
}
