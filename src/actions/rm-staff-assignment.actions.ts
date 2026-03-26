"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RmStaffAssignmentFormSchema } from "@/lib/validations/rm-staff-assignment";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createRmStaffAssignment(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmStaffAssignmentFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate assignment (same study, personnel, role)
    const existing = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_staff_assignment
      WHERE study_id = ${parsed.data.studyId}
        AND personnel_id = ${parsed.data.personnelId}
        AND role = ${parsed.data.role}
    `;
    if (Number(existing[0].count) > 0) {
      return {
        success: false,
        error: "This person is already assigned to this study with this role",
        fieldErrors: { personnelId: ["Already assigned with this role"] },
      };
    }

    await prisma.$executeRaw`
      INSERT INTO rm_staff_assignment (study_id, personnel_id, role, allocation_pct)
      VALUES (${parsed.data.studyId}, ${parsed.data.personnelId}, ${parsed.data.role}, ${parsed.data.allocationPct})
    `;

    revalidatePath("/admin/rm/assignments");
    revalidatePath("/admin/rm/studies");
    revalidatePath("/admin/rm/personnel");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to create RM staff assignment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create assignment",
    };
  }

  redirect("/admin/rm/assignments");
}

export async function updateRmStaffAssignment(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmStaffAssignmentFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate assignment (excluding current record)
    const existing = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_staff_assignment
      WHERE study_id = ${parsed.data.studyId}
        AND personnel_id = ${parsed.data.personnelId}
        AND role = ${parsed.data.role}
        AND id != ${id}
    `;
    if (Number(existing[0].count) > 0) {
      return {
        success: false,
        error: "This person is already assigned to this study with this role",
        fieldErrors: { personnelId: ["Already assigned with this role"] },
      };
    }

    await prisma.$executeRaw`
      UPDATE rm_staff_assignment
      SET study_id = ${parsed.data.studyId},
          personnel_id = ${parsed.data.personnelId},
          role = ${parsed.data.role},
          allocation_pct = ${parsed.data.allocationPct}
      WHERE id = ${id}
    `;

    revalidatePath("/admin/rm/assignments");
    revalidatePath("/admin/rm/studies");
    revalidatePath("/admin/rm/personnel");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to update RM staff assignment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update assignment",
    };
  }

  redirect("/admin/rm/assignments");
}

export async function deleteRmStaffAssignment(id: number): Promise<ActionState> {
  try {
    await prisma.$executeRaw`DELETE FROM rm_staff_assignment WHERE id = ${id}`;

    revalidatePath("/admin/rm/assignments");
    revalidatePath("/admin/rm/studies");
    revalidatePath("/admin/rm/personnel");
    revalidatePath("/rm");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete RM staff assignment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete assignment",
    };
  }
}

export async function getRmStaffAssignments() {
  return prisma.$queryRaw<{
    id: number;
    study_id: string;
    personnel_id: number;
    personnel_name: string;
    role: string;
    allocation_pct: number;
    study_phase: number;
    study_status: string;
  }[]>`
    SELECT
      sa.id,
      sa.study_id,
      sa.personnel_id,
      p.name as personnel_name,
      sa.role,
      sa.allocation_pct::float as allocation_pct,
      s.phase as study_phase,
      s.status as study_status
    FROM rm_staff_assignment sa
    JOIN rm_personnel p ON p.id = sa.personnel_id
    JOIN rm_study s ON s.id = sa.study_id
    ORDER BY sa.study_id, sa.role, p.name
  `;
}

export async function getRmStaffAssignmentById(id: number) {
  const rows = await prisma.$queryRaw<{
    id: number;
    study_id: string;
    personnel_id: number;
    role: string;
    allocation_pct: number;
  }[]>`
    SELECT id, study_id, personnel_id, role, allocation_pct::float as allocation_pct
    FROM rm_staff_assignment
    WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

export async function getRmStudiesForSelect() {
  return prisma.$queryRaw<{ id: string; phase: number; status: string }[]>`
    SELECT id, phase, status FROM rm_study ORDER BY id
  `;
}

export async function getRmPersonnelForSelect() {
  return prisma.$queryRaw<{ id: number; name: string; total_allocation: number }[]>`
    SELECT id, name, total_allocation::float as total_allocation
    FROM rm_personnel ORDER BY name
  `;
}
