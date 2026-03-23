import { cn } from "@/lib/utils";
import { formatEnumLabel } from "@/lib/constants";

interface StatusBadgeProps {
  value: string;
  colorMap: Record<string, string>;
  className?: string;
  label?: string;
}

export function StatusBadge({ value, colorMap, className, label }: StatusBadgeProps) {
  const colorClass = colorMap[value] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {label ?? formatEnumLabel(value)}
    </span>
  );
}
