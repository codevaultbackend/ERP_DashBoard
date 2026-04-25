"use client";

import { ChevronDown, Search } from "lucide-react";

type Props = {
  withCategory?: boolean;
};

export default function SearchFilterBar({ withCategory = false }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-[30px] border border-[#E5E7EB] bg-white p-3 shadow-[0px_4px_14px_rgba(15,23,42,0.03)] md:flex-row md:items-center">
      <div className="flex h-[54px] flex-1 items-center rounded-[20px] bg-[#F7F7F7] px-4">
        <Search className="mr-3 h-5 w-5 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Search inventory..."
          className="h-full w-full bg-transparent text-[16px] text-[#374151] outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      {withCategory ? (
        <button
          type="button"
          className="flex h-[54px] min-w-[160px] items-center justify-between rounded-[20px] border border-[#E5E7EB] bg-[#FCFCFD] px-5 text-[16px] font-medium text-[#202020]"
        >
          <span>Category</span>
          <ChevronDown className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}