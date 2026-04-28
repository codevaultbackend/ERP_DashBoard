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

  const loadExchangeDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const res = await getExchangeDashboard();

      setStats(res?.stats || EMPTY_STATS);

      const apiRows = Array.isArray(res?.data) ? res.data : [];
      setRequests(apiRows.map(mapExchangeToRefundRequest));
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

  const refundStats = useMemo<RefundStat[]>(() => {
    return [
      {
        title: "Total Exchanges",
        value: String(stats.total_exchanges || 0),
        iconType: "refund",
        iconWrapClassName: "bg-[#DBEAFE]",
      },
      {
        title: "Within 7 Days",
        value: String(stats.within_7_days || 0),
        iconType: "approved",
        iconWrapClassName: "bg-[#DCFCE7]",
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
        iconWrapClassName: "bg-[#F3E8FF]",
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
    <div className="w-full pb-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[42px]">
            Refund &amp; Return
          </h1>
          <p className="mt-2 text-[18px] text-[#5B6475]">
            Track product refunds with automatic deduction calculation
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="inline-flex h-[56px] items-center justify-center gap-3 rounded-full bg-[#02031A] px-6 text-[16px] font-medium text-white shadow-[0px_10px_24px_rgba(2,3,26,0.18)]"
        >
          <Plus className="h-5 w-5" />
          New Refund
        </button>
        <CreateRefundModal
          open={openModal}
          onClose={() => setOpenModal(false)}
        />
      </div>

      <div className="mt-8">
        <RefundPolicyCard points={refundPolicyPoints} />
      </div>

      <div className="mt-8 grid grid-cols-4 gap-4 max-[768px]:grid-cols-2 2xl:grid-cols-4">
        {refundStats.map((item) => (
          <RefundMetricCard key={item.title} item={item} />
        ))}
      </div>

      <div className="mt-8">
        <RefundSearchFilters
          search={search}
          setSearch={setSearch}
          month={month}
          setMonth={setMonth}
          date={date}
          setDate={setDate}
        />
      </div>

      {pageError ? (
        <div className="mt-6 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
          {pageError}
        </div>
      ) : null}

      <div className="mt-6 space-y-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[126px] animate-pulse rounded-[30px] border border-[#E5E7EB] bg-white"
            />
          ))
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((item) => (
            <RefundRequestCard key={item.id} item={item} />
          ))
        ) : (
          <div className="rounded-[30px] border border-dashed border-[#D0D5DD] bg-white p-8 text-center text-[15px] font-medium text-[#667085]">
            No exchange records found.
          </div>
        )}
      </div>
    </div>
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
    refundReason: within7Days ? "Within 7 days exchange" : "After 7 days exchange",
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

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return date.toISOString().slice(0, 10);
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
  return `${Number(value).toFixed(3)} g`;
}

function safeText(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
}