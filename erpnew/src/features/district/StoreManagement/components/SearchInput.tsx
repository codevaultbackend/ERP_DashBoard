"use client";

import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: Props) {
  return (
    <div
      className={`flex h-[48px] min-w-0 flex-1 items-center gap-3 rounded-erp-full bg-[#F4F4F5] px-4 ${className}`}
    >
      <Search className="h-5 w-5 shrink-0 text-[#9CA3AF]" strokeWidth={2} />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full bg-transparent font-erp text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-erp-text outline-none placeholder:text-erp-placeholder"
      />
    </div>
  );
}