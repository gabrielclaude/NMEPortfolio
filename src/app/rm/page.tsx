export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import {
  Users, FlaskConical, CalendarDays, TrendingUp,
} from "lucide-react";
import { FTEDemandChart } from "@/components/rm/FTEDemandChart";
import { AllocationTable } from "@/components/rm/AllocationTable";
import type { StudyAllocation } from "@/components/rm/AllocationTable";
import type { MonthlyRoleDemand, MonthlyDemandChartRow } from "@/types/resource-management";

// ── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({
  icon: Icon, label, value, sub, iconBg, valueColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; sub?: string;
  iconBg: string; valueColor: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${valueColor}`} />
        </div>
      </div>
    </div>
  );
}

// ── FTE Attribute Matrix table ────────────────────────────────────────────────
function FteMatrixTable({ rows }: { rows: { complexity: string; role: string; phase: number; activity: string; fte_per_month: number }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Complexity</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider">Phase</th>
            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Activity</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">FTE/Month</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-1.5">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700">{r.complexity}</span>
              </td>
              <td className="px-3 py-1.5 text-gray-700">{r.role}</td>
              <td className="px-3 py-1.5 text-center text-gray-600">Ph {r.phase}</td>
              <td className="px-3 py-1.5 text-gray-600">{r.activity}</td>
              <td className="px-3 py-1.5 text-right font-semibold text-indigo-700">{r.fte_per_month.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Personnel capacity table ──────────────────────────────────────────────────
function PersonnelTable({ personnel }: {
  personnel: { name: string; total_allocation: number; adjustment: number; assignments: { study_id: string; role: string; pct: number }[] }[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity (FTE)</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study Assignments</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {personnel.map((p) => {
            const usedPct = p.assignments.reduce((s, a) => s + a.pct, 0);
            const capacity = p.total_allocation || 1;
            const util = capacity > 0 ? usedPct / capacity : 0;
            const utilColor = util > 1 ? "text-red-600" : util >= 0.8 ? "text-amber-600" : "text-emerald-600";
            const barColor = util > 1 ? "bg-red-400" : util >= 0.8 ? "bg-amber-400" : "bg-emerald-400";
            return (
              <tr key={p.name} className="hover:bg-gray-50">
                <td className="px-3 py-2.5 font-medium text-gray-900">{p.name}</td>
                <td className="px-3 py-2.5 text-center text-gray-600">{p.total_allocation.toFixed(1)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {p.assignments.length === 0 ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      p.assignments.map((a) => (
                        <span key={`${a.study_id}-${a.role}`}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                          <span className="font-mono font-semibold">{a.study_id}</span>
                          <span className="text-gray-400">{Math.round(a.pct * 100)}%</span>
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-20 h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${barColor}`}
                        style={{ width: `${Math.min(util * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${utilColor}`}>
                      {Math.round(util * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function RMPage() {
  // 1. Monthly FTE demand by role
  const monthlyRaw = await prisma.$queryRaw<MonthlyRoleDemand[]>`
    SELECT month_date, month_label, role, fte_demand::float
    FROM v_rm_monthly_by_role
    ORDER BY month_date, role
  `;

  // 2. Pivot monthly data into chart rows
  const monthMap = new Map<string, MonthlyDemandChartRow>();
  for (const r of monthlyRaw) {
    const key = r.month_date.toISOString().slice(0, 7);
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        month_label: r.month_label,
        month_date: key,
        "Clinical Scientist": 0,
        "Medical Monitor": 0,
        "Clinical RA": 0,
        total: 0,
      });
    }
    const row = monthMap.get(key)!;
    const role = r.role as keyof Pick<MonthlyDemandChartRow, "Clinical Scientist" | "Medical Monitor" | "Clinical RA">;
    if (role in row) {
      (row[role] as number) += Number(r.fte_demand);
      row.total += Number(r.fte_demand);
    }
  }
  const chartData: MonthlyDemandChartRow[] = Array.from(monthMap.values())
    .sort((a, b) => a.month_date.localeCompare(b.month_date));

  // 3. Summary stats
  const studyCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_study`;
  const segCount   = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_study_segment`;
  const personnelCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_personnel`;
  const assignCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_staff_assignment`;

  const peakRow = chartData.reduce((best, d) => d.total > best.total ? d : best, chartData[0] ?? { month_label: "—", total: 0 });
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentFte = monthMap.get(currentMonthKey)?.total ?? 0;

  // 4. All studies with assignments
  const studyRows = await prisma.$queryRaw<{
    study_id: string; phase: number; complexity: string;
    cs_name: string | null; cs_pct: number | null;
    mm_name: string | null; mm_pct: number | null;
    smm_name: string | null; smm_pct: number | null;
    dtl_name: string | null; dtl_pct: number | null;
    has_segments: boolean;
  }[]>`
    SELECT
      s.id AS study_id, s.phase, s.complexity,
      MAX(CASE WHEN sa.role='Clinical Scientist'       THEN p.name END)             AS cs_name,
      MAX(CASE WHEN sa.role='Clinical Scientist'       THEN sa.allocation_pct END)  AS cs_pct,
      MAX(CASE WHEN sa.role='Medical Monitor'          THEN p.name END)             AS mm_name,
      MAX(CASE WHEN sa.role='Medical Monitor'          THEN sa.allocation_pct END)  AS mm_pct,
      MAX(CASE WHEN sa.role='Support Medical Monitor'  THEN p.name END)             AS smm_name,
      MAX(CASE WHEN sa.role='Support Medical Monitor'  THEN sa.allocation_pct END)  AS smm_pct,
      MAX(CASE WHEN sa.role='Development Team Lead'    THEN p.name END)             AS dtl_name,
      MAX(CASE WHEN sa.role='Development Team Lead'    THEN sa.allocation_pct END)  AS dtl_pct,
      EXISTS(SELECT 1 FROM rm_study_segment seg2 WHERE seg2.study_id = s.id)        AS has_segments
    FROM rm_study s
    LEFT JOIN rm_staff_assignment sa ON sa.study_id = s.id
    LEFT JOIN rm_personnel p         ON p.id = sa.personnel_id
    GROUP BY s.id, s.phase, s.complexity
    ORDER BY s.id
  `;

  const studies: StudyAllocation[] = studyRows.map((r) => ({ ...r }));

  // 5. Personnel with assignments
  const personnelRows = await prisma.$queryRaw<{
    name: string; total_allocation: number; adjustment: number;
    assignments: unknown;
  }[]>`
    SELECT
      p.name, p.total_allocation::float, p.adjustment::float,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('study_id', sa.study_id, 'role', sa.role, 'pct', sa.allocation_pct)
          ORDER BY sa.study_id
        ) FILTER (WHERE sa.id IS NOT NULL),
        '[]'::json
      ) AS assignments
    FROM rm_personnel p
    LEFT JOIN rm_staff_assignment sa ON sa.personnel_id = p.id
    GROUP BY p.id, p.name, p.total_allocation, p.adjustment
    ORDER BY p.total_allocation DESC, p.name
  `;

  const personnel = personnelRows.map((p) => ({
    name: p.name,
    total_allocation: Number(p.total_allocation),
    adjustment: Number(p.adjustment),
    assignments: p.assignments as { study_id: string; role: string; pct: number }[],
  }));

  // 6. FTE matrix reference data
  const fteMatrix = await prisma.$queryRaw<{
    complexity: string; role: string; phase: number; activity: string; fte_per_month: number;
  }[]>`
    SELECT complexity, role, phase, activity, fte_per_month::float
    FROM rm_fte_matrix
    ORDER BY complexity, role, phase, activity
  `;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Clinical trial FTE demand planning · Jan 2024 – Dec 2026
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-medium text-teal-700">
          <CalendarDays className="h-3.5 w-3.5" />
          36-month horizon
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={FlaskConical}
          label="Active Studies"
          value={Number(studyCount[0].count)}
          sub={`${Number(segCount[0].count)} planned segments`}
          iconBg="bg-indigo-50"
          valueColor="text-indigo-700"
        />
        <SummaryCard
          icon={Users}
          label="Personnel"
          value={Number(personnelCount[0].count)}
          sub={`${Number(assignCount[0].count)} study assignments`}
          iconBg="bg-emerald-50"
          valueColor="text-emerald-700"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Peak FTE Demand"
          value={peakRow.total.toFixed(2)}
          sub={`Peak in ${peakRow.month_label}`}
          iconBg="bg-amber-50"
          valueColor="text-amber-700"
        />
        <SummaryCard
          icon={CalendarDays}
          label="Current Month FTE"
          value={currentFte > 0 ? currentFte.toFixed(2) : "—"}
          sub="Active FTE demand"
          iconBg="bg-teal-50"
          valueColor="text-teal-700"
        />
      </div>

      {/* Monthly FTE Demand Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Monthly FTE Demand by Role</h2>
            <p className="text-xs text-gray-400 mt-0.5">Stacked FTE across all planned study segments</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {(["Clinical Scientist", "Medical Monitor", "Clinical RA"] as const).map((role) => (
              <div key={role} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm"
                  style={{
                    background: role === "Clinical Scientist" ? "#6366f1"
                      : role === "Medical Monitor" ? "#10b981" : "#f59e0b"
                  }} />
                <span className="text-gray-500">{role}</span>
              </div>
            ))}
          </div>
        </div>
        <FTEDemandChart data={chartData} />
      </div>

      {/* Study Allocation Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Study Staff Allocation</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Role assignments per study — <span className="text-emerald-600 font-medium">Planned</span> indicates FTE schedule available
          </p>
        </div>
        <div className="p-2">
          <AllocationTable studies={studies} />
        </div>
      </div>

      {/* Personnel Capacity */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Personnel Capacity &amp; Utilization</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Total FTE capacity vs. study allocation — bar shows utilization rate
          </p>
        </div>
        <div className="p-5">
          <PersonnelTable personnel={personnel} />
        </div>
      </div>

      {/* FTE Attribute Matrix */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">FTE Attribute Matrix</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Reference FTE multipliers by complexity · role · phase · activity
          </p>
        </div>
        <div className="p-2">
          <FteMatrixTable rows={fteMatrix} />
        </div>
      </div>

      {/* Methodology footer */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 mb-2">Methodology</p>
        <p>Monthly FTE values are prorated by the number of working days each study segment is active within a given month: <strong>FTE = FTE/month × (active days in month / total days in month)</strong>.</p>
        <p>Phases: <strong>SU</strong> = Start Up (CCS to FPI) · <strong>C</strong> = Conduct (FPI to LPLV) · <strong>CO</strong> = Close Out (DBL to CSR)</p>
        <p>Complexity levels: <strong>Low</strong> · <strong>Medium</strong> · <strong>High</strong> · Study types: <strong>FIH</strong> (First-in-Human) · <strong>Follow-on</strong></p>
      </div>
    </div>
  );
}
