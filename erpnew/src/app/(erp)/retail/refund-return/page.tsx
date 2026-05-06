"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

import { getExchangeRefundData } from "@/features/retail/refund/api/exchange-api";

export default function RefundReturnPage() {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("Select Month");
  const [date, setDate] = useState("");

  const [stats, setStats] = useState<RefundStat[]>([]);
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);

  async function fetchExchangeData(force = false) {
    try {
      setError("");
      force ? setRefreshing(true) : setLoading(true);

      const result = await getExchangeRefundData(force);

      setStats(result.stats || []);
      setRequests(result.requests || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load exchange data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchExchangeData();
  }, []);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedDate = normalizeDateToISO(date.trim());

    return requests.filter((item) => {
      const matchesSearch =
        !query ||
        item.customerName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.billNo.toLowerCase().includes(query) ||
        item.productName.toLowerCase().includes(query) ||
        item.productCode.toLowerCase().includes(query) ||
        item.newProductName.toLowerCase().includes(query) ||
        item.newProductCode.toLowerCase().includes(query);

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
  }, [search, month, date, requests]);

  return (
    <>
      <main className="min-w-0 flex-1 bg-erp-page font-erp">
        <section className="w-full pb-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <h1 className="text-[34px] font-semibold leading-[42px] tracking-[-0.04em] text-[#111827] sm:text-[42px] sm:leading-[50px]">
                Exchange Management
              </h1>

              <p className="mt-2 text-[16px] font-normal leading-[24px] text-[#5B6475] sm:text-[18px]">
                Track product exchanges with automatic deduction calculation
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => fetchExchangeData(true)}
                disabled={loading || refreshing}
                className="inline-flex h-[56px] items-center justify-center gap-3 rounded-full border border-erp-border bg-white px-6 text-[16px] font-medium text-erp-primary shadow-erp-card transition hover:bg-erp-primary-soft disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setOpenModal(true)}
                className="inline-flex h-[56px] items-center justify-center gap-3 rounded-full bg-[#02031A] px-6 text-[16px] font-medium text-white shadow-[0px_10px_24px_rgba(2,3,26,0.18)]"
              >
                <Plus className="h-5 w-5" />
                Create Exchange
              </button>
            </div>
          </div>

          <div className="mt-8">
            <RefundPolicyCard points={refundPolicyPoints} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[132px] animate-pulse rounded-erp-lg bg-white shadow-erp-card"
                />
              ))
              : stats.map((item) => (
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

          {error ? (
            <div className="mt-6 rounded-erp-lg border border-erp-danger-soft bg-white px-6 py-10 text-center shadow-erp-card">
              <h2 className="text-[18px] font-semibold text-erp-heading">
                Unable to load exchanges
              </h2>
              <p className="mt-2 text-[14px] text-erp-muted">{error}</p>
              <button
                type="button"
                onClick={() => fetchExchangeData(true)}
                className="mt-5 h-[42px] rounded-erp-sm bg-erp-primary px-5 text-[14px] font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="mt-6 space-y-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[190px] animate-pulse rounded-erp-lg bg-white shadow-erp-card"
                />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="mt-6 rounded-erp-lg border border-erp-border bg-white px-6 py-12 text-center shadow-erp-card">
              <h2 className="text-[18px] font-semibold text-erp-heading">
                No exchanges found
              </h2>
              <p className="mt-2 text-[14px] text-erp-muted">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {filteredRequests.map((item) => (
                <RefundRequestCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateRefundModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={async () => {
          setOpenModal(false);
          await fetchExchangeData(true);
        }}
      />
    </>
  );
}

function normalizeDateToISO(value: string) {
  if (!value) return "";

  const parts = value.split("-");
  if (parts.length !== 3) return value;

  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return value;

  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function normalizeDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 10);
}

function getMonthName(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-US", {
    month: "long",
  });
}