"use client";

import { ChevronDown } from "lucide-react";
import type { RequestCardData } from "@/app/(erp)/retail/request/page";

function StatusBadge({
  status,
  onDispatch,
}: {
  status: RequestCardData["status"];
  onDispatch?: () => void;
}) {
  if (status === "approved") {
    return (
      <span className="inline-flex h-[30px] items-center rounded-full bg-[#DDF7D8] px-4 text-[13px] font-semibold text-[#1F9D36] sm:text-[14px]">
        approved
      </span>
    );
  }

  if (status === "dispatch") {
    return (
      <button
        type="button"
        onClick={onDispatch}
        className="inline-flex h-[40px] items-center justify-center rounded-full bg-[#18B91F] px-6 text-[15px] font-medium text-white sm:h-[42px] sm:px-8 sm:text-[18px]"
      >
        Dispatch
      </button>
    );
  }

  return (
    <span className="inline-flex h-[30px] items-center rounded-full bg-[#EEF2F7] px-4 text-[13px] font-semibold text-[#475467] sm:text-[14px]">
      pending
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className="inline-flex h-[30px] items-center rounded-full border border-[#F5C27B] bg-[#FFF3E2] px-3 text-[13px] font-medium capitalize text-[#F59E0B] sm:text-[14px]">
      {priority}
    </span>
  );
}

type Props = {
  item: RequestCardData;
  onDispatch?: () => void;
  compact?: boolean;
};

export default function StockRequestCard({
  item,
  onDispatch,
}: Props) {
  return (
    <div className="rounded-[24px] sm:rounded-[30px] border border-[#E4E7EC] bg-[#FCFCFD] p-4 shadow-[0px_4px_14px_rgba(15,23,42,0.035)] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <h3 className="text-[20px] font-semibold tracking-[-0.03em] text-[#172033] sm:text-[22px]">
          Request #{item.id}
        </h3>

        <StatusBadge status={item.status} onDispatch={onDispatch} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="text-[16px] font-medium text-[#667085] sm:text-[18px]">
            Priority:
          </p>
          <div className="mt-2">
            <PriorityBadge priority={item.priority} />
          </div>
        </div>

        <div>
          <p className="text-[16px] font-medium text-[#667085] sm:text-[18px]">
            Created:
          </p>
          <p className="mt-2 text-[16px] font-semibold text-[#2C3444] sm:text-[18px]">
            {item.created}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[16px] font-semibold text-[#2C3444] sm:text-[18px]">
          Requested Products:
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {item.products.map((product, index) => (
            <div
              key={`${product.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-[16px] bg-[#F7F8FA] px-4 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-[#111827] sm:text-[16px]">
                  {product.name}
                </p>
                <p className="mt-1 text-[15px] font-medium text-[#667085] sm:text-[16px]">
                  Qty: {product.qty}
                </p>
              </div>

              <ChevronDown className="h-[18px] w-[18px] shrink-0 text-[#111827]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}