"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FlaskConical,
  BeakerIcon,
  Users,
  FolderOpen,
  Milestone,
  CheckSquare,
  CalendarDays,
  LayoutDashboard,
  Settings,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin",            label: "Overview",     icon: LayoutDashboard },
  { href: "/admin/nmes",       label: "NMEs",         icon: FlaskConical },
  { href: "/admin/trials",     label: "Trials",       icon: BeakerIcon },
  { href: "/admin/staff",      label: "Staff",        icon: Users },
  { href: "/admin/projects",   label: "Projects",     icon: FolderOpen },
  { href: "/admin/milestones", label: "Milestones",   icon: Milestone },
  { href: "/admin/tasks",      label: "Tasks",        icon: CheckSquare },
  { href: "/admin/rm",         label: "Resource Mgmt", icon: CalendarDays },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-amber-200 bg-amber-50">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-amber-200 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">Admin Dashboard</p>
          <p className="text-xs text-gray-500">Data Management</p>
        </div>
      </div>

      {/* Back to App */}
      <div className="border-b border-amber-200 px-3 py-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to App
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-amber-600">
          Manage Data
        </p>
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href ||
              (href !== "/admin" && pathname.startsWith(href + "/")) ||
              (href !== "/admin" && pathname === href);
            const isExactMatch = pathname === href;

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive || isExactMatch
                      ? "bg-amber-200 text-amber-900"
                      : "text-gray-600 hover:bg-amber-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-amber-700" : "text-gray-400")} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 mb-2 px-2 text-xs font-medium uppercase tracking-wider text-amber-600">
          Bulk Operations
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/nmes/upload"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/admin/nmes/upload"
                  ? "bg-amber-200 text-amber-900"
                  : "text-gray-600 hover:bg-amber-100 hover:text-gray-900"
              )}
            >
              <Upload className="h-4 w-4 text-gray-400" />
              Bulk Upload
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-amber-200 px-5 py-3">
        <p className="text-xs text-amber-600">Admin v1.0</p>
      </div>
    </aside>
  );
}
