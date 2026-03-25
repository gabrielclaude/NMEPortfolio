-- CreateEnum
CREATE TYPE "TherapeuticArea" AS ENUM ('ONCOLOGY', 'CARDIOVASCULAR', 'NEUROLOGY', 'IMMUNOLOGY', 'INFECTIOUS_DISEASE', 'METABOLIC', 'RESPIRATORY', 'RARE_DISEASE', 'OPHTHALMOLOGY', 'DERMATOLOGY');

-- CreateEnum
CREATE TYPE "MoleculeType" AS ENUM ('SMALL_MOLECULE', 'BIOLOGIC', 'ANTIBODY', 'PEPTIDE', 'OLIGONUCLEOTIDE', 'GENE_THERAPY', 'CELL_THERAPY');

-- CreateEnum
CREATE TYPE "NMEStatus" AS ENUM ('PRECLINICAL', 'IND_FILED', 'PHASE_1', 'PHASE_2', 'PHASE_3', 'PHASE_4', 'NDA_FILED', 'APPROVED', 'DISCONTINUED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "TrialPhase" AS ENUM ('PHASE_1', 'PHASE_1B', 'PHASE_2', 'PHASE_2B', 'PHASE_3', 'PHASE_3B', 'PHASE_4', 'EXPANDED_ACCESS');

-- CreateEnum
CREATE TYPE "TrialStatus" AS ENUM ('PLANNING', 'RECRUITING', 'ACTIVE', 'ENROLLMENT_COMPLETE', 'COMPLETED', 'SUSPENDED', 'TERMINATED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('PRINCIPAL_SCIENTIST', 'MEDICAL_MONITOR', 'RESEARCH_ASSOCIATE', 'CLINICAL_OPERATIONS_MANAGER', 'DATA_MANAGER', 'BIOSTATISTICIAN', 'REGULATORY_AFFAIRS', 'PROJECT_MANAGER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'AT_RISK');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "NME" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "therapeuticArea" "TherapeuticArea" NOT NULL,
    "moleculeType" "MoleculeType" NOT NULL,
    "status" "NMEStatus" NOT NULL,
    "targetIndication" TEXT NOT NULL,
    "mechanismOfAction" TEXT,
    "originatorCompany" TEXT,
    "patentExpiry" TIMESTAMP(3),
    "indFilingDate" TIMESTAMP(3),
    "discoveryDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NME_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalTrial" (
    "id" TEXT NOT NULL,
    "nctNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "phase" "TrialPhase" NOT NULL,
    "status" "TrialStatus" NOT NULL,
    "sponsorProtocolId" TEXT,
    "primaryEndpoint" TEXT,
    "studyDesign" TEXT,
    "targetEnrollment" INTEGER NOT NULL,
    "actualEnrollment" INTEGER NOT NULL DEFAULT 0,
    "plannedStartDate" TIMESTAMP(3) NOT NULL,
    "plannedEndDate" TIMESTAMP(3) NOT NULL,
    "actualStartDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "sites" INTEGER NOT NULL DEFAULT 1,
    "countries" TEXT[],
    "budget" DECIMAL(14,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nmeId" TEXT NOT NULL,
    "leadStaffId" TEXT,

    CONSTRAINT "ClinicalTrial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "department" TEXT NOT NULL,
    "specialization" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialStaffAssignment" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "effort" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrialStaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL,
    "priority" "TaskPriority" NOT NULL,
    "plannedStart" TIMESTAMP(3) NOT NULL,
    "plannedEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "budget" DECIMAL(12,2),
    "percentComplete" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trialId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "MilestoneStatus" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "isCriticalPath" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilestoneAssignment" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MilestoneAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL,
    "priority" "TaskPriority" NOT NULL,
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "assigneeId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NME_code_key" ON "NME"("code");

-- CreateIndex
CREATE INDEX "NME_therapeuticArea_idx" ON "NME"("therapeuticArea");

-- CreateIndex
CREATE INDEX "NME_status_idx" ON "NME"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalTrial_nctNumber_key" ON "ClinicalTrial"("nctNumber");

-- CreateIndex
CREATE INDEX "ClinicalTrial_nmeId_idx" ON "ClinicalTrial"("nmeId");

-- CreateIndex
CREATE INDEX "ClinicalTrial_status_idx" ON "ClinicalTrial"("status");

-- CreateIndex
CREATE INDEX "ClinicalTrial_phase_idx" ON "ClinicalTrial"("phase");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_employeeId_key" ON "Staff"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_role_idx" ON "Staff"("role");

-- CreateIndex
CREATE INDEX "Staff_isActive_idx" ON "Staff"("isActive");

-- CreateIndex
CREATE INDEX "TrialStaffAssignment_trialId_idx" ON "TrialStaffAssignment"("trialId");

-- CreateIndex
CREATE INDEX "TrialStaffAssignment_staffId_idx" ON "TrialStaffAssignment"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "TrialStaffAssignment_trialId_staffId_key" ON "TrialStaffAssignment"("trialId", "staffId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE INDEX "Project_trialId_idx" ON "Project"("trialId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Milestone_projectId_idx" ON "Milestone"("projectId");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MilestoneAssignment_milestoneId_staffId_key" ON "MilestoneAssignment"("milestoneId", "staffId");

-- CreateIndex
CREATE INDEX "Task_milestoneId_idx" ON "Task"("milestoneId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- AddForeignKey
ALTER TABLE "ClinicalTrial" ADD CONSTRAINT "ClinicalTrial_nmeId_fkey" FOREIGN KEY ("nmeId") REFERENCES "NME"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalTrial" ADD CONSTRAINT "ClinicalTrial_leadStaffId_fkey" FOREIGN KEY ("leadStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialStaffAssignment" ADD CONSTRAINT "TrialStaffAssignment_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "ClinicalTrial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialStaffAssignment" ADD CONSTRAINT "TrialStaffAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "ClinicalTrial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneAssignment" ADD CONSTRAINT "MilestoneAssignment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneAssignment" ADD CONSTRAINT "MilestoneAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
