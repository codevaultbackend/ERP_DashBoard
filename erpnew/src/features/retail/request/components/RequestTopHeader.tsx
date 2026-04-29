"use client";

import { FileText } from "lucide-react";

type Props = {
  onOpenNewRequest: () => void;
};

export default function RequestTopHeader({ onOpenNewRequest }: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.045em] text-erp-heading sm:text-[36px] sm:leading-[44px]">
          Stock Requests
        </h1>

        <p className="mt-1 text-[16px] font-normal leading-[24px] tracking-[-0.02em] text-erp-muted sm:text-[18px]">
          Queens Store - Request stock from Karnal District
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenNewRequest}
        className="inline-flex h-[46px] w-full shrink-0 items-center justify-center gap-2 rounded-erp-full bg-erp-dark px-6 text-[15px] font-medium leading-[20px] tracking-[-0.02em] text-white transition hover:opacity-95 active:scale-[0.99] sm:w-auto sm:text-[16px]"
      >
        <FileText className="h-[17px] w-[17px]" />
        <span>New Stock Request</span>
      </button>
    </div>
  );
}