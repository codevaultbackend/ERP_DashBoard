"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  PackagePlus,
  Truck,
  ReceiptText,
  BookOpenText,
  BadgePercent,
  ClipboardList,
  BarChart3,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { NavItem } from "./AppShell";

type AppSidebarProps = {
  items: NavItem[];
  pathname: string;
  collapsed: boolean;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const iconMap: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  "Stock Management": Boxes,
  Request: PackagePlus,
  Transit: Truck,
  Billing: ReceiptText,
  Ledger: BookOpenText,
  "Refund & Return": BadgePercent,
  "Activities Performed": ClipboardList,
  "Reports & Analytics": BarChart3,
};

function getIcon(label: string) {
  return iconMap[label] || LayoutDashboard;
}

function clearCookie(name: string) {
  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";

  document.cookie = `${name}=; expires=${expires}; path=/`;
  document.cookie = `${name}=; expires=${expires}; path=/; SameSite=Lax`;
  document.cookie = `${name}=; expires=${expires}; path=/; SameSite=Lax; Secure`;

  const hostnameParts = window.location.hostname.split(".");
  if (hostnameParts.length >= 2) {
    const rootDomain = `.${hostnameParts.slice(-2).join(".")}`;
    document.cookie = `${name}=; expires=${expires}; path=/; domain=${rootDomain}`;
    document.cookie = `${name}=; expires=${expires}; path=/; domain=${rootDomain}; SameSite=Lax`;
    document.cookie = `${name}=; expires=${expires}; path=/; domain=${rootDomain}; SameSite=Lax; Secure`;
  }
}

export default function AppSidebar({
  items,
  pathname,
  collapsed,
}: AppSidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    try {
      const storageKeys = [
        "token",
        "accessToken",
        "authToken",
        "ims_token",
        "imsToken",
        "jwt",
        "refreshToken",
        "user",
        "authUser",
        "auth",
        "role",
        "normalized_role",
        "level",
      ];

      storageKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      clearCookie("token");
      clearCookie("role");

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      data-search-ignore="true"
      className={cn(
        "fixed left-4 top-[96px] z-40 h-[calc(100vh-112px)] transition-all duration-300 ease-out ",
        collapsed ? "w-[88px]" : "w-[260px]"
      )}
    >
      <div
        className="
          flex h-full flex-col overflow-hidden rounded-[34px]
          border border-[#E7E9EE] bg-[#FCFCFD] 
          shadow-[0px_10px_30px_rgba(17,24,39,0.04),0px_2px_8px_rgba(17,24,39,0.03)]
        "
      >
        <div
          className={cn(
            "flex h-full flex-col pt-[18px] pb-[18px] ",
            collapsed ? "px-[10px]" : "px-[16px]"
          )}
        >
          <nav className="flex flex-1 flex-col gap-[6px] custom-scrollbar overflow-y-auto">
            {items.map((item) => {
              const Icon = getIcon(item.label);
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "relative flex min-h-[56px] items-center rounded-[18px] transition-all duration-200",
                    collapsed ? "justify-center px-0" : "gap-3 px-[18px]",
                    active
                      ? "bg-[#EEF4FF] text-[#245DDB]"
                      : "text-[#445164] hover:bg-[#F5F7FA]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[22px] w-[22px] shrink-0 items-center justify-center transition-colors duration-200",
                      active ? "text-[#245DDB]" : "text-[#4B5565]"
                    )}
                  >
                    <Icon size={20} strokeWidth={1.9} />
                  </span>

                  {!collapsed && (
                    <span
                      className={cn(
                        "truncate text-[15px] leading-none tracking-[-0.01em]",
                        active ? "font-medium" : "font-normal"
                      )}
                    >
                      {item.label}
                    </span>
                  )}

                  {active && !collapsed && (
                    <span className="absolute right-[16px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full bg-[#245DDB]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-3">
            <div className="mb-3 h-px w-full bg-[#EEF0F3]" />

            <button
              type="button"
              onClick={handleLogout}
              title={collapsed ? "Log Out" : undefined}
              className={cn(
                "flex min-h-[54px] w-full items-center rounded-[18px] text-left text-[#7B818C] transition-all duration-200 hover:bg-[#F5F7FA] hover:text-[#4B5565]",
                collapsed ? "justify-center px-0" : "gap-3 px-[18px]"
              )}
            >
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center text-current">
                <LogOut size={20} strokeWidth={1.9} />
              </span>

              {!collapsed && (
                <span className="text-[15px] font-normal tracking-[-0.01em]">
                  Log Out
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}