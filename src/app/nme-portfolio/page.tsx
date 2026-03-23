export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { formatEnumLabel, NME_STATUS_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EVMGauge } from "@/components/evm/EVMGauge";
import { NMEFrontierChart } from "@/components/portfolio/NMEFrontierChart";
import { PortfolioWeightChart } from "@/components/portfolio/PortfolioWeightChart";
import { BarChart2, Star, Shield, TrendingUp, Layers } from "lucide-react";
import Link from "next/link";
import type { NMEPortfolioOptRow, NMEChartPoint, FrontierLinePoint } from "@/types/nme-portfolio";

// ── Tier badge ────────────────────────────────────────────────────────────────
const TIER_STYLE = {
  CORE:      "bg-emerald-50 border-emerald-200 text-emerald-700",
  GROWTH:    "bg-indigo-50 border-indigo-200 text-indigo-700",
  SATELLITE: "bg-amber-50 border-amber-200 text-amber-700",
  EXCLUDE:   "bg-red-50 border-red-100 text-red-600",
} as const;

function TierBadge({ tier }: { tier: string }) {
  const cls = TIER_STYLE[tier as keyof typeof TIER_STYLE] ?? "bg-gray-50 border-gray-200 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {tier}
    </span>
  );
}

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

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function NMEPortfolioPage() {
  // Joined NME opt data
  const rows = await prisma.$queryRaw<NMEPortfolioOptRow[]>`
    SELECT
      npo.id,
      npo.nme_id,
      npo.return_score,
      npo.risk_score,
      npo.sharpe_ratio,
      npo.is_frontier,
      npo.optimal_weight,
      npo.min_var_weight,
      npo.tier,
      npo.ev_ratio,
      npo.evm_risk,
      npo.phase_risk,
      npo.computed_at,
      n.name               AS nme_name,
      n.code               AS nme_code,
      n."therapeuticArea"::TEXT AS therapeutic_area,
      n.status::TEXT       AS nme_status,
      n."moleculeType"::TEXT    AS molecule_type,
      ne.total_bac,
      ne.portfolio_spi,
      ne.portfolio_cpi,
      ne.task_completion_pct
    FROM nme_portfolio_opt npo
    JOIN "NME" n ON n.id = npo.nme_id
    JOIN v_nme_evm ne ON ne.nme_id = npo.nme_id
    ORDER BY npo.sharpe_ratio DESC
  `;

  // Frontier curve
  const curveRows = await prisma.$queryRaw<FrontierLinePoint[]>`
    SELECT portfolio_risk AS x, portfolio_return AS y,
           is_min_variance, is_max_sharpe
    FROM nme_frontier_curve
    ORDER BY portfolio_risk
  `;

  const computedAt = rows[0]?.computed_at
    ? new Date(rows[0].computed_at).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  // Summary stats
  const topSharpe   = rows.length ? Number(rows[0].sharpe_ratio).toFixed(2) : "—";
  const coreCount   = rows.filter((r) => r.tier === "CORE").length;
  const frontierN   = rows.filter((r) => Boolean(r.is_frontier)).length;
  const totalBac    = rows.reduce((s, r) => s + Number(r.total_bac), 0);

  // Min-variance portfolio risk (first frontier curve point)
  const mvpRisk = curveRows.length
    ? (Math.min(...curveRows.map((p) => Number(p.x))) * 100).toFixed(1) + "%"
    : "—";

  // Chart data
  const nmePoints: NMEChartPoint[] = rows.map((r) => ({
    nme_id:          r.nme_id,
    nme_name:        r.nme_name,
    nme_code:        r.nme_code,
    therapeutic_area: r.therapeutic_area,
    tier:            r.tier,
    x:               Number(r.risk_score),
    y:               Number(r.return_score),
    sharpe_ratio:    Number(r.sharpe_ratio),
    optimal_weight:  Number(r.optimal_weight),
    min_var_weight:  Number(r.min_var_weight),
    is_frontier:     Boolean(r.is_frontier),
    total_bac:       Number(r.total_bac),
  }));

  const frontierLine: FrontierLinePoint[] = curveRows.map((p) => ({
    x: Number(p.x), y: Number(p.y),
    is_min_variance: Boolean(p.is_min_variance),
    is_max_sharpe:   Boolean(p.is_max_sharpe),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">NME Efficient Frontier</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Markowitz mean-variance optimisation across {rows.length} NME compounds
            <span className="ml-2 text-gray-400">· Computed: {computedAt}</span>
          </p>
        </div>
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs text-indigo-700 space-y-0.5">
          <p><span className="font-semibold">Return:</span> 0.5×EV/BAC + 0.3×Task% + 0.2×Phase Maturity</p>
          <p><span className="font-semibold">Risk:</span> 0.5×EVM Risk + 0.3×Phase Risk + 0.2×Status Risk</p>
          <p><span className="font-semibold">Covariance:</span> ρ=0.55 (same TA) | ρ=0.15 (different TA)</p>
          <p><span className="font-semibold">Frontier:</span> scipy SLSQP · 50,000 Monte Carlo simulations</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard icon={Star}      label="Top Sharpe Ratio"  value={topSharpe}
          sub={rows[0]?.nme_code ?? ""}  iconBg="bg-emerald-50"  valueColor="text-emerald-600" />
        <SummaryCard icon={Layers}    label="CORE NMEs"         value={coreCount}
          sub="Top-quartile Sharpe"      iconBg="bg-indigo-50"   valueColor="text-indigo-600" />
        <SummaryCard icon={TrendingUp} label="Portfolio Min-Risk" value={mvpRisk}
          sub="Min-variance frontier"    iconBg="bg-blue-50"     valueColor="text-blue-600" />
        <SummaryCard icon={Shield}    label="Total Pipeline BAC" value={formatCurrency(totalBac)}
          sub={`${rows.length} NMEs`}    iconBg="bg-amber-50"    valueColor="text-amber-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Frontier chart — 2/3 width */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800">
            Efficient Frontier — Risk vs Return
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 mb-3">
            Dashed curve = scipy SLSQP frontier · Dots sized by max-Sharpe allocation weight ·
            Ideal region: top-left
          </p>
          <NMEFrontierChart nmePoints={nmePoints} frontierLine={frontierLine} />
        </div>

        {/* Allocation charts — 1/3 width */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Portfolio Allocations</h2>
            <p className="text-xs text-gray-400 mb-4">Optimal weights from Markowitz optimisation</p>
            <PortfolioWeightChart nmes={rows} weightKey="optimal_weight" title="Max-Sharpe Portfolio" />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <PortfolioWeightChart nmes={rows} weightKey="min_var_weight" title="Min-Variance Portfolio" />
          </div>
        </div>
      </div>

      {/* NME rankings table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">
            NME Rankings — {rows.length} compounds · sorted by Sharpe ratio
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">NME</th>
                <th className="px-4 py-3 text-left">TA / Status</th>
                <th className="px-4 py-3 text-left">Tier</th>
                <th className="px-4 py-3 text-right">Return</th>
                <th className="px-4 py-3 text-right">Risk</th>
                <th className="px-4 py-3 text-right">Sharpe</th>
                <th className="px-4 py-3 text-center">SPI</th>
                <th className="px-4 py-3 text-center">CPI</th>
                <th className="px-4 py-3 text-right">Max-Sharpe Wt</th>
                <th className="px-4 py-3 text-right">Min-Var Wt</th>
                <th className="px-4 py-3 text-right">BAC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => {
                const tier = row.tier;
                const isCore = tier === "CORE";
                return (
                  <tr
                    key={row.nme_id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isCore ? "bg-emerald-50/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/nmes/${row.nme_id}`}
                        className="font-semibold text-blue-600 hover:underline text-sm leading-tight"
                      >
                        {row.nme_name}
                      </Link>
                      <span className="block text-xs font-mono text-gray-400">{row.nme_code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block text-xs text-gray-600">
                        {formatEnumLabel(row.therapeutic_area)}
                      </span>
                      <StatusBadge value={row.nme_status} colorMap={NME_STATUS_COLORS} />
                    </td>
                    <td className="px-4 py-3">
                      <TierBadge tier={row.tier} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-semibold text-xs text-emerald-600">
                          {(Number(row.return_score) * 100).toFixed(1)}%
                        </span>
                        <div className="h-1 w-14 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(Number(row.return_score) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-semibold text-xs text-red-500">
                          {(Number(row.risk_score) * 100).toFixed(1)}%
                        </span>
                        <div className="h-1 w-14 overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full bg-red-400 rounded-full"
                            style={{ width: `${Math.min(Number(row.risk_score) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-xs text-gray-800">
                      {Number(row.sharpe_ratio).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EVMGauge value={row.portfolio_spi != null ? Number(row.portfolio_spi) : null} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <EVMGauge value={row.portfolio_cpi != null ? Number(row.portfolio_cpi) : null} />
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-indigo-600">
                      {Number(row.optimal_weight) > 0.001
                        ? `${(Number(row.optimal_weight) * 100).toFixed(1)}%`
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium text-blue-600">
                      {Number(row.min_var_weight) > 0.001
                        ? `${(Number(row.min_var_weight) * 100).toFixed(1)}%`
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {formatCurrency(Number(row.total_bac))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology footer */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-xs text-gray-500 space-y-2">
        <p className="font-semibold text-gray-600">Markowitz Portfolio Theory — Methodology</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Shield className="h-3 w-3" /> Risk &amp; Return Scoring
            </p>
            <p>Each NME scored on a composite return (EV delivery + task completion + phase maturity)
               and composite risk (EVM performance + development phase + regulatory status).</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Covariance Structure
            </p>
            <p>NMEs in the same therapeutic area share ρ=0.55 correlation; cross-area pairs use ρ=0.15.
               This models diversification benefit from spreading across therapeutic areas.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
              <BarChart2 className="h-3 w-3" /> Frontier &amp; Optimisation
            </p>
            <p>50,000 Monte Carlo simulations map the feasible portfolio space.
               The frontier curve uses scipy SLSQP (quadratic programming) for exact
               minimum-variance portfolios at each return level.</p>
          </div>
        </div>
        <p className="pt-1 border-t border-gray-200">
          To refresh scores, run:{" "}
          <span className="font-mono bg-gray-200 px-1 rounded">
            DATABASE_URL=... python3.11 scripts/compute_nme_portfolio_opt.py
          </span>
        </p>
      </div>
    </div>
  );
}
