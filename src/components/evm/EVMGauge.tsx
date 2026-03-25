import { cn } from "@/lib/utils";

interface EVMGaugeProps {
  value: number | null | undefined;
  label?: string;
  className?: string;
}

function getColor(value: number): string {
  if (value > 1.05) return "bg-blue-50 text-blue-700 ring-blue-200";
  if (value >= 0.95) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (value >= 0.80) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-red-700 ring-red-200";
}

function getStatus(value: number): string {
  if (value > 1.05) return "Ahead";
  if (value >= 0.95) return "On Track";
  if (value >= 0.80) return "At Risk";
  return "Critical";
}

export function EVMGauge({ value, label, className }: EVMGaugeProps) {
  if (value === null || value === undefined || isNaN(value)) {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-gray-50 text-gray-400 ring-gray-200", className)}>
        {label && <span className="font-normal text-gray-400">{label}:</span>}
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset",
        getColor(value),
        className
      )}
      title={getStatus(value)}
    >
      {label && <span className="font-normal opacity-70">{label}:</span>}
      {value.toFixed(2)}
    </span>
  );
}

export function EVMStatusDot({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined || isNaN(value)) {
    return <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />;
  }
  const color =
    value > 1.05 ? "bg-blue-500" :
    value >= 0.95 ? "bg-emerald-500" :
    value >= 0.80 ? "bg-amber-500" :
    "bg-red-500";
  return <span className={cn("inline-block h-2 w-2 rounded-full", color)} />;
}
