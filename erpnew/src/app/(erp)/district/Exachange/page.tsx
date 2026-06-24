"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getExchangeRefundData } from "@/features/retail/refund/api/exchange-api";

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
        Array.isArray(res?.data)
          ? res.data.map(mapExchangeToRefundRequest)
          : []
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
        iconType: "total",
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
    const query = search.trim().toLowerCase();
    const selectedDate = normalizeDateToISO(date.trim());

    return requests.filter((item) => {
      const matchesSearch =
        !query ||
        item.customerName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.billNo.toLowerCase().includes(query) ||
        (item.productName || "")
          .toLowerCase()
          .includes(query) ||

        (item.productCode || "")
          .toLowerCase()
          .includes(query) ||

        (item.newProductName || "")
          .toLowerCase()
          .includes(query) ||

        (item.newProductCode || "")
          .toLowerCase()
          .includes(query)

      const matchesMonth =
        month === "Select Month" ||
        getMonthName(item.exchangeDate) === month ||
        getMonthName(item.purchaseDate) === month;

      const matchesDate =
        !selectedDate ||
        normalizeDisplayDate(item.exchangeDate) === selectedDate ||
        normalizeDisplayDate(item.purchaseDate) === selectedDate;

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
            className="inline-flex h-[56px] items-center justify-center gap-3 rounded-full bg-[#02031A] px-7 text-[16px] font-medium text-white shadow-erp-sm max-sm:w-full"
          >
            <Plus className="h-5 w-5" />
            New Exchange
          </button>
        </section>

        <section className="mt-4">
          <RefundPolicyCard points={refundPolicyPoints} />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[120px] animate-pulse rounded-erp-lg bg-white shadow-erp-card"
              />
            ))
            : exchangeStats.map((item) => (
              <RefundMetricCard key={item.title} item={item} />
            ))}
        </section>

        <section className="mt-4">
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
          <div className="mt-6 rounded-erp-lg border border-erp-danger-soft bg-white px-6 py-8 text-center text-erp-danger shadow-erp-card">
            {pageError}
          </div>
        ) : null}

        <section className="mt-6 space-y-5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[130px] animate-pulse rounded-erp-lg bg-white shadow-erp-card"
              />
            ))
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((item) => (
              <RefundRequestCard key={item.id} item={item} />
            ))
          ) : (
            <div className="rounded-erp-lg border border-erp-border bg-white py-12 text-center text-erp-muted shadow-erp-card">
              No records found
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



function safe(value?: string) {
  return (value || "").toLowerCase();
}

function safeText(value: any) {
  return value ? String(value) : "--";
}

function formatDate(value?: string) {
  if (!value) return "--";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "--" : d.toISOString().slice(0, 10);
}

function formatCurrency(value: any) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatWeight(value: any) {
  const num = Number(value);
  return Number.isFinite(num) ? `${num} g` : "--";
}

function normalizeDateToISO(value: string) {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function getMonthName(value: string) {
  const d = new Date(value);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-US", { month: "long" });
}