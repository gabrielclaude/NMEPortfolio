export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Upload, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { StaffRoleLabels } from "@/lib/validations/staff";
import { DeleteStaffButton } from "./DeleteStaffButton";

const ACTIVE_STATUS_COLORS: Record<string, string> = {
  true: "emerald",
  false: "gray",
};

export default async function AdminStaffPage() {
  const staff = await prisma.staff.findMany({
    orderBy: { lastName: "asc" },
    include: {
      _count: {
        select: {
          assignedTasks: true,
          trialAssignments: true,
          ledTrials: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Staff</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create, edit, and delete team members
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/staff/upload">
              <Upload className="h-4 w-4 mr-1" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/staff/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Staff
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Employee ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Department</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Hire Date</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staff.map((member) => {
              const totalRelations =
                member._count.assignedTasks +
                member._count.trialAssignments +
                member._count.ledTrials;
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-indigo-600">{member.employeeId}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{member.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {StaffRoleLabels[member.role as keyof typeof StaffRoleLabels]}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{member.department}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge
                      value={member.isActive ? "Active" : "Inactive"}
                      colorMap={{
                        Active: "emerald",
                        Inactive: "gray",
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(member.hireDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/admin/staff/${member.id}/edit`}>
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Link>
                      </Button>
                      <DeleteStaffButton
                        id={member.id}
                        name={`${member.firstName} ${member.lastName}`}
                        relationCount={totalRelations}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {staff.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No staff members found. Add your first team member to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
