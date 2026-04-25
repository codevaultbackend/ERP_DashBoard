"use client";

import { FileText } from "lucide-react";

type Props = {
  onCreate: () => void;
};

export default function EmptyStockRequests({ onCreate }: Props) {
  return (
    <div>
      <h2 className="mb-4 text-[26px] font-semibold tracking-[-0.03em] text-[#172033]">
        My Stock Requests
      </h2>

      <div className="rounded-[34px] border border-[#E4E7EC] bg-[#FCFCFD] px-5 py-10 shadow-[0px_4px_14px_rgba(15,23,42,0.035)] sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <FileText className="h-[78px] w-[78px] text-[#98A2B3] stroke-[1.6]" />

          <h3 className="mt-8 text-[24px] font-semibold text-[#172033] sm:text-[26px]">
            No Stock Requests
          </h3>

          <p className="mt-3 text-[18px] text-[#556274]">
            You haven&apos;t made any stock requests yet
          </p>

          <button
            type="button"
            onClick={onCreate}
            className="mt-10 h-[54px] w-full rounded-full bg-[#02051B] text-[16px] font-medium text-white transition hover:opacity-95 active:scale-[0.99]"
          >
            Create Request
          </button>
        </div>
      </div>
    </div>
  );
}