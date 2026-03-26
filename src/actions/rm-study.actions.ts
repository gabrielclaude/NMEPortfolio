"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RmStudyFormSchema } from "@/lib/validations/rm-study";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createRmStudy(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmStudyFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate study ID
    const existing = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_study WHERE id = ${parsed.data.id}
    `;
    if (Number(existing[0].count) > 0) {
      return {
        success: false,
        error: "A study with this ID already exists",
        fieldErrors: { id: ["This study ID is already in use"] },
      };
    }

    await prisma.$executeRaw`
      INSERT INTO rm_study (id, phase, status, complexity, nme_id)
      VALUES (${parsed.data.id}, ${parsed.data.phase}, ${parsed.data.status}, ${parsed.data.complexity}, ${parsed.data.nmeId})
    `;

    revalidatePath("/admin/rm/studies");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to create RM study:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create study",
    };
  }

  redirect("/admin/rm/studies");
}

export async function updateRmStudy(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmStudyFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // If ID changed, check for duplicate
    if (parsed.data.id !== id) {
      const existing = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM rm_study WHERE id = ${parsed.data.id}
      `;
      if (Number(existing[0].count) > 0) {
        return {
          success: false,
          error: "A study with this ID already exists",
          fieldErrors: { id: ["This study ID is already in use"] },
        };
      }
    }

    // Update study (using separate queries since we might be changing the ID)
    if (parsed.data.id !== id) {
      // Need to update foreign key references first
      await prisma.$executeRaw`
        UPDATE rm_study_segment SET study_id = ${parsed.data.id} WHERE study_id = ${id}
      `;
      await prisma.$executeRaw`
        UPDATE rm_staff_assignment SET study_id = ${parsed.data.id} WHERE study_id = ${id}
      `;
    }

    await prisma.$executeRaw`
      UPDATE rm_study
      SET id = ${parsed.data.id}, phase = ${parsed.data.phase}, status = ${parsed.data.status},
          complexity = ${parsed.data.complexity}, nme_id = ${parsed.data.nmeId}
      WHERE id = ${id}
    `;

    revalidatePath("/admin/rm/studies");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to update RM study:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update study",
    };
  }

  redirect("/admin/rm/studies");
}

export async function deleteRmStudy(id: string): Promise<ActionState> {
  try {
    // Check for associated segments
    const segmentCount = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_study_segment WHERE study_id = ${id}
    `;
    const assignmentCount = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_staff_assignment WHERE study_id = ${id}
    `;

    const totalRelations = Number(segmentCount[0].count) + Number(assignmentCount[0].count);

    if (totalRelations > 0) {
      return {
        success: false,
        error: `Cannot delete study with ${totalRelations} associated record(s). Remove segments and assignments first.`,
      };
    }

    await prisma.$executeRaw`DELETE FROM rm_study WHERE id = ${id}`;

    revalidatePath("/admin/rm/studies");
    revalidatePath("/rm");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete RM study:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete study",
    };
  }
}

export async function getRmStudies() {
  return prisma.$queryRaw<{
    id: string;
    phase: number;
    status: string;
    complexity: string;
    nme_id: string | null;
    nme_code: string | null;
    segment_count: bigint;
    assignment_count: bigint;
  }[]>`
    SELECT
      s.id, s.phase, s.status, s.complexity, s.nme_id,
      n.code as nme_code,
      (SELECT COUNT(*) FROM rm_study_segment WHERE study_id = s.id) as segment_count,
      (SELECT COUNT(*) FROM rm_staff_assignment WHERE study_id = s.id) as assignment_count
    FROM rm_study s
    LEFT JOIN "NME" n ON n.id = s.nme_id
    ORDER BY s.id
  `;
}

export async function getRmStudyById(id: string) {
  const rows = await prisma.$queryRaw<{
    id: string;
    phase: number;
    status: string;
    complexity: string;
    nme_id: string | null;
  }[]>`
    SELECT id, phase, status, complexity, nme_id
    FROM rm_study
    WHERE id = ${id}
  `;
  return rows[0] ?? null;
}
