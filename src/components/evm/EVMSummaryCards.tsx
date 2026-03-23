import { TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EVMSummaryCardsProps {
  portfolioSPI: number;
  portfolioCPI: number;
  onTrackProjects: number;
  atRiskProjects: number;
  totalProjects: number;
}

function IndexCard({
  label,
  value,
  subtitle,
  description,
}: {
  label: string;
  value: number;
  subtitle: string;
  description: string;
}) {
  const color =
    value > 1.05 ? { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "text-blue-500" } :
    value >= 0.95 ? { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "text-emerald-500" } :
    value >= 0.80 ? { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "text-amber-500" } :
    { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "text-red-500" };

  const Icon = value >= 1.0 ? TrendingUp : TrendingDown;

  return (
    <div className={cn("rounded-xl border p-5 shadow-sm", color.border, color.bg)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-xs font-semibold uppercase tracking-wide", color.text)}>{label}</p>
          <p className={cn("mt-1 text-4xl font-bold", color.text)}>{value.toFixed(2)}</p>
          <p className={cn("mt-1 text-sm font-medium", color.text)}>{subtitle}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        <Icon className={cn("h-6 w-6 opacity-70", color.icon)} />
      </div>
    </div>
  );
}

export function EVMSummaryCards({
  portfolioSPI,
  portfolioCPI,
  onTrackProjects,
  atRiskProjects,
  totalProjects,
}: EVMSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <IndexCard
        label="Portfolio SPI"
        value={portfolioSPI}
        subtitle={portfolioSPI >= 0.95 ? "On Schedule" : portfolioSPI >= 0.80 ? "At Risk" : "Behind Schedule"}
        description="Schedule Performance Index — EV / PV"
      />
      <IndexCard
        label="Portfolio CPI"
        value={portfolioCPI}
        subtitle={portfolioCPI >= 0.95 ? "Under Budget" : portfolioCPI >= 0.80 ? "At Risk" : "Over Budget"}
        description="Cost Performance Index — EV / AC"
      />
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">On-Track Projects</p>
            <p className="mt-1 text-4xl font-bold text-emerald-700">{onTrackProjects}</p>
            <p className="mt-1 text-sm font-medium text-emerald-700">SPI &amp; CPI ≥ 0.95</p>
            <p className="mt-1 text-xs text-gray-500">of {totalProjects} total projects</p>
          </div>
          <CheckCircle className="h-6 w-6 text-emerald-500 opacity-70" />
        </div>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">At-Risk Projects</p>
            <p className="mt-1 text-4xl font-bold text-red-700">{atRiskProjects}</p>
            <p className="mt-1 text-sm font-medium text-red-700">SPI or CPI &lt; 0.80</p>
            <p className="mt-1 text-xs text-gray-500">of {totalProjects} total projects</p>
          </div>
          <AlertTriangle className="h-6 w-6 text-red-400 opacity-70" />
        </div>
      </div>
    </div>
  );
}
