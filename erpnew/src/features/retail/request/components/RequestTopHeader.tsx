"use client";

import { FileText } from "lucide-react";

type Props = {
  onOpenNewRequest: () => void;
};

export default function RequestTopHeader({ onOpenNewRequest }: Props) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <h1 className="text-[30px] font-semibold leading-[36px] text-[#101828] sm:text-[38px] sm:leading-[44px] xl:text-[56px] xl:leading-[60px]">
          Stock Requests
        </h1>
        <p className="mt-1 text-[14px] leading-[22px] font-[400] text-[#4A5565] sm:text-[16px] sm:leading-[24px]">
          Queens Store - Request stock from Karnal District
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenNewRequest}
        className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-full bg-[#030213] px-5 text-[14px] font-medium text-white shadow-none sm:h-[40px] sm:w-auto sm:px-6 sm:text-[16px]"
      >
        <FileText className="h-[17px] w-[17px]" />
        <span>New Stock Request</span>
      </button>
    </div>
  );
}