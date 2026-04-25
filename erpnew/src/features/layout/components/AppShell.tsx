"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppRole } from "@/shared/lib/erp-auth";
import AppTopbar from "./AppTopbar";
import AppSidebar from "./AppSidebar";
import { GlobalSearchProvider } from "@/features/global-search/GlobalSearchProvider";
import GlobalSearchScope from "@/features/global-search/GlobalSearchScope";
import MobileNav from "./MobileNav";

type NavItem = {
  label: string;
  href: string;
};

const NAV_ITEMS: Record<AppRole, NavItem[]> = {
  head_office: [
    { label: "Dashboard", href: "/head-office/dashboard" },
    { label: "Stock Management", href: "/head-office/stock-management" },
    { label: "Transit", href: "/head-office/transit" },
    { label: "Ledger", href: "/head-office/ledger" },
    { label: "Store Management", href: "/head-office/store-management" },
    { label: "Reports & Analytics", href: "/head-office/reports-analytics" },
  ],
  state: [
    { label: "Dashboard", href: "/state/dashboard" },
    { label: "Stock Management", href: "/state/stock-management" },
    { label: "Request", href: "/state/request" },
    { label: "Transit", href: "/state/transit" },
    { label: "Billing", href: "/state/billing" },
    { label: "Ledger", href: "/state/ledger" },
    { label: "Refund & Return", href: "/state/refund-return" },
    { label: "Activities Performed", href: "/state/activities-performed" },
    { label: "Reports & Analytics", href: "/state/reports-analytics" },
  ],
  district: [
    { label: "Dashboard", href: "/district/dashboard" },
    { label: "Stock Management", href: "/district/stock-management" },
    { label: "Request", href: "/district/request" },
    { label: "Transit", href: "/district/transit" },
    { label: "Store Management", href: "/district/store-management" },
    { label: "Billing", href: "/district/billing" },
    { label: "Ledger", href: "/district/ledger" },
    { label: "Activities Performed", href: "/district/activities-performed" },
    { label: "Exchange", href: "/district/Exachange" },
    { label: "Reports & Analytics", href: "/district/reports-analytics" },
  ],
  retail: [
    { label: "Dashboard", href: "/retail/dashboard" },
    { label: "Stock Management", href: "/retail/stock-management" },
    { label: "Request", href: "/retail/request" },
    { label: "Transit", href: "/retail/transit" },
    { label: "Billing", href: "/retail/billing" },
    { label: "Ledger", href: "/retail/ledger" },
    { label: "Exchange", href: "/retail/refund-return" },
    { label: "Reports & Analytics", href: "/retail/reports-analytics" },
  ],
};

const TITLES: Record<AppRole, string> = {
  head_office: "Athratech Pvt Limited",
  state: "Athratech Pvt Limited",
  district: "Athratech Pvt Limited",
  retail: "Athratech Pvt Limited",
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type { NavItem };

export default function AppShell({
  role,
  children,
}: {
  role: AppRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <GlobalSearchProvider>
      <div className="min-h-screen bg-[#F3F4F6]">
        <AppTopbar
          title={TITLES[role]}
          role={role}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <div className="pt-[80px] md:pt-[96px]">
          <div className="hidden md:block">
            <AppSidebar
              items={items}
              pathname={pathname}
              collapsed={isSidebarCollapsed}
            />
          </div>

          <div className="sticky top-[86px] z-30">
            <MobileNav items={items} pathname={pathname} />
          </div>

          <main
            className={cn(
              "px-4  pb-6 pt-2  md:pt-0 transition-all duration-300",
              isSidebarCollapsed ? "md:ml-[102px]" : "md:ml-[277px]"
            )}
          >
            <GlobalSearchScope>
              <div className="min-h-[calc(100vh-110px)]">{children}</div>
            </GlobalSearchScope>
          </main>
        </div>
      </div>
    </GlobalSearchProvider>
  );
}