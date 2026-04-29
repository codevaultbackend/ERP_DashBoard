"use client";

import React, { useState } from "react";
import { ChevronDown, MapPin, MoveRight, UserRound } from "lucide-react";
import type { TransitTransfer } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function TransitPageHeader() {
  return (
    <div>
      <h1 className="erp-page-title">In Transit / Tracking</h1>
      <p className="mt-1 erp-page-subtitle">
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
    <div className="min-h-[108px] rounded-erp-xl border border-erp-border bg-erp-card px-6 py-6 shadow-erp-card">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-erp-sm",
            iconWrapClass
          )}
        >
          <span className={cn(iconClass)}>{icon}</span>
        </div>

        <div>
          <p className="text-[15px] font-medium leading-6 tracking-[-0.02em] text-erp-muted">
            {title}
          </p>
          <p className="text-[24px] font-semibold leading-7 tracking-[-0.04em] text-erp-heading">
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
        "inline-flex items-center rounded-erp-full px-3 py-1 text-[13px] font-semibold leading-5",
        delivered
          ? "bg-erp-success-soft text-erp-success"
          : "bg-erp-purple-soft text-erp-purple"
      )}
    >
      {children}
    </span>
  );
}

export function RoutePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-erp-full bg-erp-blue-soft px-3 py-1 text-[13px] font-semibold leading-5 text-erp-primary">
      {children}
    </span>
  );
}

export function LocationRow({ from, to }: { from: string; to: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] md:items-center">
      <LocationText label="From" value={from} />
      <div className="hidden justify-center md:flex">
        <MoveRight className="h-5 w-5 text-erp-muted" />
      </div>
      <LocationText label="To" value={to} />
    </div>
  );
}

function LocationText({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-erp-muted" />
      <div className="min-w-0">
        <p className="text-[14px] leading-5 text-erp-muted">{label}</p>
        <p className="truncate text-[16px] font-semibold leading-6 text-erp-heading">
          {value}
        </p>
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <DateText label="Shipped Date" value={shippedDate} />
      <DateText label="Expected Delivery" value={expectedDelivery} />
    </div>
  );
}

function DateText({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[14px] leading-5 text-erp-muted">{label}</p>
      <p className="text-[16px] font-medium leading-6 text-erp-heading">
        {value}
      </p>
    </div>
  );
}

export function DeliveryPartnerDetails({ item }: { item: TransitTransfer }) {
  const [open, setOpen] = useState(false);

  const partner =
    item.driver_details?.driver_name || item.driver_name || "Not assigned";
  const phone = item.driver_details?.driver_phone || item.driver_phone || "—";
  const vehicle =
    item.driver_details?.vehicle_number || item.vehicle_number || "—";

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          setOpen((prev) => !prev);
        }}
        className="inline-flex items-center gap-3"
      >
        <UserRound className="h-5 w-5 text-erp-success" />
        <span className="text-[18px] font-semibold tracking-[-0.02em] text-erp-heading">
          Delivery Partner Details
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-erp-heading transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-erp-md border border-erp-border bg-erp-card-soft p-4 sm:grid-cols-3">
          <InfoBlock label="Driver Name" value={partner} />
          <InfoBlock label="Driver Phone" value={phone} />
          <InfoBlock label="Vehicle Number" value={vehicle} />
        </div>
      ) : null}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-erp-muted">{label}</p>
      <p className="truncate text-[14px] font-semibold text-erp-heading">
        {value}
      </p>
    </div>
  );
}