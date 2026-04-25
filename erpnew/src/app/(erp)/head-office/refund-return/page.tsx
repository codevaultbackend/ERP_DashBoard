"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import RefundMetricCard from "../../../../features/retail/refund/RefundMetricCard";
import RefundPolicyCard from "../../../../features/retail/refund/RefundPolicyCard";
import RefundRequestCard from "../../../../features/retail/refund/RefundRequestCard";
import RefundSearchFilters from "../../../../features/retail/refund/RefundSearchFilters";
import { refundPolicyPoints, refundRequests, refundStats } from "../../../../features/retail/data/refund-data";

export default function RefundReturnPage() {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("Select Month");
  const [date, setDate] = useState("");

  const filteredRequests = useMemo(() => {
    return refundRequests.filter((item) => {
      const matchesSearch =
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.billNo.toLowerCase().includes(search.toLowerCase()) ||
        item.productName.toLowerCase().includes(search.toLowerCase());

      const matchesMonth =
        month === "Select Month" ||
        new Date(item.refundDate).toLocaleString("en-US", { month: "long" }) === month;

      const normalizedDate = date.trim();
      const matchesDate =
        !normalizedDate ||
        item.refundDate === normalizeDateToISO(normalizedDate) ||
        item.purchaseDate === normalizeDateToISO(normalizedDate);

      return matchesSearch && matchesMonth && matchesDate;
    });
  }, [search, month, date]);

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

        <button className="inline-flex h-[56px] items-center justify-center gap-3 rounded-full bg-[#02031A] px-6 text-[16px] font-medium text-white shadow-[0px_10px_24px_rgba(2,3,26,0.18)]">
          <Plus className="h-5 w-5" />
          New Refund
        </button>
      </div>

      <div className="mt-8">
        <RefundPolicyCard points={refundPolicyPoints} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
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

      <div className="mt-6 space-y-5">
        {filteredRequests.map((item) => (
          <RefundRequestCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function normalizeDateToISO(value: string) {
  const parts = value.split("-");
  if (parts.length !== 3) return value;

  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return value;

  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}