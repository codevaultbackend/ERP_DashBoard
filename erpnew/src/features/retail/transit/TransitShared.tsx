"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  MapPin,
  MoveRight,
  UserRound,
} from "lucide-react";
import type { TransitTransfer } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function TransitPageHeader() {
  return (
    <div>
      <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.04em] text-[#111827] md:text-[32px]">
        In Transit / Tracking
      </h1>
      <p className="mt-1 text-[15px] font-medium leading-6 text-[#667085]">
        Monitor stock shipments across all locations
      </p>
    </div>
  );
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
  iconWrapClass?: string;
  iconClass?: string;
}) {
  return (
    <div className="rounded-[26px] border border-[#E5E7EB] bg-white px-6 py-6 shadow-[0px_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px]",
            iconWrapClass
          )}
        >
          <span className={cn(iconClass)}>{icon}</span>
        </div>

        <div className="min-w-0">
          <p className="text-[15px] font-medium leading-6 text-[#667085]">
            {title}
          </p>
          <p className="mt-0.5 text-[18px] font-semibold leading-7 text-[#111827] md:text-[20px]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function StatusPill({
  children,
  delivered,
}: {
  children: React.ReactNode;
  delivered?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold leading-5",
        delivered
          ? "bg-[#ECFDF3] text-[#027A48]"
          : "bg-[#F4EBFF] text-[#7A2ECA]"
      )}
    >
      {children}
    </span>
  );
}

export function RoutePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#EAF2FF] px-3 py-1 text-[13px] font-semibold leading-5 text-[#175CD3]">
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
    <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:items-center">
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#98A2B3]" />
          <div className="min-w-0">
            <p className="text-[14px] leading-5 text-[#667085]">From</p>
            <p className="truncate text-[16px] font-semibold leading-6 text-[#111827]">
              {from}
            </p>
          </div>
        </div>
      </div>

      <div className="hidden items-center justify-center md:flex">
        <MoveRight className="h-[22px] w-[22px] text-[#98A2B3]" />
      </div>

      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#98A2B3]" />
          <div className="min-w-0">
            <p className="text-[14px] leading-5 text-[#667085]">To</p>
            <p className="truncate text-[16px] font-semibold leading-6 text-[#111827]">
              {to}
            </p>
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
    <div className="grid grid-cols-1 gap-y-4 gap-x-8 pt-1 md:grid-cols-2">
      <div>
        <p className="text-[14px] leading-5 text-[#667085]">Shipped Date</p>
        <p className="text-[16px] font-medium leading-6 text-[#111827]">
          {shippedDate}
        </p>
      </div>

      <div>
        <p className="text-[14px] leading-5 text-[#667085]">Expected Delivery</p>
        <p className="text-[16px] font-medium leading-6 text-[#111827]">
          {expectedDelivery}
        </p>
      </div>
    </div>
  );
}

export function DeliveryPartnerDetails({
  item,
}: {
  item: TransitTransfer;
}) {
  const [open, setOpen] = useState(false);

  const partner =
    item?.delivery_partner_name ||
    item?.driver_name ||
    item?.partner_name ||
    "Not assigned";

  const phone =
    item?.delivery_partner_phone ||
    item?.driver_phone ||
    item?.partner_phone ||
    "—";

  const vehicle =
    item?.vehicle_number || item?.vehicle_no || item?.truck_number || "—";

  return (
    <div className="w-full rounded-[18px] border border-[#EAECF0] bg-[#FCFCFD]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <UserRound className="h-[18px] w-[18px] shrink-0 text-[#16A34A]" />
          <span className="truncate text-[16px] font-semibold text-[#111827]">
            Delivery Partner Details
          </span>
        </div>

        <ChevronDown
          className={cn(
            "h-[18px] w-[18px] shrink-0 text-[#344054] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="grid grid-cols-1 gap-3 border-t border-[#EAECF0] px-4 py-4 md:grid-cols-3">
          <InfoBlock label="Partner" value={partner} />
          <InfoBlock label="Phone" value={phone} />
          <InfoBlock label="Vehicle" value={vehicle} />
        </div>
      ) : null}
    </div>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-[#667085]">{label}</p>
      <p className="truncate text-[14px] font-semibold text-[#111827]">
        {value}
      </p>
    </div>
  );
}