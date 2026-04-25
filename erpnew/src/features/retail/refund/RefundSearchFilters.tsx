"use client";

import { CalendarDays, ChevronDown, Search } from "lucide-react";

type Props = {
  search: string;
  setSearch: (value: string) => void;
  month: string;
  setMonth: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
};

const months = [
  "Select Month",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function RefundSearchFilters({
  search,
  setSearch,
  month,
  setMonth,
  date,
  setDate,
}: Props) {
  return (
    <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-[10px] shadow-[0px_2px_10px_rgba(15,23,42,0.02)]">
      <div className="flex flex-col gap-3 xl:flex-row">
        <div className="flex h-[56px] flex-1 items-center gap-3 rounded-[18px] bg-[#F7F7F8] px-4 sm:px-5">
          <Search className="h-[18px] w-[18px] text-[#8B94A7]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="h-full w-full bg-transparent text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#8B94A7] sm:text-[16px]"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:w-auto">
          <div className="flex h-[56px] min-w-[160px] items-center gap-3 rounded-[18px] bg-[#F7F7F8] px-4">
            <CalendarDays className="h-[18px] w-[18px] text-[#8B94A7]" />
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="dd-mm-yyyy"
              className="h-full w-full bg-transparent text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#A0A7B4]"
            />
          </div>

          <div className="relative min-w-[170px]">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-[56px] w-full appearance-none rounded-[18px] bg-[#F7F7F8] px-4 pr-10 text-[15px] font-medium text-[#111827] outline-none"
            >
              {months.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#111827]" />
          </div>
        </div>
      </div>
    </div>
  );
}