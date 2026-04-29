"use client";

import { FileText } from "lucide-react";

type Props = {
  onCreate: () => void;
};

export default function EmptyStockRequests({ onCreate }: Props) {
  return (
    <div className="rounded-erp-2xl border border-erp-border bg-erp-card px-5 py-12 shadow-erp-card sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <FileText className="h-[76px] w-[76px] text-[#98A2B3] stroke-[1.6]" />

        <h3 className="mt-8 text-[22px] font-semibold leading-[28px] tracking-[-0.04em] text-erp-heading sm:text-[24px] sm:leading-[30px]">
          No Stock Requests
        </h3>

        <p className="mt-4 text-[16px] font-normal leading-[24px] tracking-[-0.02em] text-erp-muted sm:text-[18px]">
          You haven&apos;t made any stock requests yet
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-10 h-[46px] w-full rounded-erp-full bg-erp-dark px-6 text-[15px] font-medium leading-[20px] tracking-[-0.02em] text-white transition hover:opacity-95 active:scale-[0.99]"
        >
          Create Request
        </button>
      </div>
    </div>
  );
}