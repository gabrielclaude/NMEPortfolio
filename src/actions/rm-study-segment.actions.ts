"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RmStudySegmentFormSchema } from "@/lib/validations/rm-study-segment";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function calculateDays(startDate: Date, endDate: Date): number {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export async function createRmStudySegment(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmStudySegmentFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate segment (same study, activity, role)
    const existing = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_study_segment
      WHERE study_id = ${parsed.data.studyId}
        AND activity = ${parsed.data.activity}
        AND role = ${parsed.data.role}
    `;
    if (Number(existing[0].count) > 0) {
      return {
        success: false,
        error: "A segment with this activity and role already exists for this study",
        fieldErrors: { activity: ["This combination already exists"] },
      };
    }

    const days = calculateDays(parsed.data.startDate, parsed.data.endDate);

    await prisma.$executeRaw`
      INSERT INTO rm_study_segment (study_id, activity, start_date, end_date, complexity, role, phase, days, fte_per_month)
      VALUES (
        ${parsed.data.studyId},
        ${parsed.data.activity},
        ${parsed.data.startDate},
        ${parsed.data.endDate},
        ${parsed.data.complexity},
        ${parsed.data.role},
        ${parsed.data.phase},
        ${days},
        ${parsed.data.ftePerMonth}
      )
    `;

    revalidatePath("/admin/rm/segments");
    revalidatePath("/admin/rm/studies");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to create RM study segment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create segment",
    };
  }

  redirect("/admin/rm/segments");
}

export async function updateRmStudySegment(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = RmStudySegmentFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate segment (excluding current record)
    const existing = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_study_segment
      WHERE study_id = ${parsed.data.studyId}
        AND activity = ${parsed.data.activity}
        AND role = ${parsed.data.role}
        AND id != ${id}
    `;
    if (Number(existing[0].count) > 0) {
      return {
        success: false,
        error: "A segment with this activity and role already exists for this study",
        fieldErrors: { activity: ["This combination already exists"] },
      };
    }

    const days = calculateDays(parsed.data.startDate, parsed.data.endDate);

    await prisma.$executeRaw`
      UPDATE rm_study_segment
      SET study_id = ${parsed.data.studyId},
          activity = ${parsed.data.activity},
          start_date = ${parsed.data.startDate},
          end_date = ${parsed.data.endDate},
          complexity = ${parsed.data.complexity},
          role = ${parsed.data.role},
          phase = ${parsed.data.phase},
          days = ${days},
          fte_per_month = ${parsed.data.ftePerMonth}
      WHERE id = ${id}
    `;

    revalidatePath("/admin/rm/segments");
    revalidatePath("/admin/rm/studies");
    revalidatePath("/rm");
  } catch (error) {
    console.error("Failed to update RM study segment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update segment",
    };
  }

  redirect("/admin/rm/segments");
}

export async function deleteRmStudySegment(id: number): Promise<ActionState> {
  try {
    // Check for associated monthly FTE records
    const monthlyCount = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM rm_monthly_fte WHERE segment_id = ${id}
    `;

    // Delete associated monthly FTE records first
    if (Number(monthlyCount[0].count) > 0) {
      await prisma.$executeRaw`DELETE FROM rm_monthly_fte WHERE segment_id = ${id}`;
    }

    await prisma.$executeRaw`DELETE FROM rm_study_segment WHERE id = ${id}`;

    revalidatePath("/admin/rm/segments");
    revalidatePath("/admin/rm/studies");
    revalidatePath("/rm");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete RM study segment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete segment",
    };
  }
}

export async function getRmStudySegments() {
  return prisma.$queryRaw<{
    id: number;
    study_id: string;
    activity: string;
    start_date: Date;
    end_date: Date;
    complexity: string;
    role: string;
    phase: number;
    days: number;
    fte_per_month: number;
    study_status: string;
    monthly_fte_count: bigint;
  }[]>`
    SELECT
      seg.id,
      seg.study_id,
      seg.activity,
      seg.start_date,
      seg.end_date,
      seg.complexity,
      seg.role,
      seg.phase,
      seg.days,
      seg.fte_per_month::float as fte_per_month,
      s.status as study_status,
      (SELECT COUNT(*) FROM rm_monthly_fte WHERE segment_id = seg.id) as monthly_fte_count
    FROM rm_study_segment seg
    JOIN rm_study s ON s.id = seg.study_id
    ORDER BY seg.study_id, seg.activity, seg.role
  `;
}

export async function getRmStudySegmentById(id: number) {
  const rows = await prisma.$queryRaw<{
    id: number;
    study_id: string;
    activity: string;
    start_date: Date;
    end_date: Date;
    complexity: string;
    role: string;
    phase: number;
    days: number;
    fte_per_month: number;
  }[]>`
    SELECT id, study_id, activity, start_date, end_date, complexity, role, phase, days, fte_per_month::float as fte_per_month
    FROM rm_study_segment
    WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

export async function getRmStudiesForSegmentSelect() {
  return prisma.$queryRaw<{ id: string; phase: number; status: string; complexity: string }[]>`
    SELECT id, phase, status, complexity FROM rm_study ORDER BY id
  `;
}
