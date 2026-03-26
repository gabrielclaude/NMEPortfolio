export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Upload, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { NME_STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { formatEnumLabel } from "@/lib/constants";
import { DeleteNMEButton } from "./DeleteNMEButton";

export default async function AdminNMEsPage() {
  const nmes = await prisma.nME.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: { select: { trials: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage NMEs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create, edit, and delete New Molecular Entities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/nmes/upload">
              <Upload className="h-4 w-4 mr-1" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/nmes/new">
              <Plus className="h-4 w-4 mr-1" />
              Add NME
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Therapeutic Area</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Trials</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Discovery Date</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {nmes.map((nme) => (
              <tr key={nme.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold text-indigo-600">{nme.code}</span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{nme.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {formatEnumLabel(nme.therapeuticArea)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    value={nme.status}
                    colorMap={NME_STATUS_COLORS}
                  />
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {nme._count.trials}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(nme.discoveryDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/admin/nmes/${nme.id}/edit`}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Link>
                    </Button>
                    <DeleteNMEButton
                      id={nme.id}
                      name={nme.name}
                      trialCount={nme._count.trials}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {nmes.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No NMEs found. Create your first NME to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
