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
  placeholder = "Search by name...",
}: Props) {
  return (
    <div className="rounded-[26px] border border-[#E6E8ED] bg-white p-[10px] shadow-[0px_2px_10px_rgba(15,23,42,0.02)]">
      <div className="flex h-[52px] items-center gap-3 rounded-[18px] bg-[#F7F7F8] px-4 sm:h-[56px] sm:px-5">
        <Search className="h-[18px] w-[18px] text-[#8B94A7]" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#8B94A7] sm:text-[16px]"
        />
      </div>
    </div>
  );
}