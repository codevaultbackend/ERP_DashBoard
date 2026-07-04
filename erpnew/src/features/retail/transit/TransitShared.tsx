"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  MapPin,
  MoveRight,
  PackageCheck,
  Truck,
  UserRound,
} from "lucide-react";
import type { TransitDirection, TransitTransfer } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function TransitPageHeader() {
  return (
    <div>
      <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold tracking-[-0.04em] text-erp-heading">
        In Transit / Tracking
      </h1>
      <p className="mt-[4px] erp-page-subtitle">
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
    <div className="flex h-[108px] items-center rounded-[28px] border border-erp-border bg-erp-card px-[26px] max-[768px]:px-[16px] max-[768px]:gap-0.5 shadow-erp-card">
      <div className="flex items-center gap-[16px]">
        <div
          className={cn(
            "flex h-[46px] w-[46px] sm:h-[52px] sm:w-[52px] shrink-0 items-center justify-center rounded-[12px] sm:rounded-[14px]",
            iconWrapClass
          )}
        >
          <span className={cn("flex items-center justify-center ", iconClass)}>
            {icon}
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-[13px] sm:text-[15px] font-medium text-erp-muted">
            {title}
          </p>
          <p className="mt-1 text-[22px] sm:text-[28px] font-semibold leading-none text-erp-heading">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TransitDirectionToggle({
  value,
  onChange,
  incomingCount,
  outgoingCount,
}: {
  value: TransitDirection;
  onChange: (value: TransitDirection) => void;
  incomingCount: number;
  outgoingCount: number;
}) {
  const options: Array<{
    value: TransitDirection;
    label: string;
    count: number;
  }> = [
      { value: "incoming", label: "Arriving Stock", count: incomingCount },
      { value: "outgoing", label: "Dispatched Stock", count: outgoingCount },
    ];

  return (
    <div className="flex w-full justify-start lg:w-auto lg:justify-end">
      <div
        className="
grid
w-full
grid-cols-2
rounded-[18px]
sm:rounded-full
bg-erp-dark
p-[4px]
sm:p-[6px]
shadow-erp-card
"
      >
        {options.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex h-[40px] items-center justify-center gap-[8px] rounded-full px-[14px]",
                "text-[15px] font-semibold leading-[20px] tracking-[-0.02em] transition-all ",
                active
                  ? "bg-white text-erp-dark shadow-[0px_1px_3px_rgba(15,23,42,0.12)]"
                  : "bg-transparent text-white hover:bg-white/10"
              )}
            >
              <span className="whitespace-nowrap">{option.label}</span>
              <span
                className={cn(
                  "hidden h-[20px] min-w-[20px] items-center justify-center rounded-full px-[6px] text-[11px] font-bold sm:inline-flex",
                  active ? "bg-erp-dark text-white" : "bg-white/15 text-white"
                )}
              >
                {option.count}
              </span>
            </button>
          );
        })}
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
        "inline-flex h-[24px] items-center rounded-full px-[12px] text-[13px] max-[768px]:text-[11px] mfont-semibold leading-[18px]",
        delivered
          ? "bg-erp-success-soft text-erp-success"
          : "bg-erp-purple-soft text-erp-purple"
      )}
    >
      {children}
    </span>
  );
}

export function DirectionPill({
  direction,
}: {
  direction?: TransitDirection;
}) {
  const incoming = direction === "incoming";

  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center gap-[5px] rounded-full px-[12px] text-[13px] font-semibold leading-[18px]",
        incoming
          ? "bg-erp-blue-soft text-erp-primary"
          : "bg-erp-yellow-soft text-erp-yellow"
      )}
    >
      {incoming ? (
        <PackageCheck className="h-[13px] w-[13px]" />
      ) : (
        <Truck className="h-[13px] w-[13px]" />
      )}
      {incoming ? "Incoming" : "Outgoing"}
    </span>
  );
}

export function RoutePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[24px] items-center rounded-full bg-erp-yellow-soft px-[12px] text-[13px] max-[768px]:text-[11px] font-semibold leading-[18px] text-erp-yellow">
      {children}
    </span>
  );
}

export function LocationRow({ from, to }: { from: string; to: string }) {
  return (
    <div className="grid grid-cols-1 gap-[18px] md:grid-cols-[minmax(0,1fr)_42px_minmax(0,1fr)] md:items-center">
      <LocationText label="From" value={from} />

      <div className="hidden justify-center md:flex">
        <MoveRight className="h-[22px] w-[22px] text-erp-muted" />
      </div>

      <LocationText label="To" value={to} />
    </div>
  );
}

function LocationText({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-[9px]">
      <MapPin className="mt-[2px] h-[18px] w-[18px] shrink-0 text-erp-muted" />
      <div className="min-w-0">
        <p className="text-[14px] max-[768px]:text-[12px] font-normal leading-[18px] tracking-[-0.02em] text-erp-muted">
          {label}
        </p>
        <p className="mt-[2px] truncate text-[16px] max-[768px]:text-[14px] font-semibold leading-[20px] tracking-[-0.02em] text-erp-heading">
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
    <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
      <DateText label="Shipped Date" value={shippedDate} />
      <DateText label="Expected Delivery" value={expectedDelivery} />
    </div>
  );
}

function DateText({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[14px] font-normal leading-[18px] tracking-[-0.02em] text-erp-muted">
        {label}
      </p>
      <p className="mt-[4px] text-[16px] font-medium leading-[20px] tracking-[-0.02em] text-erp-heading">
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
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="inline-flex items-center gap-[10px]"
      >
        <UserRound className="h-[19px] w-[19px] text-erp-success" />

        <span className="text-[18px] max-[768px]:text-[15px] font-semibold leading-[24px] tracking-[-0.03em] text-erp-heading">
          Delivery Partner Details
        </span>

        <ChevronDown
          className={cn(
            "h-[16px] w-[16px] text-erp-heading transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="mt-[14px] grid grid-cols-1 gap-[12px] rounded-[18px] border border-erp-border bg-erp-card-soft p-[14px] sm:grid-cols-3">
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
      <p className="text-[13px] font-medium leading-[18px] text-erp-muted">
        {label}
      </p>
      <p className="truncate text-[14px] font-semibold leading-[20px] text-erp-heading">
        {value}
      </p>
    </div>
  );
}