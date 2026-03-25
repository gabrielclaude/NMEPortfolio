export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { EVMSummaryCards } from "@/components/evm/EVMSummaryCards";
import { NMEEVMTable } from "@/components/evm/NMEEVMTable";
import { ProjectEVMTable } from "@/components/evm/ProjectEVMTable";
import { RoleContributionsPanel } from "@/components/evm/RoleContributionsPanel";
import { computeEVMDerived } from "@/types/evm";
import type { NMEEVMRow, ProjectEVMRow, RoleContributionRow, RoleSummary } from "@/types/evm";

export default async function EVMPage() {
  const [nmeRows, projectRows, roleRows] = await Promise.all([
    prisma.$queryRaw<NMEEVMRow[]>`SELECT * FROM v_nme_evm`,
    prisma.$queryRaw<ProjectEVMRow[]>`SELECT * FROM v_project_evm ORDER BY bac DESC`,
    prisma.$queryRaw<RoleContributionRow[]>`SELECT * FROM v_role_contributions`,
  ]);

  // Compute derived EVM metrics for each project row
  const projectRowsFull = projectRows.map((row) => ({
    ...row,
    ...computeEVMDerived({
      bac: Number(row.bac),
      pv: Number(row.pv),
      ev: Number(row.ev),
      ac: Number(row.ac),
    }),
  }));

  // Aggregate portfolio SPI/CPI from NME rows (weighted by BAC)
  const totalPV = nmeRows.reduce((s, r) => s + Number(r.total_pv), 0);
  const totalEV = nmeRows.reduce((s, r) => s + Number(r.total_ev), 0);
  const totalAC = nmeRows.reduce((s, r) => s + Number(r.total_ac), 0);
  const portfolioSPI = totalPV > 0 ? totalEV / totalPV : 1;
  const portfolioCPI = totalAC > 0 ? totalEV / totalAC : 1;

  // On-track / at-risk counts from project rows
  const onTrackProjects = projectRowsFull.filter((r) => r.spi >= 0.95 && r.cpi >= 0.95).length;
  const atRiskProjects = projectRowsFull.filter((r) => r.spi < 0.80 || r.cpi < 0.80).length;

  // Aggregate role summaries
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

  // Compute final task_completion_pct per role
  const roleSummaries: RoleSummary[] = Array.from(roleSummaryMap.values()).map((s) => ({
    ...s,
    task_completion_pct:
      s.total_tasks > 0
        ? Math.round((s.completed_tasks / s.total_tasks) * 1000) / 10
        : 0,
  }));

  const roleOrder = ["PRINCIPAL_SCIENTIST", "MEDICAL_MONITOR", "RESEARCH_ASSOCIATE"];
  roleSummaries.sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role));

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earned Value Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Portfolio-wide EVM metrics as of{" "}
          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Portfolio Summary Cards */}
      <EVMSummaryCards
        portfolioSPI={portfolioSPI}
        portfolioCPI={portfolioCPI}
        onTrackProjects={onTrackProjects}
        atRiskProjects={atRiskProjects}
        totalProjects={projectRowsFull.length}
      />

      {/* Role Contributions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Role Contributions</h2>
          <p className="text-xs text-gray-400 mt-0.5">FTE effort and task metrics by key clinical role</p>
        </div>
        <RoleContributionsPanel summaries={roleSummaries} />
      </div>

      {/* NME EVM Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700">NME Portfolio EVM</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Aggregated BAC, PV, EV, AC and performance indices per NME
          </p>
        </div>
        <NMEEVMTable rows={nmeRows} />
      </div>

      {/* Project EVM Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-700">Project EVM Detail</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Per-project earned value metrics: schedule variance, cost variance, SPI, CPI, EAC, and TCPI
          </p>
        </div>
        <ProjectEVMTable rows={projectRowsFull} />
      </div>
    </div>
  );
}
