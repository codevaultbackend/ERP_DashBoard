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
      <span className="inline-flex h-[34px] items-center justify-center gap-2 rounded-erp-full bg-erp-success px-5 text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-white sm:min-w-[130px]">
        <Truck className="h-4 w-4" />
        Dispatch
      </span>
    );
  }

  if (status === "approved" || status === "completed") {
    return (
      <span className="inline-flex h-[26px] items-center rounded-erp-full bg-erp-success-soft px-3 text-[13px] font-medium leading-[18px] tracking-[-0.02em] text-[#15803D]">
        approved
      </span>
    );
  }

  return (
    <span className="inline-flex h-[26px] items-center rounded-erp-full bg-erp-border-soft px-3 text-[13px] font-medium leading-[18px] tracking-[-0.02em] text-erp-muted">
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
        "inline-flex h-[24px] items-center rounded-erp-full border px-3 text-[13px] font-normal leading-[18px] tracking-[-0.02em] capitalize",
        cls,
      ].join(" ")}
    >
      {key}
    </span>
  );
}

type Props = {
  item: RequestCardData;
  compact?: boolean;
  onDispatch?: (item: RequestCardData) => void;
};

export default function StockRequestCard({ item, onDispatch }: Props) {
  const dispatched = isDispatched(item);
  const products = Array.isArray(item?.products) ? item.products : [];

  const handleClick = () => {
    if (dispatched) return;
    onDispatch?.(item);
  };

  return (
    <article
      role={onDispatch && !dispatched ? "button" : undefined}
      tabIndex={onDispatch && !dispatched ? 0 : -1}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !dispatched) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={[
        "w-full rounded-erp-xl border bg-erp-card px-5 py-5 text-left shadow-erp-card transition sm:px-6 sm:py-6",
        onDispatch && !dispatched
          ? "cursor-pointer border-erp-border hover:-translate-y-[1px] hover:border-[#CBD5E1]"
          : "border-erp-border",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-[20px] font-semibold leading-[26px] tracking-[-0.035em] text-erp-heading">
            Request #{item?.id ?? "-"}
          </h3>

          {dispatched ? (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium leading-[18px] tracking-[-0.02em] text-erp-success">
              <CheckCircle2 className="h-4 w-4" />
              Already dispatched
            </p>
          ) : null}
        </div>

        <StatusBadge item={item} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <div>
          <p className="text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-erp-muted">
            Priority:
          </p>
          <div className="mt-2">
            <PriorityBadge priority={item?.priority} />
          </div>
        </div>

        <div>
          <p className="text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-erp-muted">
            Created:
          </p>
          <p className="mt-2 text-[16px] font-medium leading-[22px] tracking-[-0.02em] text-[#2C3444]">
            {item?.created || "-"}
          </p>
        </div>
      </div>

      <div className="mt-7">
        <p className="text-[15px] font-semibold leading-[20px] tracking-[-0.02em] text-[#2C3444]">
          Requested Products:
        </p>

        {products.length === 0 ? (
          <div className="mt-3 rounded-erp-sm bg-erp-card-soft px-4 py-3 text-[14px] font-medium leading-[20px] text-erp-muted">
            No products found
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {products.map((product, index) => (
              <div
                key={`${product?.name || "product"}-${index}`}
                className="flex min-h-[64px] items-center justify-between gap-3 rounded-erp-sm bg-erp-card-soft px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-medium leading-[20px] tracking-[-0.02em] text-erp-heading">
                    {product?.name || "Unnamed Product"}
                  </p>
                  <p className="mt-1 text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#4A5565]">
                    Qty: {product?.qty ?? 0}
                  </p>
                </div>

                {!dispatched ? (
                  <ChevronDown className="h-[18px] w-[18px] shrink-0 text-black" />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}