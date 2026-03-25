export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import {
  FlaskConical, CalendarDays, TrendingUp, Users,
} from "lucide-react";
import { FTEDemandChart } from "@/components/rm/FTEDemandChart";
import { NMESelector } from "@/components/rm/NMESelector";
import type { NMEMonthlyRoleDemand, MonthlyDemandChartRow, NMEOption } from "@/types/resource-management";

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

// ── Studies table for the selected NME ───────────────────────────────────────
function NMEStudiesTable({ studies }: {
  studies: {
    study_id: string;
    phase: number;
    complexity: string;
    cs_name: string | null;
    cs_pct: number | null;
    mm_name: string | null;
    mm_pct: number | null;
  }[];
}) {
  if (studies.length === 0) {
    return <p className="text-sm text-gray-400 p-4">No studies linked to this NME.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-500">Study ID</th>
            <th className="px-4 py-3 text-center font-medium text-gray-500">Phase</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Complexity</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Clinical Scientist</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Medical Monitor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {studies.map((s) => (
            <tr key={s.study_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono font-semibold text-gray-900">{s.study_id}</td>
              <td className="px-4 py-3 text-center text-gray-600">Ph {s.phase}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                  s.complexity === 'High' ? 'bg-red-50 text-red-700' :
                  s.complexity === 'Medium' ? 'bg-amber-50 text-amber-700' :
                  'bg-emerald-50 text-emerald-700'
                }`}>
                  {s.complexity}
                </span>
              </td>
              <td className="px-4 py-3">
                {s.cs_name ? (
                  <span className="flex items-center gap-2">
                    <span className="text-gray-700">{s.cs_name}</span>
                    {s.cs_pct != null && (
                      <span className="text-xs text-gray-400">{Math.round(s.cs_pct * 100)}%</span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {s.mm_name ? (
                  <span className="flex items-center gap-2">
                    <span className="text-gray-700">{s.mm_name}</span>
                    {s.mm_pct != null && (
                      <span className="text-xs text-gray-400">{Math.round(s.mm_pct * 100)}%</span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function NMERMPage({
  searchParams,
}: {
  searchParams: Promise<{ nme?: string }>;
}) {
  const { nme: selectedNmeId } = await searchParams;

  // 1. Fetch all NMEs for the selector
  const nmeRows = await prisma.$queryRaw<NMEOption[]>`
    SELECT id, code, name
    FROM "NME"
    ORDER BY code
  `;

  // If no NME selected, show empty state
  if (!selectedNmeId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resource Management by NME</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              View FTE demand and resource allocation per NME
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <NMESelector nmes={nmeRows} selectedId={selectedNmeId} />
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <FlaskConical className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Select an NME to view resources</h3>
          <p className="text-sm text-gray-400">
            Choose an NME from the dropdown above to see FTE demand and staff allocations.
          </p>
        </div>
      </div>
    );
  }

  // 2. Fetch selected NME details
  const selectedNme = nmeRows.find((n) => n.id === selectedNmeId);
  if (!selectedNme) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">NME not found.</p>
        </div>
      </div>
    );
  }

  // 3. Fetch monthly FTE demand for this NME
  const monthlyRaw = await prisma.$queryRaw<NMEMonthlyRoleDemand[]>`
    SELECT month_date, month_label, nme_id, role, fte_demand::float
    FROM v_rm_monthly_by_nme
    WHERE nme_id = ${selectedNmeId}
    ORDER BY month_date, role
  `;

  // 4. Pivot monthly data into chart rows
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

  // 5. Summary stats for this NME
  const studyCount = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM rm_study WHERE nme_id = ${selectedNmeId}
  `;
  const segmentCount = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count
    FROM rm_study_segment seg
    JOIN rm_study s ON s.id = seg.study_id
    WHERE s.nme_id = ${selectedNmeId}
  `;

  const peakRow = chartData.reduce((best, d) => d.total > best.total ? d : best, chartData[0] ?? { month_label: "—", total: 0 });
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentFte = monthMap.get(currentMonthKey)?.total ?? 0;
  const totalFte = chartData.reduce((sum, d) => sum + d.total, 0);

  // 6. Studies with staff assignments for this NME
  const studyRows = await prisma.$queryRaw<{
    study_id: string; phase: number; complexity: string;
    cs_name: string | null; cs_pct: number | null;
    mm_name: string | null; mm_pct: number | null;
  }[]>`
    SELECT
      s.id AS study_id, s.phase, s.complexity,
      MAX(CASE WHEN sa.role='Clinical Scientist' THEN p.name END) AS cs_name,
      MAX(CASE WHEN sa.role='Clinical Scientist' THEN sa.allocation_pct END) AS cs_pct,
      MAX(CASE WHEN sa.role='Medical Monitor' THEN p.name END) AS mm_name,
      MAX(CASE WHEN sa.role='Medical Monitor' THEN sa.allocation_pct END) AS mm_pct
    FROM rm_study s
    LEFT JOIN rm_staff_assignment sa ON sa.study_id = s.id
    LEFT JOIN rm_personnel p ON p.id = sa.personnel_id
    WHERE s.nme_id = ${selectedNmeId}
    GROUP BY s.id, s.phase, s.complexity
    ORDER BY s.id
  `;

  const hasData = chartData.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Management by NME</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            FTE demand planning for{" "}
            <span className="font-mono text-indigo-600">{selectedNme.code}</span>{" "}
            — {selectedNme.name}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-700">
          <FlaskConical className="h-3.5 w-3.5" />
          {Number(studyCount[0].count)} studies
        </span>
      </div>

      {/* NME Selector */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <NMESelector nmes={nmeRows} selectedId={selectedNmeId} />
      </div>

      {hasData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              icon={FlaskConical}
              label="Studies"
              value={Number(studyCount[0].count)}
              sub={`${Number(segmentCount[0].count)} planned segments`}
              iconBg="bg-indigo-50"
              valueColor="text-indigo-700"
            />
            <SummaryCard
              icon={Users}
              label="Total FTE Demand"
              value={totalFte.toFixed(2)}
              sub="Cumulative FTE-months"
              iconBg="bg-emerald-50"
              valueColor="text-emerald-700"
            />
            <SummaryCard
              icon={TrendingUp}
              label="Peak FTE"
              value={peakRow.total.toFixed(2)}
              sub={`Peak in ${peakRow.month_label}`}
              iconBg="bg-amber-50"
              valueColor="text-amber-700"
            />
            <SummaryCard
              icon={CalendarDays}
              label="Current Month"
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
                <p className="text-xs text-gray-400 mt-0.5">
                  Stacked FTE for {selectedNme.code} study segments
                </p>
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

          {/* Studies Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Studies & Staff Assignments</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Studies linked to {selectedNme.code} with their resource allocations
              </p>
            </div>
            <NMEStudiesTable studies={studyRows} />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No resource data available</h3>
          <p className="text-sm text-gray-400">
            This NME doesn't have any RM studies or FTE segments linked yet.
          </p>
        </div>
      )}
    </div>
  );
}
