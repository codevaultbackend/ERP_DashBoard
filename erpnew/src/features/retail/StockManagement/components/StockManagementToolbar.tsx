"use client";

import Link from "next/link";
import { ChevronDown, FileText, Plus, Search, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type StockManagementToolbarProps = {
  selectedCount: number;
  onCreateReport: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
};

export default function StockManagementToolbar({
  selectedCount,
  onCreateReport,
  searchValue,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: StockManagementToolbarProps) {
  const isDisabled = selectedCount === 0;
  const [openCategory, setOpenCategory] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpenCategory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="rounded-[28px] border-[1px] border-[#0000001A] bg-[#FCFCFD] p-3 shadow-[0px_4px_14px_rgba(15,23,42,0.035)] sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-[760px]">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search inventory..."
            className="h-[36px] w-full rounded-[18px] border-0 bg-[#F4F4F5] pl-[58px] pr-4 text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:items-center">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpenCategory((prev) => !prev)}
              className="flex h-[36px] min-w-[148px] items-center justify-between rounded-[23px] border border-[#E7E8EC] bg-white px-5 text-[15px] font-medium text-[#111111] shadow-[0px_1px_2px_rgba(0,0,0,0.03)]"
            >
              <span className="truncate">{selectedCategory}</span>
              <ChevronDown
                className={`h-[18px] w-[18px] transition-transform ${openCategory ? "rotate-180" : ""}`}
              />
            </button>

            {openCategory && (
              <div className="absolute right-0 z-20 mt-2 w-[190px] overflow-hidden rounded-[18px] border border-[#E7E8EC] bg-white shadow-[0px_12px_30px_rgba(15,23,42,0.10)]">
                {categories.map((category) => {
                  const active = category === selectedCategory;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        onCategoryChange(category);
                        setOpenCategory(false);
                      }}
                      className={`flex w-full items-center justify-start px-4 py-3 text-left text-[14px] font-medium transition ${
                        active
                          ? "bg-[#030213] text-white"
                          : "bg-white text-[#111111] hover:bg-[#F5F7FA]"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            className="flex h-[36px] items-center justify-center gap-2 rounded-[23px] bg-[#030213] px-5 text-[15px] font-medium text-white sm:px-6"
          >
            <Upload className="h-[17px] w-[17px]" />
            <span className="whitespace-nowrap">Upload Challan</span>
          </button>

          <button
            type="button"
            onClick={onCreateReport}
            disabled={isDisabled}
            className={[
              "flex h-[36px] items-center justify-center gap-2 rounded-[23px] px-5 text-[15px] font-medium transition-all sm:px-6",
              isDisabled
                ? "cursor-not-allowed bg-[#D9DEE7] text-[#8E98A8]"
                : "bg-[#16A34A] text-white shadow-[0px_6px_16px_rgba(22,163,74,0.20)] hover:brightness-[0.98]",
            ].join(" ")}
          >
            <FileText className="h-[17px] w-[17px]" />
            <span className="whitespace-nowrap">
              Create Audit{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </span>
          </button>

          <Link
            href="/retail/request"
            className="flex h-[36px] items-center justify-center gap-2 rounded-[23px] bg-[#030213] px-5 text-[15px] font-medium text-white sm:px-6"
          >
            <Plus className="h-[18px] w-[18px]" />
            <span className="whitespace-nowrap">Add Item</span>
          </Link>
        </div>
      </div>
    </div>
  );
}