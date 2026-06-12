"use client";

import Link from "next/link";
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
import { logoutAuthSession } from "../../../core/auth/storage";


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

export default function AppSidebar({
  items,
  pathname,
  collapsed,
}: AppSidebarProps) {
  const handleLogout = () => {
    logoutAuthSession();
  };

  return (
    <aside
      data-search-ignore="true"
      className={cn(
        "fixed left-4 top-[96px] z-40 h-[calc(100vh-112px)] transition-all duration-300 ease-out",
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
            "flex h-full flex-col pt-[18px] pb-[18px]",
            collapsed ? "px-[10px]" : "px-[16px]"
          )}
        >
          <nav className="dashboard-hidden-scroll custom-scrollbar flex flex-1 flex-col gap-[6px] overflow-y-auto">
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
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-3 shrink-0">
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