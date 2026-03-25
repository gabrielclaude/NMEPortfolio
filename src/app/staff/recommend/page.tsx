export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatEnumLabel } from "@/lib/constants";
import { ChevronLeft, Brain, Star, Trophy, AlertCircle, Minus } from "lucide-react";

const THERAPEUTIC_AREAS = [
  "ONCOLOGY", "CARDIOVASCULAR", "NEUROLOGY", "IMMUNOLOGY",
  "INFECTIOUS_DISEASE", "METABOLIC", "RESPIRATORY",
  "RARE_DISEASE", "OPHTHALMOLOGY", "DERMATOLOGY",
];

interface PSRecommendationRow {
  staff_id: string;
  therapeutic_area: string;
  fit_label: number;
  high_fit_pct: number;
  medium_fit_pct: number;
  low_fit_pct: number;
  area_trial_count: number;
  rank_within_area: number;
  scored_at: Date;
  first_name: string;
  last_name: string;
  years_experience: number;
  specialization: string | null;
  department: string;
  trial_count: number;
  total_tasks: number;
  done_tasks: number;
  blocked_tasks: number;
  actual_hours: number;
  est_hours: number;
}

function FitBadge({ label }: { label: number }) {
  if (label === 2) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      <Trophy className="h-3 w-3" /> High Fit
    </span>
  );
  if (label === 1) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      <Minus className="h-3 w-3" /> Medium Fit
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
      <AlertCircle className="h-3 w-3" /> Low Fit
    </span>
  );
}

function ConfidenceBar({ high, medium, low }: { high: number; medium: number; low: number }) {
  const highPct = Math.round(high * 100);
  const medPct  = Math.round(medium * 100);
  const lowPct  = Math.round(low * 100);
  return (
    <div className="w-full">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="bg-emerald-500 h-full" style={{ width: `${highPct}%` }} title={`High: ${highPct}%`} />
        <div className="bg-amber-400 h-full"  style={{ width: `${medPct}%`  }} title={`Medium: ${medPct}%`} />
        <div className="bg-red-400 h-full"    style={{ width: `${lowPct}%`  }} title={`Low: ${lowPct}%`} />
      </div>
      <div className="mt-0.5 flex justify-between text-xs text-gray-400">
        <span>H:{highPct}%</span>
        <span>M:{medPct}%</span>
        <span>L:{lowPct}%</span>
      </div>
    </div>
  );
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">#{rank}</span>;
}

export default async function PSRecommendPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const { area } = await searchParams;
  const selectedArea = THERAPEUTIC_AREAS.includes(area ?? "") ? area! : THERAPEUTIC_AREAS[0];

  const rows = await prisma.$queryRaw<PSRecommendationRow[]>`
    SELECT
      pr.staff_id,
      pr.therapeutic_area,
      pr.fit_label,
      pr.high_fit_pct,
      pr.medium_fit_pct,
      pr.low_fit_pct,
      pr.area_trial_count,
      pr.rank_within_area,
      pr.scored_at,
      s."firstName"        AS first_name,
      s."lastName"         AS last_name,
      s."yearsExperience"  AS years_experience,
      s.specialization,
      s.department,
      COALESCE(stats.trial_count,   0) AS trial_count,
      COALESCE(stats.total_tasks,   0) AS total_tasks,
      COALESCE(stats.done_tasks,    0) AS done_tasks,
      COALESCE(stats.blocked_tasks, 0) AS blocked_tasks,
      COALESCE(stats.actual_hours,  0) AS actual_hours,
      COALESCE(stats.est_hours,     0) AS est_hours
    FROM ps_recommendation pr
    JOIN "Staff" s ON s.id = pr.staff_id
    LEFT JOIN (
      SELECT
        tk."assigneeId"                                              AS staff_id,
        COUNT(DISTINCT tsa."trialId")                                AS trial_count,
        COUNT(tk.id)                                                 AS total_tasks,
        COUNT(tk.id) FILTER (WHERE tk.status = 'DONE')               AS done_tasks,
        COUNT(tk.id) FILTER (WHERE tk.status = 'BLOCKED')            AS blocked_tasks,
        COALESCE(SUM(tk."actualHours"),    0)                        AS actual_hours,
        COALESCE(SUM(tk."estimatedHours"), 0)                        AS est_hours
      FROM "Task" tk
      LEFT JOIN "Milestone" m ON m.id = tk."milestoneId"
      LEFT JOIN "Project" p ON p.id = m."projectId"
      LEFT JOIN "TrialStaffAssignment" tsa ON tsa."staffId" = tk."assigneeId"
      WHERE tk."assigneeId" IS NOT NULL
      GROUP BY tk."assigneeId"
    ) stats ON stats.staff_id = pr.staff_id
    WHERE pr.therapeutic_area = ${selectedArea}
    ORDER BY pr.rank_within_area
  `;

  const scoredAt = rows[0]?.scored_at
    ? new Date(rows[0].scored_at).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Link href="/staff" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft className="h-4 w-4" /> Staff
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">PS Candidate Recommender</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Multi-layer perceptron ranking of Principal Scientists by predicted team fit.
            Scored: {scoredAt}
          </p>
        </div>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs text-indigo-700">
          <span className="font-semibold">Model:</span> Dense 128 → Dropout 0.2 → Dense 64 → Softmax(3)<br />
          <span className="font-semibold">Features:</span> 8 performance metrics · <span className="font-semibold">Labels:</span> Low / Medium / High Fit
        </div>
      </div>

      {/* Therapeutic Area Tabs */}
      <div className="flex flex-wrap gap-2">
        {THERAPEUTIC_AREAS.map((ta) => (
          <Link
            key={ta}
            href={`/staff/recommend?area=${ta}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              ta === selectedArea
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {formatEnumLabel(ta)}
          </Link>
        ))}
      </div>

      {/* Area heading */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-800">
          {formatEnumLabel(selectedArea)}
        </h2>
        <span className="text-xs text-gray-400">— {rows.length} candidates ranked</span>
      </div>

      {/* Candidate cards */}
      <div className="space-y-3">
        {rows.map((row) => {
          const completionPct = Number(row.total_tasks) > 0
            ? Math.round((Number(row.done_tasks) / Number(row.total_tasks)) * 100)
            : 0;
          const blockedPct = Number(row.total_tasks) > 0
            ? Math.round((Number(row.blocked_tasks) / Number(row.total_tasks)) * 100)
            : 0;
          const hoursAccuracy = Number(row.est_hours) > 0
            ? (Number(row.actual_hours) / Number(row.est_hours)).toFixed(2)
            : "—";

          return (
            <div
              key={row.staff_id}
              className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                row.fit_label === 2 ? "border-emerald-200" :
                row.fit_label === 0 ? "border-red-100" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 flex items-center justify-center w-10 pt-1">
                  <RankMedal rank={Number(row.rank_within_area)} />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <Link
                        href={`/staff/${row.staff_id}`}
                        className="text-base font-semibold text-blue-600 hover:underline"
                      >
                        {row.first_name} {row.last_name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {row.department}
                        {row.specialization ? ` · ${row.specialization}` : ""}
                        {" · "}{row.years_experience}y experience
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <FitBadge label={Number(row.fit_label)} />
                      {Number(row.area_trial_count) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          <Star className="h-3 w-3" />
                          {row.area_trial_count} {formatEnumLabel(selectedArea)} trial{Number(row.area_trial_count) > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-3 max-w-xs">
                    <p className="text-xs text-gray-400 mb-1">Model confidence</p>
                    <ConfidenceBar
                      high={Number(row.high_fit_pct)}
                      medium={Number(row.medium_fit_pct)}
                      low={Number(row.low_fit_pct)}
                    />
                  </div>

                  {/* Performance metrics */}
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4 text-xs">
                    <div>
                      <span className="text-gray-400">Task completion</span>
                      <p className={`font-semibold mt-0.5 ${
                        completionPct >= 65 ? "text-emerald-600" :
                        completionPct >= 40 ? "text-amber-600" : "text-red-600"
                      }`}>{completionPct}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Blocked tasks</span>
                      <p className={`font-semibold mt-0.5 ${
                        blockedPct === 0 ? "text-emerald-600" :
                        blockedPct <= 15 ? "text-amber-600" : "text-red-600"
                      }`}>{blockedPct}%</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Total trials</span>
                      <p className="font-semibold mt-0.5 text-gray-700">{Number(row.trial_count)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Hours accuracy</span>
                      <p className="font-semibold mt-0.5 text-gray-700">{hoursAccuracy}×</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model note */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-600">About this model</p>
        <p>
          Adapted from <span className="font-mono">Scientist_Selection_06.ipynb</span>.
          The MLP was trained on historical performance features from all active staff (26 members, 520 augmented samples).
          Training labels are derived from actual task completion and blocked-task rates.
          Rankings within each therapeutic area use the model's High-Fit probability as the primary key,
          with prior area trial experience as a tiebreaker.
        </p>
        <p>
          To refresh scores, run:{" "}
          <span className="font-mono bg-gray-200 px-1 rounded">
            DATABASE_URL=... python3.11 scripts/train_and_score_ps.py
          </span>
        </p>
      </div>
    </div>
  );
}
