"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Package,
  Truck,
  BadgeDollarSign,
  BookOpen,
  RefreshCcw,
  BarChart3,
  LogOut,
  Search,
  SunMedium,
  UserCircle2,
  MapPin,
  ChevronRight,
  PackageCheck,
  CircleCheckBig,
} from "lucide-react";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Stock Management", href: "/stock-management", icon: Boxes },
  { label: "Request", href: "/request", icon: Package },
  { label: "Transit", href: "/transit", icon: Truck },
  { label: "Billing", href: "/billing", icon: BadgeDollarSign },
  { label: "Ledger", href: "/ledger", icon: BookOpen },
  { label: "Exchange", href: "/exchange", icon: RefreshCcw },
  { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
];

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function StatCard({
  icon,
  title,
  value,
  iconWrapClass,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  iconWrapClass: string;
  iconClass?: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#D9DEE7] bg-white px-6 py-6 shadow-[0px_1px_2px_rgba(16,24,40,0.02)]">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-[56px] w-[56px] items-center justify-center rounded-[16px]",
            iconWrapClass
          )}
        >
          <div className={iconClass}>{icon}</div>
        </div>

        <div className="flex flex-col">
          <span className="text-[17px] font-medium leading-none text-[#667085]">
            {title}
          </span>
          <span className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.03em] text-[#111827]">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

export function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[30px] items-center rounded-full bg-[#F3E8FF] px-4 text-[12px] font-[500] text-[#8B2CF5]">
      {children}
    </span>
  );
}

export function RoutePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[30px] items-center rounded-full bg-[#DDE9FF] px-4 text-[14px] font-semibold text-[#2F63E9]">
      {children}
    </span>
  );
}

export function LocationRow({
  from,
  to,
}: {
  from: string;
  to: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-6">
      <div className="flex items-start gap-3">
        <MapPin className="mt-1 h-[18px] w-[18px] text-[#6B7280]" />
        <div>
          <div className="text-[15px] leading-none text-[#6B7280]">From</div>
          <div className="mt-1 text-[20px] font-medium leading-[1.2] text-[#111827]">
            {from}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Truck className="h-[18px] w-[18px] text-[#8B2CF5]" />
        <ChevronRight className="h-[20px] w-[20px] text-[#9CA3AF]" />
      </div>

      <div className="flex items-start gap-3">
        <MapPin className="mt-1 h-[18px] w-[18px] text-[#6B7280]" />
        <div>
          <div className="text-[15px] leading-none text-[#6B7280]">To</div>
          <div className="mt-1 text-[20px] font-medium leading-[1.2] text-[#111827]">
            {to}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DateInfo({
  shippedDate,
  expectedDelivery,
}: {
  shippedDate: string;
  expectedDelivery: string;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <div className="text-[15px] text-[#6B7280]">Shipped Date</div>
        <div className="mt-1 text-[20px] font-medium text-[#111827]">
          {shippedDate}
        </div>
      </div>

      <div>
        <div className="text-[15px] text-[#6B7280]">Expected Delivery</div>
        <div className="mt-1 text-[20px] font-medium text-[#111827]">
          {expectedDelivery}
        </div>
      </div>
    </div>
  );
}

export function MapPreview({
  onClick,
  large = false,
}: {
  onClick?: () => void;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-[#F7F2E7] text-left",
        large ? "h-[770px] w-full" : "h-[230px] w-full"
      )}
    >
      <div className="absolute inset-0 bg-[#F5F1E8]" />

      <div className="absolute inset-0 opacity-90">
        <div className="absolute left-[6%] top-0 h-full w-[10px] rotate-[18deg] bg-[#F0D54B]" />
        <div className="absolute left-[28%] top-[-10%] h-[125%] w-[8px] rotate-[-12deg] bg-[#F0D54B]" />
        <div className="absolute right-[20%] top-[-8%] h-[122%] w-[8px] rotate-[10deg] bg-[#F0D54B]" />
        <div className="absolute right-[2%] top-[-4%] h-[116%] w-[8px] rotate-[-8deg] bg-[#F0D54B]" />

        <div className="absolute left-[-10%] top-[18%] h-[6px] w-[65%] rotate-[-12deg] bg-[#F0D54B]" />
        <div className="absolute left-[33%] top-[54%] h-[6px] w-[65%] rotate-[9deg] bg-[#F0D54B]" />
        <div className="absolute left-[18%] top-[78%] h-[6px] w-[58%] rotate-[-10deg] bg-[#F0D54B]" />

        <div className="absolute left-[18%] top-[-4%] h-[118%] w-[2px] rotate-[15deg] bg-[#BFC3C9]" />
        <div className="absolute left-[40%] top-[-8%] h-[125%] w-[2px] rotate-[-14deg] bg-[#BFC3C9]" />
        <div className="absolute right-[32%] top-[-3%] h-[120%] w-[2px] rotate-[12deg] bg-[#BFC3C9]" />
        <div className="absolute left-[0%] top-[40%] h-[2px] w-[100%] rotate-[7deg] bg-[#BFC3C9]" />
        <div className="absolute left-[3%] top-[65%] h-[2px] w-[90%] rotate-[-12deg] bg-[#BFC3C9]" />

        <div className="absolute left-[9%] top-[12%] h-[180px] w-[22px] rotate-[12deg] rounded-full bg-[#B6E0FB]" />
        <div className="absolute left-[35%] bottom-[-2%] h-[150px] w-[28px] rotate-[-28deg] rounded-full bg-[#B6E0FB]" />
        <div className="absolute right-[8%] bottom-[18%] h-[70px] w-[16px] rotate-[46deg] rounded-full bg-[#B6E0FB]" />

        <div className="absolute left-[69%] top-[7%] h-[34px] w-[58px] rotate-[24deg] rounded-[8px] bg-[#C6E0B6]" />
        <div className="absolute left-[79%] top-[68%] h-[40px] w-[72px] rotate-[-22deg] rounded-[10px] bg-[#C6E0B6]" />
        <div className="absolute left-[44%] top-[27%] h-[42px] w-[52px] rotate-[12deg] rounded-[10px] bg-[#C6E0B6]" />
      </div>

      {[
        { left: "32%", top: "8%" },
        { left: "69%", top: "25%" },
        { left: "60%", top: "63%" },
        { left: "27%", top: "78%" },
        { left: "96%", top: "62%" },
        { left: "72%", top: "96%" },
      ].map((point, i) => (
        <span
          key={i}
          className="absolute h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#FF1F2D] shadow-md"
          style={{ left: point.left, top: point.top }}
        />
      ))}

      {!large && (
        <div className="absolute right-4 top-4 flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-white/80 shadow-sm">
          <PackageCheck className="h-[18px] w-[18px] text-[#9CA3AF]" />
        </div>
      )}
    </button>
  );
}

