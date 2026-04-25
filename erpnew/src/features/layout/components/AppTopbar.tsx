"use client";

import Link from "next/link";
import { Search, SunMedium, PanelLeftDashed, X } from "lucide-react";
import { useGlobalSearch } from "@/features/global-search/GlobalSearchProvider";
import { useProfile } from "@/shared/hooks/useProfile";
import { AppRole, ROLE_PROFILE } from "@/shared/lib/erp-auth";

type AppTopbarProps = {
  title: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  role?: AppRole;
};

function formatRoleLabel(role?: string, fallback?: string) {
  if (!role) return fallback || "ERP User";

  return role
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitial(name?: string) {
  if (!name) return "V";
  return name.trim().charAt(0).toUpperCase();
}

export default function AppTopbar({
  title,
  isSidebarCollapsed,
  onToggleSidebar,
  role,
}: AppTopbarProps) {
  const {
    query,
    setQuery,
    nextMatch,
    prevMatch,
    clearSearch,
    totalMatches,
    activeIndex,
  } = useGlobalSearch();

  const { profile, loading } = useProfile();

  const safeRole: AppRole = role && ROLE_PROFILE[role] ? role : "retail";
  const profileHref = ROLE_PROFILE[safeRole] || "/retail/profile";

  const profileName = profile?.name?.trim() || "Vivek";
  const profileRole = formatRoleLabel(profile?.role, "Admin User");

  return (
    <header
      className="fixed left-4 right-4 top-4 z-50"
      data-search-ignore="true"
    >
      <div
        className="
          h-[66px] rounded-[34px] border border-[#E7E9EE] bg-[#FCFCFD]
          shadow-[0px_10px_30px_rgba(17,24,39,0.04),0px_2px_8px_rgba(17,24,39,0.03)]
        "
      >
        <div className="flex h-full items-center justify-between gap-3 px-[14px] sm:px-[18px] md:gap-4 md:px-[26px]">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
            <div className="min-w-0 shrink">
              <h1 className="truncate text-[15px] font-medium tracking-[-0.02em] text-[#1E63B5] sm:text-[18px] md:text-[19px]">
                {title}
              </h1>
            </div>

            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={onToggleSidebar}
              className="
                hidden h-[38px] w-[38px] shrink-0 items-center justify-center
                rounded-[10px] text-[#111827] transition hover:bg-[#F4F6F8]
                md:flex
              "
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeftDashed size={19} strokeWidth={1.9} />
            </button>
          </div>

          <div className="mx-1 hidden h-[26px] w-px shrink-0 bg-[#E6E8EC] md:block" />

          <div className="hidden min-w-0 flex-1 items-center md:flex">
            <div className="flex h-[38px] w-full items-center gap-3 rounded-[10px] bg-[#F6F7F9] px-4">
              <Search
                size={17}
                strokeWidth={1.9}
                className="shrink-0 text-[#9AA3AF]"
              />

              <input
                type="text"
                placeholder="Search across app..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (e.shiftKey) prevMatch();
                    else nextMatch();
                  }

                  if (e.key === "Escape") {
                    clearSearch();
                  }
                }}
                className="
                  w-full border-none bg-transparent text-[14px] font-normal text-[#111827]
                  outline-none placeholder:text-[#A1A8B3]
                "
              />

              {query ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="
                    flex h-6 w-6 items-center justify-center rounded-full
                    text-[#98A2B3] transition hover:bg-[#E9EEF5] hover:text-[#475467]
                  "
                >
                  <X size={14} strokeWidth={2} />
                </button>
              ) : null}

              <div className="hidden shrink-0 rounded-full bg-white px-2 py-[3px] text-[11px] font-medium text-[#667085] lg:block">
                {totalMatches > 0 ? `${activeIndex + 1}/${totalMatches}` : "0/0"}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Theme settings"
              className="
                hidden h-[38px] w-[38px] shrink-0 items-center justify-center
                rounded-full text-[#111827] transition hover:bg-[#F4F6F8]
                md:flex
              "
            >
              <SunMedium size={20} strokeWidth={1.9} />
            </button>

            <div className="hidden h-[26px] w-px shrink-0 bg-[#E6E8EC] md:block" />

            <Link
              href={profileHref}
              className="
                flex min-w-0 shrink-0 items-center gap-2 rounded-[999px]
                px-1 py-1 transition hover:bg-[#F7F8FA] sm:gap-3 sm:px-1.5
              "
            >
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profileName}
                  className="h-[38px] w-[38px] shrink-0 rounded-full object-cover sm:h-[40px] sm:w-[40px]"
                />
              ) : (
                <div
                  className="
                    flex h-[38px] w-[38px] shrink-0 items-center justify-center
                    overflow-hidden rounded-full bg-[#DBEAFE]
                    text-sm font-semibold text-[#1D4ED8]
                    sm:h-[40px] sm:w-[40px]
                  "
                >
                  {loading ? "..." : getInitial(profileName)}
                </div>
              )}

              <div className="hidden min-w-0 text-left lg:block">
                <p className="truncate text-[15px] font-medium leading-[1.1] tracking-[-0.01em] text-[#111827]">
                  {loading ? "Loading..." : profileName}
                </p>
                <p className="mt-[4px] truncate text-[12px] font-normal leading-none text-[#7C8795]">
                  {profileRole}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}