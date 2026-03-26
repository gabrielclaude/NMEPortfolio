export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FlaskConical,
  BeakerIcon,
  Users,
  FolderOpen,
  Milestone,
  CheckSquare,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

async function getStats() {
  const [nmeCount, trialCount, staffCount, projectCount, milestoneCount, taskCount] = await Promise.all([
    prisma.nME.count(),
    prisma.clinicalTrial.count(),
    prisma.staff.count(),
    prisma.project.count(),
    prisma.milestone.count(),
    prisma.task.count(),
  ]);

  // RM counts via raw query
  const rmStudyCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_study`;
  const rmPersonnelCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM rm_personnel`;

  return {
    nmeCount,
    trialCount,
    staffCount,
    projectCount,
    milestoneCount,
    taskCount,
    rmStudyCount: Number(rmStudyCount[0]?.count ?? 0),
    rmPersonnelCount: Number(rmPersonnelCount[0]?.count ?? 0),
  };
}

function StatCard({
  icon: Icon,
  label,
  count,
  href,
  iconBg,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  href: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">{count}</p>
          </div>
          <div className={`rounded-lg p-2.5 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm text-amber-600 group-hover:text-amber-700">
          <span>Manage {label.toLowerCase()}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage NME Portfolio data — create, edit, and delete records
        </p>
      </div>

      {/* Core Entities */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Core Entities</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard
            icon={FlaskConical}
            label="NMEs"
            count={stats.nmeCount}
            href="/admin/nmes"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <StatCard
            icon={BeakerIcon}
            label="Trials"
            count={stats.trialCount}
            href="/admin/trials"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon={Users}
            label="Staff"
            count={stats.staffCount}
            href="/admin/staff"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={FolderOpen}
            label="Projects"
            count={stats.projectCount}
            href="/admin/projects"
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={Milestone}
            label="Milestones"
            count={stats.milestoneCount}
            href="/admin/milestones"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            icon={CheckSquare}
            label="Tasks"
            count={stats.taskCount}
            href="/admin/tasks"
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
          />
        </div>
      </div>

      {/* Resource Management */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Resource Management</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard
            icon={CalendarDays}
            label="RM Studies"
            count={stats.rmStudyCount}
            href="/admin/rm/studies"
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          />
          <StatCard
            icon={Users}
            label="RM Personnel"
            count={stats.rmPersonnelCount}
            href="/admin/rm/personnel"
            iconBg="bg-cyan-50"
            iconColor="text-cyan-600"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link
            href="/admin/nmes/new"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <FlaskConical className="h-4 w-4" />
            Add NME
          </Link>
          <Link
            href="/admin/trials/new"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <BeakerIcon className="h-4 w-4" />
            Add Trial
          </Link>
          <Link
            href="/admin/staff/new"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <Users className="h-4 w-4" />
            Add Staff
          </Link>
          <Link
            href="/admin/nmes/upload"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            <CalendarDays className="h-4 w-4" />
            Bulk Upload
          </Link>
        </div>
      </div>
    </div>
  );
}
