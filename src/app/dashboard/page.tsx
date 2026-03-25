export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { PhaseDonutChart } from "@/components/dashboard/PhaseDonutChart";
import { TherapeuticAreaChart } from "@/components/dashboard/TherapeuticAreaChart";
import { ActiveTrialsTable } from "@/components/dashboard/ActiveTrialsTable";
import { EVMSummaryCards } from "@/components/evm/EVMSummaryCards";
import { RoleContributionsPanel } from "@/components/evm/RoleContributionsPanel";
import { computeEVMDerived } from "@/types/evm";
import type { NMEEVMRow, ProjectEVMRow, RoleContributionRow, RoleSummary } from "@/types/evm";
import { FlaskConical, BeakerIcon, Users, FolderOpen } from "lucide-react";

export default async function DashboardPage() {
  const [
    totalNMEs,
    activeNMEs,
    totalTrials,
    recruitingTrials,
    totalStaff,
    activeStaff,
    totalProjects,
    atRiskProjects,
    trialsByPhase,
    nmesByArea,
    activeTrials,
    nmeRows,
    projectRows,
    roleRows,
  ] = await Promise.all([
    prisma.nME.count(),
    prisma.nME.count({ where: { status: { in: ["PHASE_1","PHASE_2","PHASE_3","PHASE_4"] } } }),
    prisma.clinicalTrial.count(),
    prisma.clinicalTrial.count({ where: { status: { in: ["RECRUITING","ACTIVE"] } } }),
    prisma.staff.count(),
    prisma.staff.count({ where: { isActive: true } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "AT_RISK" } }),
    prisma.clinicalTrial.groupBy({ by: ["phase"], _count: { id: true } }),
    prisma.nME.groupBy({ by: ["therapeuticArea"], _count: { id: true } }),
    prisma.clinicalTrial.findMany({
      where: { status: { in: ["RECRUITING","ACTIVE","ENROLLMENT_COMPLETE"] } },
      include: { nme: { select: { name: true, therapeuticArea: true } } },
      orderBy: { plannedEndDate: "asc" },
      take: 15,
    }),
    prisma.$queryRaw<NMEEVMRow[]>`SELECT * FROM v_nme_evm`,
    prisma.$queryRaw<ProjectEVMRow[]>`SELECT * FROM v_project_evm`,
    prisma.$queryRaw<RoleContributionRow[]>`SELECT * FROM v_role_contributions`,
  ]);

  const phaseData = trialsByPhase.map((p) => ({
    phase: p.phase,
    count: p._count.id,
  }));

  const areaData = nmesByArea.map((a) => ({
    area: a.therapeuticArea,
    count: a._count.id,
  }));

  // Portfolio EVM aggregates
  const totalPV = nmeRows.reduce((s, r) => s + Number(r.total_pv), 0);
  const totalEV = nmeRows.reduce((s, r) => s + Number(r.total_ev), 0);
  const totalAC = nmeRows.reduce((s, r) => s + Number(r.total_ac), 0);
  const portfolioSPI = totalPV > 0 ? totalEV / totalPV : 1;
  const portfolioCPI = totalAC > 0 ? totalEV / totalAC : 1;

  const projectRowsFull = projectRows.map((row) => ({
    ...row,
    ...computeEVMDerived({
      bac: Number(row.bac), pv: Number(row.pv), ev: Number(row.ev), ac: Number(row.ac),
    }),
  }));
  const onTrackProjects = projectRowsFull.filter((r) => r.spi >= 0.95 && r.cpi >= 0.95).length;
  const evmAtRiskProjects = projectRowsFull.filter((r) => r.spi < 0.80 || r.cpi < 0.80).length;

  // Role summaries aggregation
  const roleSummaryMap = new Map<string, RoleSummary>();
  for (const row of roleRows) {
    const role = row.role;
    const existing = roleSummaryMap.get(role);
    if (existing) {
      existing.total_staff += Number(row.staff_count);
      existing.total_trials += 1;
      existing.total_fte_effort += Number(row.total_fte_effort);
      existing.total_tasks += Number(row.task_count);
      existing.completed_tasks += Number(row.completed_tasks);
      existing.open_tasks += Number(row.open_tasks);
      existing.blocked_tasks += Number(row.blocked_tasks);
      existing.total_estimated_hours += Number(row.estimated_hours);
      existing.total_actual_hours += Number(row.actual_hours);
    } else {
      roleSummaryMap.set(role, {
        role,
        total_staff: Number(row.staff_count),
        total_trials: 1,
        total_fte_effort: Number(row.total_fte_effort),
        avg_fte_effort: Number(row.avg_fte_effort),
        total_tasks: Number(row.task_count),
        completed_tasks: Number(row.completed_tasks),
        open_tasks: Number(row.open_tasks),
        blocked_tasks: Number(row.blocked_tasks),
        total_estimated_hours: Number(row.estimated_hours),
        total_actual_hours: Number(row.actual_hours),
        task_completion_pct: 0,
      });
    }
  }
  const roleSummaries: RoleSummary[] = Array.from(roleSummaryMap.values()).map((s) => ({
    ...s,
    task_completion_pct: s.total_tasks > 0
      ? Math.round((s.completed_tasks / s.total_tasks) * 1000) / 10
      : 0,
  }));
  const roleOrder = ["PRINCIPAL_SCIENTIST", "MEDICAL_MONITOR", "RESEARCH_ASSOCIATE"];
  roleSummaries.sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          As of {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="NME Portfolio"
          value={totalNMEs}
          subtitle={`${activeNMEs} in active phases`}
          icon={FlaskConical}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <SummaryCard
          title="Clinical Trials"
          value={totalTrials}
          subtitle={`${recruitingTrials} recruiting / active`}
          icon={BeakerIcon}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <SummaryCard
          title="Staff Members"
          value={totalStaff}
          subtitle={`${activeStaff} active`}
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <SummaryCard
          title="Projects"
          value={totalProjects}
          subtitle={`${atRiskProjects} at risk`}
          icon={FolderOpen}
          iconColor={atRiskProjects > 0 ? "text-red-600" : "text-amber-600"}
          iconBg={atRiskProjects > 0 ? "bg-red-50" : "bg-amber-50"}
        />
      </div>

      {/* EVM Summary */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Earned Value Performance</h2>
        <EVMSummaryCards
          portfolioSPI={portfolioSPI}
          portfolioCPI={portfolioCPI}
          onTrackProjects={onTrackProjects}
          atRiskProjects={evmAtRiskProjects}
          totalProjects={projectRowsFull.length}
        />
      </div>

      {/* Role Contributions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Role Contributions</h2>
        <RoleContributionsPanel summaries={roleSummaries} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Trials by Phase</h2>
          <PhaseDonutChart data={phaseData} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">NMEs by Therapeutic Area</h2>
          <TherapeuticAreaChart data={areaData} />
        </div>
      </div>

      {/* Active Trials Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700">Active Clinical Trials</h2>
          <p className="text-xs text-gray-400 mt-0.5">Recruiting, active, and enrollment-complete trials</p>
        </div>
        <ActiveTrialsTable trials={activeTrials} />
      </div>
    </div>
  );
}
