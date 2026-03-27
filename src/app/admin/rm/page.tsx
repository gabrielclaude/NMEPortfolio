export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  CalendarDays,
  Layers,
  Users,
  UserCheck,
  Grid3X3,
  ArrowRight,
} from "lucide-react";

async function getRmStats() {
  const [studyCount, segmentCount, personnelCount, assignmentCount, matrixCount] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_study`,
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_study_segment`,
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_personnel`,
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_staff_assignment`,
    prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_fte_matrix`,
  ]);

  return {
    studyCount: Number(studyCount[0]?.count ?? 0),
    segmentCount: Number(segmentCount[0]?.count ?? 0),
    personnelCount: Number(personnelCount[0]?.count ?? 0),
    assignmentCount: Number(assignmentCount[0]?.count ?? 0),
    matrixCount: Number(matrixCount[0]?.count ?? 0),
  };
}

function StatCard({
  icon: Icon,
  label,
  count,
  href,
  iconBg,
  iconColor,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  href: string;
  iconBg: string;
  iconColor: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all h-full">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">{count}</p>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm text-amber-600 group-hover:text-amber-700">
          <span>Manage</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default async function AdminRmPage() {
  const stats = await getRmStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resource Management Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage RM studies, segments, personnel, assignments, and FTE matrix
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon={CalendarDays}
          label="Studies"
          count={stats.studyCount}
          href="/admin/rm/studies"
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          description="Active RM studies"
        />
        <StatCard
          icon={Layers}
          label="Segments"
          count={stats.segmentCount}
          href="/admin/rm/segments"
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          description="Study phase segments"
        />
        <StatCard
          icon={Users}
          label="Personnel"
          count={stats.personnelCount}
          href="/admin/rm/personnel"
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
          description="Team members"
        />
        <StatCard
          icon={UserCheck}
          label="Assignments"
          count={stats.assignmentCount}
          href="/admin/rm/assignments"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          description="Staff-study assignments"
        />
        <StatCard
          icon={Grid3X3}
          label="FTE Matrix"
          count={stats.matrixCount}
          href="/admin/rm/fte-matrix"
          iconBg="bg-slate-50"
          iconColor="text-slate-600"
          description="Reference FTE values"
        />
      </div>

      {/* Quick Links */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Link
            href="/admin/rm/studies/new"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <CalendarDays className="h-4 w-4" />
            Add Study
          </Link>
          <Link
            href="/admin/rm/segments/new"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <Layers className="h-4 w-4" />
            Add Segment
          </Link>
          <Link
            href="/admin/rm/personnel/new"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            Add Personnel
          </Link>
          <Link
            href="/admin/rm/assignments/new"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <UserCheck className="h-4 w-4" />
            Add Assignment
          </Link>
          <Link
            href="/admin/rm/fte-matrix/new"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <Grid3X3 className="h-4 w-4" />
            Add FTE Entry
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 mb-2">Resource Management Overview</p>
        <p><strong>Studies:</strong> Clinical trial studies tracked for resource planning</p>
        <p><strong>Segments:</strong> Time-bound phases within studies (Start Up, Conduct, Close Out)</p>
        <p><strong>Personnel:</strong> Team members with FTE capacity for allocation</p>
        <p><strong>Assignments:</strong> Personnel assigned to studies with specific roles</p>
        <p><strong>FTE Matrix:</strong> Reference values for FTE by complexity, role, phase, activity</p>
      </div>
    </div>
  );
}
