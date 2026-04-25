"use client";

import { Search } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex h-[74px] w-full items-center gap-4 rounded-[32px] border border-[#E2E8F0] bg-white px-6 shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)]">
      <Search className="h-6 w-6 shrink-0 text-[#94A3B8]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[15px] font-normal text-[#0F172A] outline-none placeholder:text-[#94A3B8] md:text-[16px]"
      />
    </div>
  );
}