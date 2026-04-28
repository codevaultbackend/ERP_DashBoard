"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
  count?: number;
  onRequestStock: () => void;
};

export default function LowStockAlert({ count = 0, onRequestStock }: Props) {
  if (count <= 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[#FF2424] bg-[#FFECEC] px-[18px] py-[14px] sm:rounded-[30px] sm:px-[24px] sm:py-[16px] xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-4">
        <AlertTriangle className="h-[28px] w-[28px] text-[#F15A24] stroke-[1.8] sm:h-[30px] sm:w-[30px]" />

        <div>
          <h3 className="text-[15px] font-semibold text-[#7E2A0C] sm:text-[16px]">
            Low Stock Alert
          </h3>
          <p className="mt-1 text-[13px] leading-[1.3] text-[#CA3500] sm:text-[14px]">
            {count} item(s) are running low. Request stock from district manager.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRequestStock}
        className="inline-flex h-[38px] shrink-0 items-center justify-center rounded-full bg-[#FF2424] px-6 text-[13px] font-medium text-white sm:h-[40px] sm:px-8 sm:text-[14px]"
      >
        Request Stock
      </button>
    </div>
  );
}