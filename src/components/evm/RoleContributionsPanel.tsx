import { cn } from "@/lib/utils";
import { formatEnumLabel } from "@/lib/constants";
import type { RoleSummary } from "@/types/evm";

const ROLE_STYLES: Record<string, { border: string; bg: string; title: string; accent: string }> = {
  PRINCIPAL_SCIENTIST: {
    border: "border-indigo-200",
    bg: "bg-indigo-50",
    title: "text-indigo-700",
    accent: "bg-indigo-500",
  },
  MEDICAL_MONITOR: {
    border: "border-teal-200",
    bg: "bg-teal-50",
    title: "text-teal-700",
    accent: "bg-teal-500",
  },
  RESEARCH_ASSOCIATE: {
    border: "border-sky-200",
    bg: "bg-sky-50",
    title: "text-sky-700",
    accent: "bg-sky-500",
  },
};

function RoleCard({ summary }: { summary: RoleSummary }) {
  const style = ROLE_STYLES[summary.role] ?? {
    border: "border-gray-200",
    bg: "bg-gray-50",
    title: "text-gray-700",
    accent: "bg-gray-500",
  };

  const completionPct = summary.task_completion_pct ?? 0;

  return (
    <div className={cn("rounded-xl border p-5 shadow-sm", style.border, style.bg)}>
      <p className={cn("text-xs font-semibold uppercase tracking-wide", style.title)}>
        {formatEnumLabel(summary.role)}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-2xl font-bold text-gray-900">{summary.total_staff}</p>
          <p className="text-xs text-gray-500">Staff Members</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{summary.total_trials}</p>
          <p className="text-xs text-gray-500">Trials</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{Number(summary.total_fte_effort).toFixed(1)}</p>
          <p className="text-xs text-gray-500">Total FTE Effort</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{summary.total_tasks}</p>
          <p className="text-xs text-gray-500">Total Tasks</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Task Completion</span>
          <span className="font-semibold text-gray-700">{completionPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/60">
          <div
            className={cn("h-full rounded-full", style.accent)}
            style={{ width: `${Math.min(completionPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{summary.completed_tasks} done</span>
          <span>{summary.open_tasks} open · {summary.blocked_tasks} blocked</span>
        </div>
      </div>

      <div className="mt-3 border-t border-white/40 pt-3 flex justify-between text-xs text-gray-500">
        <span>{Number(summary.total_estimated_hours).toFixed(0)}h estimated</span>
        <span>{Number(summary.total_actual_hours).toFixed(0)}h actual</span>
      </div>
    </div>
  );
}

export function RoleContributionsPanel({ summaries }: { summaries: RoleSummary[] }) {
  if (summaries.length === 0) {
    return <p className="p-5 text-sm text-gray-400">No role contribution data available.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {summaries.map((s) => (
        <RoleCard key={s.role} summary={s} />
      ))}
    </div>
  );
}
