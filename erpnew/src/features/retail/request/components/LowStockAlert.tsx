"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
  count?: number;
  onRequestStock: () => void;
};

export default function LowStockAlert({ count = 2, onRequestStock }: Props) {
  if (count <= 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-erp-xl border border-erp-danger bg-erp-danger-soft px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <AlertTriangle className="h-[31px] w-[31px] shrink-0 text-[#F15A24] stroke-[1.8]" />

        <div className="min-w-0">
          <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.03em] text-[#7E2A0C]">
            Low Stock Alert
          </h3>

          <p className="mt-1 text-[15px] font-normal leading-[22px] tracking-[-0.02em] text-[#CA3500] sm:text-[16px]">
            {count} item(s) are running low. Request stock from district manager.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRequestStock}
        className="inline-flex h-[40px] w-full shrink-0 items-center justify-center rounded-erp-full bg-erp-danger px-7 text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-white transition hover:opacity-95 active:scale-[0.99] sm:w-auto"
      >
        Request Stock
      </button>
    </div>
  );
}