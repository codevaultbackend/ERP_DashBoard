"use client";

import { ChevronDown, CheckCircle2, Truck } from "lucide-react";
import type { RequestCardData } from "@/app/(erp)/retail/request/page";

function normalize(value?: unknown) {
  return String(value || "").trim().toLowerCase();
}

function isDispatched(item: RequestCardData) {
  const status = normalize(item?.status);
  const transferStatus = normalize(item?.raw?.transfer?.status);

  return (
    status === "dispatch" ||
    status === "dispatched" ||
    transferStatus === "in_transit" ||
    transferStatus === "received" ||
    transferStatus === "dispatched"
  );
}

function StatusBadge({ item }: { item: RequestCardData }) {
  const dispatched = isDispatched(item);
  const status = normalize(item?.status) || "pending";

  if (dispatched) {
    return (
      <span className="inline-flex h-[38px] items-center gap-2 rounded-full bg-[#E8F8EE] px-5 text-[14px] font-semibold text-[#10A743]">
        <Truck className="h-4 w-4" />
        Dispatched
      </span>
    );
  }

  if (status === "approved" || status === "completed") {
    return (
      <span className="inline-flex h-[30px] items-center rounded-full bg-[#DDF7D8] px-4 text-[13px] font-semibold capitalize text-[#1F9D36]">
        {status}
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex h-[30px] items-center rounded-full bg-[#FEE2E2] px-4 text-[13px] font-semibold text-[#DC2626]">
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex h-[30px] items-center rounded-full bg-[#EEF2F7] px-4 text-[13px] font-semibold capitalize text-[#475467]">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const key = normalize(priority) || "medium";

  const cls =
    key === "high"
      ? "border-[#FF9B8F] bg-[#FFF1F0] text-[#F04438]"
      : key === "low"
      ? "border-[#86EFAC] bg-[#F0FDF4] text-[#16A34A]"
      : "border-[#F5C27B] bg-[#FFF3E2] text-[#F59E0B]";

  return (
    <span
      className={[
        "inline-flex h-[28px] items-center rounded-full border px-3 text-[13px] font-medium capitalize",
        cls,
      ].join(" ")}
    >
      {key}
    </span>
  );
}

type Props = {
  item: RequestCardData;
  onDispatch?: (item: RequestCardData) => void;
};

export default function StockRequestCard({ item, onDispatch }: Props) {
  const dispatched = isDispatched(item);
  const products = Array.isArray(item?.products) ? item.products : [];

  const handleClick = () => {
    if (dispatched) return;

    if (!onDispatch) {
      console.warn("StockRequestCard: onDispatch prop is missing", item);
      return;
    }

    onDispatch(item);
  };

  return (
    <div
      role="button"
      tabIndex={dispatched ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !dispatched) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={[
        "w-full rounded-[28px] border bg-white p-5 text-left shadow-[0px_8px_24px_rgba(15,23,42,0.045)] transition sm:p-6",
        dispatched
          ? "cursor-default border-[#D7F4DF] bg-[#FCFFFD]"
          : "cursor-pointer border-[#E4E7EC] hover:-translate-y-[1px] hover:border-[#C9D2E0] hover:shadow-[0px_14px_34px_rgba(15,23,42,0.08)]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-[19px] font-semibold tracking-[-0.02em] text-[#111827] sm:text-[21px]">
            Request #{item?.id ?? "-"}
          </h3>

          {dispatched && (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-[#12A150]">
              <CheckCircle2 className="h-4 w-4" />
              This request is already dispatched
            </p>
          )}
        </div>

        <StatusBadge item={item} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <div>
          <p className="text-[15px] font-medium text-[#667085]">Priority:</p>
          <div className="mt-2">
            <PriorityBadge priority={item?.priority} />
          </div>
        </div>

        <div>
          <p className="text-[15px] font-medium text-[#667085]">Created:</p>
          <p className="mt-2 text-[15px] font-semibold text-[#2C3444]">
            {item?.created || "-"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[15px] font-semibold text-[#2C3444]">
          Requested Products:
        </p>

        {products.length === 0 ? (
          <div className="mt-3 rounded-[16px] bg-[#F7F8FA] px-4 py-3 text-[14px] font-medium text-[#667085]">
            No products found
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {products.map((product, index) => (
              <div
                key={`${product?.name || "product"}-${index}`}
                className="flex items-center justify-between gap-3 rounded-[16px] bg-[#F7F8FA] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-[#111827]">
                    {product?.name || "Unnamed Product"}
                  </p>
                  <p className="mt-1 text-[14px] font-medium text-[#667085]">
                    Qty: {product?.qty ?? 0}
                  </p>
                </div>

                {!dispatched && (
                  <ChevronDown className="h-[18px] w-[18px] shrink-0 text-[#111827]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}