"use client";

import { cn } from "@/lib/utils";

interface StudyAllocation {
  study_id: string;
  phase: number;
  complexity: string;
  cs_name: string | null;
  cs_pct: number | null;
  mm_name: string | null;
  mm_pct: number | null;
  smm_name: string | null;
  smm_pct: number | null;
  dtl_name: string | null;
  dtl_pct: number | null;
  has_segments: boolean;
}

function PctBadge({ pct }: { pct: number | null }) {
  if (pct === null || pct === 0)
    return <span className="text-gray-300 text-xs">—</span>;
  const color =
    pct >= 0.8 ? "bg-red-50 text-red-700"
    : pct >= 0.5 ? "bg-amber-50 text-amber-700"
    : "bg-green-50 text-green-700";
  return (
    <span className={cn("inline-block rounded px-1.5 py-0.5 text-xs font-semibold", color)}>
      {Math.round(pct * 100)}%
    </span>
  );
}

function RoleCell({ name, pct }: { name: string | null; pct: number | null }) {
  if (!name) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-800 truncate max-w-[110px]">{name}</span>
      <PctBadge pct={pct} />
    </div>
  );
}

export function AllocationTable({ studies }: { studies: StudyAllocation[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Study</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Phase</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinical Scientist</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Monitor</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supp. Med. Mon.</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dev. Team Lead</th>
            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Schedule</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {studies.map((s) => (
            <tr key={s.study_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2.5">
                <span className="font-mono font-semibold text-gray-900">{s.study_id}</span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  Ph {s.phase}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <RoleCell name={s.cs_name} pct={s.cs_pct} />
              </td>
              <td className="px-3 py-2.5">
                <RoleCell name={s.mm_name} pct={s.mm_pct} />
              </td>
              <td className="px-3 py-2.5">
                <RoleCell name={s.smm_name} pct={s.smm_pct} />
              </td>
              <td className="px-3 py-2.5">
                <RoleCell name={s.dtl_name} pct={s.dtl_pct} />
              </td>
              <td className="px-3 py-2.5 text-center">
                {s.has_segments ? (
                  <span className="inline-block rounded px-1.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">
                    Planned
                  </span>
                ) : (
                  <span className="inline-block rounded px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500">
                    TBD
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { StudyAllocation };
