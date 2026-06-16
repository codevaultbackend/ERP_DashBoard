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
  type LucideIcon,
} from "lucide-react";
import type { NavItem } from "./AppShell";
import { LogOut } from "lucide-react";
import { logoutAuthSession } from "../../../core/auth/storage";

type MobileNavProps = {
  items: NavItem[];
  pathname: string;
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


export default function MobileNav({ items, pathname }: MobileNavProps) {
  const handleLogout = () => {
    logoutAuthSession();
  };
  return (
    <nav
      className="sticky top-[76px] z-[45] md:hidden"
      data-search-ignore="true"
      aria-label="Mobile navigation"
    >
      {/* Same bg cover style as topbar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[#F4F7FB]/85 backdrop-blur-[18px]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-gradient-to-b from-[#F4F7FB] via-[#F4F7FB]/95 to-[#F4F7FB]/80" />

      <div className="overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto dashboard-hidden-scroll px-3 py-3 pb-2 scrollbar-hide">
          {items.map((item) => {
            const Icon = getIcon(item.label);
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex min-h-[46px] shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[14px] border px-4 py-[11px] transition-all duration-200",
                    active
                      ? "border-[#D7E5FF] bg-white text-[#245DDB] shadow-[0px_4px_14px_rgba(36,93,219,0.10)]"
                      : "border-[#EEF2F6] bg-white text-[#4B5565] shadow-[0px_2px_8px_rgba(17,24,39,0.03)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[20px] w-[20px] shrink-0 items-center justify-center",
                      active ? "text-[#245DDB]" : "text-[#667085]"
                    )}
                  >
                    <Icon size={17} strokeWidth={2} />
                  </span>

                  <span
                    className={cn(
                      "truncate text-[13px] font-semibold leading-none tracking-[-0.01em]",
                      active ? "text-[#245DDB]" : "text-[#344054]"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
            );
          })}
          <div className="ml-auto shrink-0">
            <button onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}