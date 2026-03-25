export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  TRIAL_PHASE_COLORS, TRIAL_STATUS_COLORS, PROJECT_STATUS_COLORS,
  STAFF_ROLE_COLORS, formatEnumLabel,
} from "@/lib/constants";
import { formatDate, formatCurrency, formatEnrollment } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

export default async function TrialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trial = await prisma.clinicalTrial.findUnique({
    where: { id },
    include: {
      nme: true,
      leadStaff: true,
      projects: {
        include: { _count: { select: { milestones: true } } },
        orderBy: { plannedStart: "asc" },
      },
      staffAssignments: {
        include: { staff: true },
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!trial) notFound();

  const enrollPct = trial.targetEnrollment > 0
    ? Math.round((trial.actualEnrollment / trial.targetEnrollment) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <Link href="/trials" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft className="h-4 w-4" />
        Clinical Trials
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-sm font-semibold text-gray-500">{trial.nctNumber}</span>
          <h1 className="text-xl font-bold text-gray-900">{trial.title}</h1>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <StatusBadge value={trial.phase} colorMap={TRIAL_PHASE_COLORS} />
          <StatusBadge value={trial.status} colorMap={TRIAL_STATUS_COLORS} />
          <span className="text-sm text-gray-500">
            NME:{" "}
            <Link href={`/nmes/${trial.nme.id}`} className="text-blue-600 hover:underline font-medium">
              {trial.nme.name} ({trial.nme.code})
            </Link>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trial Metadata */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Trial Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Study Design</dt>
                <dd className="font-medium text-gray-800 text-right max-w-[160px]">{trial.studyDesign ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Primary Endpoint</dt>
                <dd className="font-medium text-gray-800 text-right max-w-[160px]">{trial.primaryEndpoint ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Sites</dt>
                <dd className="font-medium text-gray-800">{trial.sites}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Countries</dt>
                <dd className="font-medium text-gray-800">{trial.countries.join(", ")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Budget</dt>
                <dd className="font-medium text-gray-800">{formatCurrency(trial.budget ? Number(trial.budget) : null)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Planned Start</dt>
                <dd className="font-medium text-gray-800">{formatDate(trial.plannedStartDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Planned End</dt>
                <dd className="font-medium text-gray-800">{formatDate(trial.plannedEndDate)}</dd>
              </div>
              {trial.leadStaff && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Lead PI</dt>
                  <dd className="font-medium text-gray-800">
                    <Link href={`/staff/${trial.leadStaff.id}`} className="text-blue-600 hover:underline">
                      {trial.leadStaff.firstName} {trial.leadStaff.lastName}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Enrollment */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Enrollment</h2>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{enrollPct}%</p>
              <p className="text-sm text-gray-500 mt-1">{formatEnrollment(trial.actualEnrollment, trial.targetEnrollment)}</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(enrollPct, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Projects + Staff */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-700">Projects ({trial.projects.length})</h2>
            </div>
            {trial.projects.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No projects yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Progress</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Milestones</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trial.projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/projects/${project.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                          {project.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{project.name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge value={project.status} colorMap={PROJECT_STATUS_COLORS} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${project.percentComplete}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{project.percentComplete}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{project._count.milestones}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(project.plannedEnd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Staff Assignments */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-700">Assigned Staff ({trial.staffAssignments.length})</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Dept</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Effort</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trial.staffAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/staff/${a.staff.id}`} className="font-medium text-blue-600 hover:underline">
                        {a.staff.firstName} {a.staff.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={a.role} colorMap={STAFF_ROLE_COLORS} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.staff.department}</td>
                    <td className="px-4 py-3 text-gray-500">{Math.round(a.effort * 100)}% FTE</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(a.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
