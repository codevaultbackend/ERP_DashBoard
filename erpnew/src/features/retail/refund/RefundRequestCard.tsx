"use client";

import type React from "react";
import {
  ChevronDown,
  RefreshCcw,
  UserRound,
  RotateCcw,
  PackageCheck,
} from "lucide-react";
import { useState } from "react";
import { RefundRequest } from "./refund-data";

type Props = {
  item: RefundRequest;
};

export default function RefundRequestCard({ item }: Props) {
  const [open, setOpen] = useState(Boolean(item.expanded));

  const differenceAmount = Number(item.difference || 0);
  const makingChargesAmount = Number(item.making_charges || 0);

  const totalPayable =
    Math.abs(differenceAmount) + makingChargesAmount;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <RefreshCcw
              className="size-6 text-emerald-600"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900">
              {item.id}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <UserRound
                  className="size-4"
                  aria-hidden="true"
                />
                <span className="max-w-[180px] truncate">
                  {item.customerName}
                </span>
              </span>

              <span aria-hidden="true">•</span>

              <span>{item.phone}</span>

              <span aria-hidden="true">•</span>

              <span>
                Bill:
                <strong className="ml-1 font-medium text-slate-700">
                  {item.billNo}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 lg:justify-end">
          <div className="flex min-w-0 flex-col gap-2 lg:items-end">
            <StatusBadge status={item.status}>
              {item.statusBadge}
            </StatusBadge>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 lg:justify-end">
              <span>
                Purchase:
                <strong className="ml-1 font-medium text-slate-700">
                  {item.purchaseDate}
                </strong>
              </span>

              <span>
                Exchange:
                <strong className="ml-1 font-medium text-slate-700">
                  {item.exchangeDate}
                </strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-controls={`refund-details-${item.id}`}
            aria-label={
              open
                ? "Collapse refund details"
                : "Expand refund details"
            }
            onClick={() => setOpen((v) => !v)}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <ChevronDown
              className={`size-5 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <div
        id={`refund-details-${item.id}`}
        className={`grid transition-all duration-300 ease-in-out ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-5 border-t border-slate-200 p-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <ProductCard
                type="refund"
                title="Refund Product"
                icon={<RotateCcw aria-hidden="true" />}
                items={[
                  ["Code", item.old_product_code],
                  ["Name", item.old_product_name],
                  ["Purity", item.old_purity],
                  ["Net Weight", item.old_net_weight],
                ]}
                value={item.old_value}
              />

              <ProductCard
                type="exchange"
                title="New Product"
                icon={<PackageCheck aria-hidden="true" />}
                items={[
                  ["Code", item.new_product_code],
                  ["Name", item.new_product_name],
                  ["Purity", item.new_purity],
                  ["Net Weight", item.new_net_weight],
                ]}
                value={item.new_value}
              />
            </div>

            <section className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
              <h4 className="text-lg font-semibold text-slate-900">
                Exchange Summary
              </h4>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryBox
                  label="Difference"
                  value={formatCurrency(
                    Math.abs(differenceAmount)
                  )}
                  valueClass={
                    differenceAmount < 0
                      ? "text-red-600"
                      : "text-emerald-600"
                  }
                />

                <SummaryBox
                  label="Making Charges"
                  value={formatCurrency(
                    makingChargesAmount
                  )}
                  valueClass={
                    makingChargesAmount === 0
                      ? "text-emerald-600"
                      : "text-orange-600"
                  }
                />

                <SummaryBox
                  label="Total Payable"
                  value={formatCurrency(totalPayable)}
                  valueClass="text-purple-600"
                />

                <div className="rounded-xl bg-white p-4">
                  <p className="text-sm text-slate-500">
                    Status
                  </p>

                  <div className="mt-2">
                    <StatusBadge status={item.status}>
                      {formatStatus(item.status)}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  status,
  children,
}: {
  status: RefundRequest["status"];
  children: React.ReactNode;
}) {
  const styles: Record<
    RefundRequest["status"],
    string
  > = {
    approved:
      "bg-emerald-100 text-emerald-700",
    processing:
      "bg-blue-100 text-blue-700",
    pending:
      "bg-orange-100 text-orange-700",
    rejected:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[status]}`}
    >
      {children}
    </span>
  );
}

function ProductCard({
  title,
  icon,
  items,
  value,
  type,
}: {
  title: string;
  icon: React.ReactNode;
  items: [
    string,
    string | number | null | undefined
  ][];
  value: string | number | null | undefined;
  type: "refund" | "exchange";
}) {
  const refund = type === "refund";

  return (
    <section
      className={`rounded-2xl border p-5 ${
        refund
          ? "border-red-200 bg-red-50"
          : "border-emerald-200 bg-emerald-50"
      }`}
    >
      <div
        className={`flex items-center gap-2 text-base font-semibold ${
          refund
            ? "text-red-700"
            : "text-emerald-700"
        }`}
      >
        <span
          className="flex size-6 items-center justify-center"
          aria-hidden="true"
        >
          {icon}
        </span>

        <h4>{title}</h4>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[110px_1fr] gap-3 items-start"
          >
            <dt className="text-slate-500">
              {label}
            </dt>

            <dd
              className="break-words text-right font-medium text-slate-900"
              title={String(value ?? "-")}
            >
              {value ?? "-"}
            </dd>
          </div>
        ))}
      </dl>

      <div
        className={`mt-5 border-t pt-4 ${
          refund
            ? "border-red-200"
            : "border-emerald-200"
        }`}
      >
        <p
          className={`text-lg font-semibold ${
            refund
              ? "text-red-600"
              : "text-emerald-600"
          }`}
        >
          {formatCurrency(value)}
        </p>
      </div>
    </section>
  );
}

function SummaryBox({
  label,
  value,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 truncate text-base font-semibold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function formatCurrency(
  value:
    | string
    | number
    | null
    | undefined
) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatStatus(
  status: RefundRequest["status"]
) {
  return status.replace("_", " ");
}