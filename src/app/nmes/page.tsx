export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { NME_STATUS_COLORS, formatEnumLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { FlaskConical } from "lucide-react";

export default async function NMEsPage() {
  const nmes = await prisma.nME.findMany({
    include: {
      _count: { select: { trials: true } },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NME Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">{nmes.length} New Molecular Entities</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Therapeutic Area</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Molecule Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Target Indication</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trials</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Discovery Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nmes.map((nme) => (
                <tr key={nme.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-600">{nme.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/nmes/${nme.id}`} className="flex items-center gap-1.5 font-medium text-blue-600 hover:underline">
                      <FlaskConical className="h-3.5 w-3.5 text-gray-400" />
                      {nme.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatEnumLabel(nme.therapeuticArea)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatEnumLabel(nme.moleculeType)}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{nme.targetIndication}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={nme.status} colorMap={NME_STATUS_COLORS} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                      {nme._count.trials}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(nme.discoveryDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
