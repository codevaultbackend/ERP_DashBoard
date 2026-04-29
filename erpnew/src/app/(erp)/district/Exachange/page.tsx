"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import RefundMetricCard from "../../../../features/retail/refund/RefundMetricCard";
import RefundPolicyCard from "../../../../features/retail/refund/RefundPolicyCard";
import RefundRequestCard from "../../../../features/retail/refund/RefundRequestCard";
import RefundSearchFilters from "../../../../features/retail/refund/RefundSearchFilters";
import CreateRefundModal from "../../../../features/retail/refund/CreateRefundModal";

import {
  refundPolicyPoints,
  type RefundRequest,
  type RefundStat,
} from "../../../../features/retail/data/refund-data";

import {
  getExchangeDashboard,
  type ExchangeDashboardItem,
  type ExchangeDashboardStats,
} from "../../../../features/retail/refund/api/exchange-api";

const EMPTY_STATS: ExchangeDashboardStats = {
  total_exchanges: 0,
  within_7_days: 0,
  after_7_days: 0,
  making_charges: 0,
};

export default function RefundReturnPage() {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("Select Month");
  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [stats, setStats] = useState<ExchangeDashboardStats>(EMPTY_STATS);
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const loadExchangeDashboard = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setPageError("");

      const res = await getExchangeDashboard(force);

      setStats(res?.stats || EMPTY_STATS);
      setRequests(
        Array.isArray(res?.data) ? res.data.map(mapExchangeToRefundRequest) : []
      );
    } catch (err: any) {
      setPageError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load exchange dashboard"
      );
      setStats(EMPTY_STATS);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExchangeDashboard();
  }, [loadExchangeDashboard]);

  const exchangeStats = useMemo<RefundStat[]>(() => {
    return [
      {
        title: "Total Exchanges",
        value: String(stats.total_exchanges || 0),
        iconType: "refund",
        iconWrapClassName: "bg-erp-blue-soft",
      },
      {
        title: "Within 7 Days",
        value: String(stats.within_7_days || 0),
        iconType: "approved",
        iconWrapClassName: "bg-erp-success-soft",
      },
      {
        title: "After 7 Days",
        value: String(stats.after_7_days || 0),
        iconType: "pending",
        iconWrapClassName: "bg-[#FFF7ED]",
      },
      {
        title: "Making Charges",
        value: formatCurrency(stats.making_charges || 0),
        iconType: "amount",
        iconWrapClassName: "bg-erp-purple-soft",
      },
    ];
  }, [stats]);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        item.customerName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.billNo.toLowerCase().includes(query) ||
        item.productName.toLowerCase().includes(query);

      const matchesMonth =
        month === "Select Month" ||
        new Date(item.refundDate).toLocaleString("en-US", {
          month: "long",
        }) === month;

      const normalizedDate = date.trim();
      const isoDate = normalizeDateToISO(normalizedDate);

      const matchesDate =
        !normalizedDate ||
        item.refundDate === isoDate ||
        item.purchaseDate === isoDate;

      return matchesSearch && matchesMonth && matchesDate;
    });
  }, [requests, search, month, date]);

  return (
    <>
      <main className="w-full pb-8 font-erp">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="erp-page-title">Exchange Management</h1>
            <p className="mt-1 erp-page-subtitle">
              Track product exchanges with automatic deduction calculation
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="inline-flex h-[48px] w-fit items-center justify-center gap-3 rounded-erp-full bg-erp-dark px-6 text-[15px] font-semibold leading-none tracking-[-0.02em] text-white shadow-erp-card transition hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
            New Exchange
          </button>
        </section>

        <section className="mt-8">
          <RefundPolicyCard points={refundPolicyPoints} />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {exchangeStats.map((item) => (
            <RefundMetricCard key={item.title} item={item} />
          ))}
        </section>

        <section className="mt-8">
          <RefundSearchFilters
            search={search}
            setSearch={setSearch}
            month={month}
            setMonth={setMonth}
            date={date}
            setDate={setDate}
          />
        </section>

        {pageError ? (
          <div className="mt-6 rounded-erp-md border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
            {pageError}
          </div>
        ) : null}

        <section className="mt-6 space-y-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[126px] animate-pulse rounded-erp-xl border border-erp-border bg-white shadow-erp-card"
              />
            ))
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((item) => (
              <RefundRequestCard key={item.id} item={item} />
            ))
          ) : (
            <div className="rounded-erp-xl border border-dashed border-erp-border bg-white p-8 text-center text-[15px] font-medium text-erp-muted shadow-erp-card">
              No exchange records found.
            </div>
          )}
        </section>
      </main>

      <CreateRefundModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={async () => {
          setOpenModal(false);
          await loadExchangeDashboard(true);
        }}
      />
    </>
  );
}

function mapExchangeToRefundRequest(item: ExchangeDashboardItem): RefundRequest {
  const within7Days = Number(item.days_since_purchase || 0) <= 7;
  const purchaseDate = formatDateOnly(item.invoice_date);
  const exchangeDate = formatDateOnly(item.exchange_date);

  return {
    id: `EX-${item.id}`,
    customerName: safeText(item.name),
    phone: safeText(item.phone),
    billNo: safeText(item.invoice_number),
    purchaseDate,
    refundDate: exchangeDate,
    productCode: safeText(item.old_product_code),
    productName: safeText(item.old_product_name),
    metal: safeText(item.old_purity),
    weight: formatWeight(item.old_gross_weight),
    originalValue: formatCurrency(item.old_value),
    refundReason: within7Days
      ? "Within 7 days exchange"
      : "After 7 days exchange",
    refundMethod: "Exchange",
    refundAmount: formatCurrency(item.new_value),
    status: "approved",
    statusBadge: within7Days ? "Within 7 Days" : "After 7 Days",
    finalRefund: formatCurrency(item.difference),
    deduction: formatCurrency(item.making_charges),
    expanded: false,
  };
}

function normalizeDateToISO(value: string) {
  const parts = value.split("-");
  if (parts.length !== 3) return value;

  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return value;

  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function formatDateOnly(value: string) {
  if (!value) return "--";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return "--";

  return parsedDate.toISOString().slice(0, 10);
}

function formatCurrency(value: string | number | null | undefined) {
  const num = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

function formatWeight(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "--";

  const num = Number(value);
  if (!Number.isFinite(num)) return "--";

  return `${num.toFixed(3)} g`;
}

function safeText(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
}