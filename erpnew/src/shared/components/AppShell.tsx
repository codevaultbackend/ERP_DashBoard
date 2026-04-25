"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppRole, ROLE_PROFILE } from "@/shared/lib/erp-auth";
import { useProfile } from "@/shared/hooks/useProfile";

type NavItem = {
  label: string;
  href: string;
};

const NAV_ITEMS: Record<AppRole, NavItem[]> = {
  head_office: [
    { label: "Dashboard", href: "/head-office/dashboard" },
    { label: "Branches", href: "/head-office/branches" },
    { label: "Reports", href: "/head-office/reports" },
  ],
  state: [
    { label: "Dashboard", href: "/state/dashboard" },
    { label: "Districts", href: "/state/districts" },
    { label: "Reports", href: "/state/reports" },
  ],
  district: [
    { label: "Dashboard", href: "/district/dashboard" },
    { label: "Retail", href: "/district/retail" },
    { label: "Reports", href: "/district/reports" },
  ],
  retail: [
    { label: "Dashboard", href: "/retail/dashboard" },
    { label: "Inventory", href: "/retail/inventory" },
    { label: "Orders", href: "/retail/orders" },
  ],
};

const TITLES: Record<AppRole, string> = {
  head_office: "Head Office",
  state: "State",
  district: "District",
  retail: "Retail",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getInitial(name?: string) {
  if (!name) return "V";
  return name.trim().charAt(0).toUpperCase();
}

function formatRoleLabel(role?: string, fallback?: string) {
  if (!role) return fallback || "ERP User";

  return role
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AppShell({
  role,
  children,
}: {
  role: AppRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];
  const { profile, loading } = useProfile();

  const profileHref = ROLE_PROFILE[role];
  const profileName = profile?.name?.trim() || "Vivek";
  const profileRole = formatRoleLabel(profile?.role, TITLES[role]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="fixed left-0 right-0 top-0 z-50 h-[72px] border-b border-[#E5E7EB] bg-white">
        <div className="flex h-full items-center justify-between gap-3 px-4 md:px-6">
          <h1 className="truncate text-base font-semibold text-[#111827] sm:text-lg">
            {TITLES[role]}
          </h1>

          <Link
            href={profileHref}
            className="flex min-w-0 items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-2 py-2 transition hover:bg-[#F8FAFC] active:scale-[0.99] sm:gap-3 sm:px-3"
          >
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profileName}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-sm font-semibold text-[#1D4ED8]">
                {loading ? "..." : getInitial(profileName)}
              </div>
            )}

            <div className="min-w-0 max-w-[140px] sm:max-w-[180px]">
              <p className="truncate text-sm font-semibold leading-none text-[#111827]">
                {loading ? "Loading..." : profileName}
              </p>
              <p className="mt-1 truncate text-[11px] leading-none text-[#6B7280] sm:text-xs">
                {profileRole}
              </p>
            </div>
          </Link>
        </div>
      </header>

      <div className="pt-[72px]">
        <aside className="fixed left-0 top-[72px] hidden h-[calc(100vh-72px)] w-[260px] border-r border-[#E5E7EB] bg-white p-4 md:block">
          <nav className="flex flex-col gap-2">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-[#2563EB] text-white"
                      : "text-[#374151] hover:bg-[#F3F4F6]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="sticky top-[72px] z-40 border-b border-[#E5E7EB] bg-white md:hidden">
          <div className="flex gap-3 overflow-x-auto px-4 py-3">
            {items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
                    active
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#F3F4F6] text-[#374151]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="px-4 py-4 md:ml-[260px] md:p-6">
          <div className="min-h-[calc(100vh-104px)] rounded-[24px] bg-white p-4 shadow-sm md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}