"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NMEFormSchema } from "@/lib/validations/nme";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createNME(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = NMEFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate code
    const existing = await prisma.nME.findUnique({
      where: { code: parsed.data.code },
    });

    if (existing) {
      return {
        success: false,
        error: "An NME with this code already exists",
        fieldErrors: { code: ["This code is already in use"] },
      };
    }

    await prisma.nME.create({
      data: parsed.data,
    });

    revalidatePath("/admin/nmes");
    revalidatePath("/nmes");
  } catch (error) {
    console.error("Failed to create NME:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create NME",
    };
  }

  redirect("/admin/nmes");
}

export async function updateNME(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsed = NMEFormSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check for duplicate code (excluding current record)
    const existing = await prisma.nME.findFirst({
      where: {
        code: parsed.data.code,
        NOT: { id },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "An NME with this code already exists",
        fieldErrors: { code: ["This code is already in use"] },
      };
    }

    await prisma.nME.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/admin/nmes");
    revalidatePath("/nmes");
    revalidatePath(`/nmes/${id}`);
  } catch (error) {
    console.error("Failed to update NME:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update NME",
    };
  }

  redirect("/admin/nmes");
}

export async function deleteNME(id: string): Promise<ActionState> {
  try {
    // Check if NME has associated trials
    const nmeWithTrials = await prisma.nME.findUnique({
      where: { id },
      include: { _count: { select: { trials: true } } },
    });

    if (!nmeWithTrials) {
      return {
        success: false,
        error: "NME not found",
      };
    }

    if (nmeWithTrials._count.trials > 0) {
      return {
        success: false,
        error: `Cannot delete NME with ${nmeWithTrials._count.trials} associated trial(s). Delete the trials first.`,
      };
    }

    await prisma.nME.delete({
      where: { id },
    });

    revalidatePath("/admin/nmes");
    revalidatePath("/nmes");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete NME:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete NME",
    };
  }
}

export async function bulkCreateNMEs(
  data: Parameters<typeof NMEFormSchema.parse>[0][]
): Promise<{ success: boolean; created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;

  for (let i = 0; i < data.length; i++) {
    try {
      const parsed = NMEFormSchema.safeParse(data[i]);
      if (!parsed.success) {
        errors.push(`Row ${i + 1}: ${parsed.error.issues.map((e) => e.message).join(", ")}`);
        continue;
      }

      // Check for duplicate
      const existing = await prisma.nME.findUnique({
        where: { code: parsed.data.code },
      });

      if (existing) {
        errors.push(`Row ${i + 1}: Code "${parsed.data.code}" already exists`);
        continue;
      }

      await prisma.nME.create({ data: parsed.data });
      created++;
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  revalidatePath("/admin/nmes");
  revalidatePath("/nmes");

  return {
    success: errors.length === 0,
    created,
    errors,
  };
}
