"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type BulkUploadResult = {
  success: boolean;
  created: number;
  failed: number;
  errors: { row: number; message: string }[];
};

// Staff bulk upload
export async function bulkCreateStaff(
  data: Record<string, unknown>[]
): Promise<BulkUploadResult> {
  const errors: { row: number; message: string }[] = [];
  let created = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      await prisma.staff.create({
        data: {
          employeeId: String(row.employeeId),
          firstName: String(row.firstName),
          lastName: String(row.lastName),
          email: String(row.email),
          role: String(row.role) as any,
          department: String(row.department),
          specialization: row.specialization ? String(row.specialization) : null,
          yearsExperience: Number(row.yearsExperience) || 0,
          isActive: row.isActive !== false,
          hireDate: new Date(String(row.hireDate)),
        },
      });
      created++;
    } catch (error) {
      errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : "Failed to create record",
      });
    }
  }

  revalidatePath("/admin/staff");
  revalidatePath("/staff");

  return {
    success: errors.length === 0,
    created,
    failed: errors.length,
    errors,
  };
}

// Trial bulk upload
export async function bulkCreateTrials(
  data: Record<string, unknown>[]
): Promise<BulkUploadResult> {
  const errors: { row: number; message: string }[] = [];
  let created = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      await prisma.clinicalTrial.create({
        data: {
          nctNumber: String(row.nctNumber),
          title: String(row.title),
          phase: String(row.phase) as any,
          status: String(row.status) as any,
          nmeId: String(row.nmeId),
          leadStaffId: row.leadStaffId ? String(row.leadStaffId) : null,
          sponsorProtocolId: row.sponsorProtocolId ? String(row.sponsorProtocolId) : null,
          primaryEndpoint: row.primaryEndpoint ? String(row.primaryEndpoint) : null,
          studyDesign: row.studyDesign ? String(row.studyDesign) : null,
          targetEnrollment: Number(row.targetEnrollment) || 0,
          actualEnrollment: Number(row.actualEnrollment) || 0,
          plannedStartDate: new Date(String(row.plannedStartDate)),
          plannedEndDate: new Date(String(row.plannedEndDate)),
          actualStartDate: row.actualStartDate ? new Date(String(row.actualStartDate)) : null,
          actualEndDate: row.actualEndDate ? new Date(String(row.actualEndDate)) : null,
          sites: Number(row.sites) || 0,
          budget: row.budget ? Number(row.budget) : null,
          notes: row.notes ? String(row.notes) : null,
        },
      });
      created++;
    } catch (error) {
      errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : "Failed to create record",
      });
    }
  }

  revalidatePath("/admin/trials");
  revalidatePath("/trials");

  return {
    success: errors.length === 0,
    created,
    failed: errors.length,
    errors,
  };
}

// Project bulk upload
export async function bulkCreateProjects(
  data: Record<string, unknown>[]
): Promise<BulkUploadResult> {
  const errors: { row: number; message: string }[] = [];
  let created = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      await prisma.project.create({
        data: {
          code: String(row.code),
          name: String(row.name),
          description: row.description ? String(row.description) : null,
          status: String(row.status) as any,
          priority: String(row.priority) as any,
          trialId: String(row.trialId),
          plannedStart: new Date(String(row.plannedStart)),
          plannedEnd: new Date(String(row.plannedEnd)),
          actualStart: row.actualStart ? new Date(String(row.actualStart)) : null,
          actualEnd: row.actualEnd ? new Date(String(row.actualEnd)) : null,
          budget: row.budget ? Number(row.budget) : null,
          percentComplete: Number(row.percentComplete) || 0,
        },
      });
      created++;
    } catch (error) {
      errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : "Failed to create record",
      });
    }
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projects");

  return {
    success: errors.length === 0,
    created,
    failed: errors.length,
    errors,
  };
}

// Milestone bulk upload
export async function bulkCreateMilestones(
  data: Record<string, unknown>[]
): Promise<BulkUploadResult> {
  const errors: { row: number; message: string }[] = [];
  let created = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      await prisma.milestone.create({
        data: {
          name: String(row.name),
          description: row.description ? String(row.description) : null,
          status: String(row.status) as any,
          projectId: String(row.projectId),
          dueDate: new Date(String(row.dueDate)),
          completedDate: row.completedDate ? new Date(String(row.completedDate)) : null,
          isCriticalPath: row.isCriticalPath === true || row.isCriticalPath === "true",
          sortOrder: Number(row.sortOrder) || 0,
        },
      });
      created++;
    } catch (error) {
      errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : "Failed to create record",
      });
    }
  }

  revalidatePath("/admin/milestones");

  return {
    success: errors.length === 0,
    created,
    failed: errors.length,
    errors,
  };
}

// Task bulk upload
export async function bulkCreateTasks(
  data: Record<string, unknown>[]
): Promise<BulkUploadResult> {
  const errors: { row: number; message: string }[] = [];
  let created = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      await prisma.task.create({
        data: {
          title: String(row.title),
          description: row.description ? String(row.description) : null,
          status: String(row.status) as any,
          priority: String(row.priority) as any,
          milestoneId: String(row.milestoneId),
          assigneeId: row.assigneeId ? String(row.assigneeId) : null,
          estimatedHours: row.estimatedHours ? Number(row.estimatedHours) : null,
          actualHours: row.actualHours ? Number(row.actualHours) : null,
          dueDate: row.dueDate ? new Date(String(row.dueDate)) : null,
          completedAt: row.completedAt ? new Date(String(row.completedAt)) : null,
        },
      });
      created++;
    } catch (error) {
      errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : "Failed to create record",
      });
    }
  }

  revalidatePath("/admin/tasks");

  return {
    success: errors.length === 0,
    created,
    failed: errors.length,
    errors,
  };
}

// NME bulk upload
export async function bulkCreateNMEs(
  data: Record<string, unknown>[]
): Promise<BulkUploadResult> {
  const errors: { row: number; message: string }[] = [];
  let created = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    try {
      await prisma.nME.create({
        data: {
          code: String(row.code),
          name: String(row.name),
          genericName: row.genericName ? String(row.genericName) : null,
          therapeuticArea: String(row.therapeuticArea) as any,
          moleculeType: String(row.moleculeType) as any,
          status: String(row.status) as any,
          targetIndication: String(row.targetIndication),
          mechanismOfAction: row.mechanismOfAction ? String(row.mechanismOfAction) : null,
          originatorCompany: row.originatorCompany ? String(row.originatorCompany) : null,
          patentExpiry: row.patentExpiry ? new Date(String(row.patentExpiry)) : null,
          indFilingDate: row.indFilingDate ? new Date(String(row.indFilingDate)) : null,
          discoveryDate: new Date(String(row.discoveryDate)),
          notes: row.notes ? String(row.notes) : null,
        },
      });
      created++;
    } catch (error) {
      errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : "Failed to create record",
      });
    }
  }

  revalidatePath("/admin/nmes");
  revalidatePath("/nmes");

  return {
    success: errors.length === 0,
    created,
    failed: errors.length,
    errors,
  };
}
