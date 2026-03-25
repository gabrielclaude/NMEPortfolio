import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TRIAL_PHASE_COLORS, TRIAL_STATUS_COLORS, formatEnumLabel } from "@/lib/constants";

interface Trial {
  id: string;
  nctNumber: string;
  phase: string;
  status: string;
  targetEnrollment: number;
  actualEnrollment: number;
  sites: number;
  nme: { name: string; therapeuticArea: string };
}

export function ActiveTrialsTable({ trials }: { trials: Trial[] }) {
  if (trials.length === 0) {
    return <p className="p-5 text-sm text-gray-400">No active trials found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-500">NCT Number</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">NME</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Therapeutic Area</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Phase</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Enrollment</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Sites</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {trials.map((trial) => {
            const pct = trial.targetEnrollment > 0
              ? Math.round((trial.actualEnrollment / trial.targetEnrollment) * 100)
              : 0;
            return (
              <tr key={trial.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/trials/${trial.id}`}
                    className="font-mono text-xs text-blue-600 hover:underline"
                  >
                    {trial.nctNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{trial.nme.name}</td>
                <td className="px-4 py-3 text-gray-500">{formatEnumLabel(trial.nme.therapeuticArea)}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={trial.phase} colorMap={TRIAL_PHASE_COLORS} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={trial.status} colorMap={TRIAL_STATUS_COLORS} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{trial.sites}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
