export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { formatEnumLabel } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Target, TrendingUp, Shield, Users, CheckCircle, AlertTriangle, Eye, XCircle } from "lucide-react";
import { EfficientFrontierChart } from "@/components/portfolio/EfficientFrontierChart";
import type { PortfolioDisplayRow, ChartPoint } from "@/types/portfolio";
import Link from "next/link";

// ── Tier config ──────────────────────────────────────────────────────────────
const TIER_CONFIG = {
  SELECT:  { label: "SELECT",  bg: "bg-emerald-50",  border: "border-emerald-200", text: "text-emerald-700", icon: CheckCircle,    desc: "Frontier + Nash" },
  CONSIDER:{ label: "CONSIDER",bg: "bg-indigo-50",   border: "border-indigo-200",  text: "text-indigo-700",  icon: Eye,            desc: "Frontier or Nash" },
  MONITOR: { label: "MONITOR", bg: "bg-amber-50",    border: "border-amber-200",   text: "text-amber-700",   icon: AlertTriangle,  desc: "Above median" },
  DEFER:   { label: "DEFER",   bg: "bg-red-50",      border: "border-red-100",     text: "text-red-600",     icon: XCircle,        desc: "Below median" },
} as const;

function TierBadge({ tier }: { tier: string }) {
  const cfg = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
  if (!cfg) return <span className="text-gray-400 text-xs">{tier}</span>;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function ScoreBar({ value, max = 1, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

// ── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2 ${color.includes("emerald") ? "bg-emerald-50" : color.includes("indigo") ? "bg-indigo-50" : color.includes("amber") ? "bg-amber-50" : "bg-blue-50"}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function PortfolioOptPage() {
  // Fetch joined data: portfolio_recommendation + v_project_portfolio_base
  const rows = await prisma.$queryRaw<PortfolioDisplayRow[]>`
    SELECT
      pr.project_id,
      pr.return_score,
      pr.risk_score,
      pr.spi,
      pr.cpi,
      pr.is_frontier,
      pr.nash_preferred,
      pr.ps_payoff,
      pr.mm_payoff,
      pr.ra_payoff,
      pr.recommendation,
      pr.combined_score,
      pr.computed_at,
      pb.project_code,
      pb.project_name,
      pb.project_status,
      pb.trial_phase,
      pb.nme_name,
      pb.nme_code,
      pb.nme_id,
      pb.therapeutic_area,
      pb.task_completion_pct,
      pb.bac
    FROM portfolio_recommendation pr
    JOIN v_project_portfolio_base pb ON pb.project_id = pr.project_id
    ORDER BY pr.combined_score DESC
  `;

  const computedAt = rows[0]?.computed_at
    ? new Date(rows[0].computed_at).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  // Tier counts
  const tierCounts = { SELECT: 0, CONSIDER: 0, MONITOR: 0, DEFER: 0 };
  let frontierCount = 0;
  let nashCount = 0;
  for (const r of rows) {
    tierCounts[r.recommendation as keyof typeof tierCounts]++;
    if (r.is_frontier) frontierCount++;
    if (r.nash_preferred) nashCount++;
  }

  // Average combined score
  const avgScore = rows.length
    ? rows.reduce((s, r) => s + Number(r.combined_score), 0) / rows.length
    : 0;

  // Chart data
  const chartPoints: ChartPoint[] = rows.map((r) => ({
    project_id:    r.project_id,
    project_name:  r.project_name,
    x:             Number(r.risk_score),
    y:             Number(r.return_score),
    recommendation: r.recommendation,
    is_frontier:   Boolean(r.is_frontier),
    nash_preferred: Boolean(r.nash_preferred),
    combined_score: Number(r.combined_score),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Optimization</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            EVM performance filtering · Markowitz Efficient Frontier · Nash Equilibrium alignment
            <span className="ml-2 text-gray-400">· Scored: {computedAt}</span>
          </p>
        </div>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs text-indigo-700 space-y-0.5">
          <p><span className="font-semibold">Return:</span> EV / BAC&nbsp;&nbsp;<span className="font-semibold">Risk:</span> 0.5×(1−SPI) + 0.5×(1−CPI)</p>
          <p><span className="font-semibold">Frontier:</span> Pareto-optimal (non-dominated) set</p>
          <p><span className="font-semibold">Nash:</span> All roles ≥ mean payoff on this project</p>
          <p><span className="font-semibold">Score:</span> 40% Return + 40% (1−Risk) + 20% Payoff</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard icon={CheckCircle} label="SELECT tier" value={tierCounts.SELECT}
          sub="Frontier + Nash" color="text-emerald-600" />
        <SummaryCard icon={Eye} label="CONSIDER tier" value={tierCounts.CONSIDER}
          sub="Frontier or Nash" color="text-indigo-600" />
        <SummaryCard icon={TrendingUp} label="On frontier" value={frontierCount}
          sub="Pareto-optimal" color="text-blue-600" />
        <SummaryCard icon={Users} label="Nash preferred" value={nashCount}
          sub="All roles satisfied" color="text-amber-600" />
      </div>

      {/* Efficient Frontier chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Efficient Frontier — Risk vs Return</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Ideal quadrant: top-left (high return, low risk). Larger dots = frontier projects.
            </p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>{rows.length} projects</p>
            <p>Avg score: {(avgScore * 100).toFixed(1)}%</p>
          </div>
        </div>
        <EfficientFrontierChart points={chartPoints} />
      </div>

      {/* Recommendation table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Project Rankings — {rows.length} total
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Sorted by combined score descending</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-left">NME / Phase</th>
                <th className="px-4 py-3 text-left">Tier</th>
                <th className="px-4 py-3 text-center">Frontier</th>
                <th className="px-4 py-3 text-center">Nash</th>
                <th className="px-4 py-3 text-right">Return</th>
                <th className="px-4 py-3 text-right">Risk</th>
                <th className="px-4 py-3 text-right">SPI</th>
                <th className="px-4 py-3 text-right">CPI</th>
                <th className="px-4 py-3 text-left">Payoffs (PS/MM/RA)</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr
                  key={row.project_id}
                  className={`hover:bg-gray-50 transition-colors ${
                    row.recommendation === "SELECT"  ? "bg-emerald-50/30" :
                    row.recommendation === "CONSIDER"? "bg-indigo-50/20" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${row.project_id}`}
                      className="font-medium text-blue-600 hover:underline leading-tight"
                    >
                      {row.project_name}
                    </Link>
                    <span className="block text-xs font-mono text-gray-400">{row.project_code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/nmes/${row.nme_id}`} className="text-xs text-gray-600 hover:text-blue-600 hover:underline">
                      {row.nme_name}
                    </Link>
                    <span className="block text-xs text-gray-400">{formatEnumLabel(row.trial_phase)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <TierBadge tier={row.recommendation} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {Boolean(row.is_frontier) ? (
                      <span className="text-emerald-600 font-bold text-sm">✓</span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {Boolean(row.nash_preferred) ? (
                      <span className="text-indigo-600 font-bold text-sm">✓</span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ScoreBar value={Number(row.return_score)} color="bg-emerald-500" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ScoreBar value={Number(row.risk_score)} color="bg-red-400" />
                  </td>
                  <td className={`px-4 py-3 text-right font-medium text-xs ${
                    Number(row.spi) >= 0.95 ? "text-emerald-600" :
                    Number(row.spi) >= 0.80 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {Number(row.spi).toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium text-xs ${
                    Number(row.cpi) >= 0.95 ? "text-emerald-600" :
                    Number(row.cpi) >= 0.80 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {Number(row.cpi).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 text-xs">
                      <span className="rounded px-1 py-0.5 bg-indigo-50 text-indigo-600 font-mono">
                        {Number(row.ps_payoff).toFixed(0)}%
                      </span>
                      <span className="rounded px-1 py-0.5 bg-teal-50 text-teal-600 font-mono">
                        {Number(row.mm_payoff).toFixed(0)}%
                      </span>
                      <span className="rounded px-1 py-0.5 bg-sky-50 text-sky-600 font-mono">
                        {Number(row.ra_payoff).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800 text-xs">
                    {(Number(row.combined_score) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Framework note */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-500 space-y-2">
        <p className="font-semibold text-gray-600">Framework Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3" /> EVM Performance Filter
            </p>
            <p>CPI and SPI computed from project budget, actual/estimated task hours, and percent complete.
               Risk = 0.5×(1−SPI) + 0.5×(1−CPI), clamped to [0,1].</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Markowitz Efficient Frontier
            </p>
            <p>Pareto-optimal set in (risk, return) space. A project is on the frontier when no other project
               has both higher return AND lower risk simultaneously.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Users className="h-3 w-3" /> Nash Equilibrium Alignment
            </p>
            <p>Payoffs = task completion rate per role (PS, MM, RA) on each project&apos;s trial.
               Nash preferred when all roles ≥ their portfolio-wide mean payoff.</p>
          </div>
        </div>
        <p className="pt-1 border-t border-gray-200">
          To refresh scores, run:{" "}
          <span className="font-mono bg-gray-200 px-1 rounded">
            DATABASE_URL=... python3.11 scripts/compute_portfolio_opt.py
          </span>
        </p>
      </div>
    </div>
  );
}
