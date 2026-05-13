"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function FinanceSearchBar({
  value,
  onChange,
  placeholder = "Search by name, store code...",
}: Props) {
  return (
    <div className="w-full rounded-[31px] border border-[#E5E7EB] bg-white p-[12px] shadow-[0px_4px_14px_rgba(15,23,42,0.04)]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-[24px] top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-[#94A3B8]" />

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-[58px] w-full rounded-[24px] border border-transparent bg-[#F8FAFC] pl-[60px] pr-5 text-[16px] font-medium leading-[20px] tracking-[-0.03em] text-[#111827] outline-none placeholder:text-[#8B95A5] focus:bg-white focus:ring-2 focus:ring-[#E0E7FF]"
        />
      </div>
    </div>
  );
}