"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  FlaskConical,
  BeakerIcon,
  FolderOpen,
  Users,
  LayoutDashboard,
  Microscope,
  TrendingUp,
  Brain,
  Target,
  BarChart2,
  CalendarDays,
  Settings,
  Sparkles,
  LogOut,
  User,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",         label: "Dashboard",       icon: LayoutDashboard },
  { href: "/nmes",              label: "NME Portfolio",   icon: FlaskConical },
  { href: "/trials",            label: "Clinical Trials", icon: BeakerIcon },
  { href: "/projects",          label: "Projects",        icon: FolderOpen },
  { href: "/staff",             label: "Staff",           icon: Users },
  { href: "/evm",               label: "EVM",             icon: TrendingUp },
  { href: "/evm-predictions",   label: "EVM Predictions", icon: Sparkles },
  { href: "/staff/recommend",   label: "PS Recommender",  icon: Brain },
  { href: "/dashboard/psychometrics", label: "Psychometrics", icon: Activity },
  { href: "/portfolio",         label: "Portfolio Opt.",  icon: Target },
  { href: "/nme-portfolio",     label: "NME Frontier",    icon: BarChart2 },
  { href: "/rm",                label: "Resource Mgmt",   icon: CalendarDays },
  { href: "/rm/nme",            label: "RM by NME",       icon: FlaskConical },
  { href: "/admin",             label: "Admin",           icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Microscope className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900">NME Portfolio</p>
          <p className="text-xs text-gray-500">NovaMed Therapeutics</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-gray-400">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-gray-400")} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section & Logout */}
      <div className="border-t border-gray-200 px-3 py-3 space-y-2">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate">{userEmail || "NME Portfolio v1.0"}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
