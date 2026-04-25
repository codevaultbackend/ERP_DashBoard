"use client";

import { ChevronDown, ChevronUp, RefreshCcw, UserRound } from "lucide-react";
import { useState } from "react";
import { RefundRequest } from "./refund-data";

type Props = {
  item: RefundRequest;
};

export default function RefundRequestCard({ item }: Props) {
  const [open, setOpen] = useState(!!item.expanded);

  return (
    <div className="rounded-[30px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0px_2px_10px_rgba(15,23,42,0.02)] sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[#DCFCE7] sm:h-[52px] sm:w-[52px] sm:rounded-[16px]">
            <RefreshCcw className="h-6 w-6 text-[#16A34A]" strokeWidth={2.1} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#111827]">
                {item.id}
              </h3>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-[#667085] sm:text-[15px]">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" />
                {item.customerName}
              </span>
              <span>{item.phone}</span>
              <span>Bill: {item.billNo}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 xl:items-end">
          <span className="inline-flex rounded-full bg-[#DDF7E4] px-4 py-1.5 text-[14px] font-medium text-[#15803D]">
            {item.statusBadge}
          </span>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[14px] text-[#667085] sm:text-[15px]">
            <span>Purchase: {item.purchaseDate}</span>
            <span>Refund: {item.refundDate}</span>
          </div>
        </div>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="ml-auto flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-[#F7F7F8] text-[#111827] xl:ml-0"
        >
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-[24px] border border-[#F5B6B6] bg-[#FFF7F7] px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 text-[17px] font-semibold text-[#B42318]">
                <span>↩</span>
                <h4>Refund Product</h4>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[14px] sm:text-[15px]">
                <LabelValue label="Code:" value={item.productCode} />
                <LabelValue label="Name:" value={item.productName} />
                <LabelValue label="Metal:" value={item.metal} />
                <LabelValue label="Weight:" value={item.weight} />
              </div>

              <div className="mt-4 border-t border-[#F3B2B2] pt-3">
                <div className="flex items-center justify-between text-[15px] font-medium text-[#667085]">
                  <span>Value:</span>
                  <span className="text-[16px] font-semibold text-[#EF4444]">
                    {item.originalValue}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#B7E8C7] bg-[#F5FFF8] px-4 py-4 sm:px-5">
              <div className="flex items-center gap-2 text-[17px] font-semibold text-[#166534]">
                <span>₹</span>
                <h4>Refund Details</h4>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[14px] sm:text-[15px]">
                <LabelValue label="Reason:" value={item.refundReason} />
                <LabelValue label="Method:" value={item.refundMethod} />
                <LabelValue label="Refund:" value={item.refundAmount} />
                <LabelValue label="Status:" value={formatStatus(item.status)} />
              </div>

              <div className="mt-4 border-t border-[#B7E8C7] pt-3">
                <div className="flex items-center justify-between text-[15px] font-medium text-[#667085]">
                  <span>Final Refund:</span>
                  <span className="text-[16px] font-semibold text-[#16A34A]">
                    {item.finalRefund}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E9D5FF] bg-[#FBF7FF] px-4 py-4 sm:px-5">
            <h4 className="text-[18px] font-semibold text-[#111827]">Refund Summary</h4>

            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <SummaryBox label="Original Value" value={item.originalValue} valueClassName="text-[#111827]" />
              <SummaryBox label="Deduction" value={item.deduction} valueClassName={item.deduction === "FREE" ? "text-[#16A34A]" : "text-[#F97316]"} />
              <SummaryBox label="Final Refund" value={item.finalRefund} valueClassName="text-[#9333EA]" />
              <div className="rounded-[18px] bg-white/80 p-3.5">
                <p className="text-[14px] text-[#667085]">Status</p>
                <div className="mt-2">
                  <span className={statusPill(item.status)}>{formatStatus(item.status)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <>
      <p className="text-[#667085]">{label}</p>
      <p className="text-right font-medium text-[#111827]">{value}</p>
    </>
  );
}

function SummaryBox({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-[18px] bg-white/80 p-3.5">
      <p className="text-[14px] text-[#667085]">{label}</p>
      <p className={["mt-1 text-[16px] font-semibold", valueClassName].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function formatStatus(status: RefundRequest["status"]) {
  if (status === "approved") return "approved";
  if (status === "processing") return "processing";
  if (status === "pending") return "pending";
  return "rejected";
}

function statusPill(status: RefundRequest["status"]) {
  if (status === "approved") {
    return "inline-flex rounded-full bg-[#DDF7E4] px-3 py-1 text-[13px] font-medium capitalize text-[#15803D]";
  }

  if (status === "processing") {
    return "inline-flex rounded-full bg-[#E0ECFF] px-3 py-1 text-[13px] font-medium capitalize text-[#2563EB]";
  }

  if (status === "pending") {
    return "inline-flex rounded-full bg-[#FFF1E7] px-3 py-1 text-[13px] font-medium capitalize text-[#EA580C]";
  }

  return "inline-flex rounded-full bg-[#FEE2E2] px-3 py-1 text-[13px] font-medium capitalize text-[#B91C1C]";
}