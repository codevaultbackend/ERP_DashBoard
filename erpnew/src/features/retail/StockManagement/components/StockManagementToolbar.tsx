"use client";

import { ChevronDown, Plus, Search, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type StockManagementToolbarProps = {
  selectedCount: number;
  onCreateReport: () => void;
  auditMode?: boolean;

  /**
   * Retail + District dono ke liye common.
   * Parent decide karega popup open karna hai ya nahi.
   */
  onAddItem?: () => void;

  onUploadStock?: (file: File) => Promise<void> | void;

  searchValue: string;
  onSearchChange: (value: string) => void;

  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;

  submitting?: boolean;
  uploadLoading?: boolean;

  /**
   * Optional guards.
   * Retail me kuch pass nahi karna.
   * District me agar store/scope missing ho to Add Item disable kar sakte ho.
   */
  addItemDisabled?: boolean;
  addItemDisabledReason?: string;
};

export default function StockManagementToolbar({
  auditMode = false,
  selectedCount,
  onCreateReport,
  onAddItem,
  onUploadStock,
  searchValue,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  submitting = false,
  uploadLoading = false,
  addItemDisabled = false,
  addItemDisabledReason = "Add item is currently disabled",
}: StockManagementToolbarProps) {
  const [openCategory, setOpenCategory] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const safeCategories =
    Array.isArray(categories) && categories.length > 0 ? categories : ["All"];

  const isReportDisabled = submitting;
  const isUploading = uploadLoading;
  const isAddDisabled = addItemDisabled || !onAddItem;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpenCategory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !onUploadStock || isUploading) return;

    await onUploadStock(file);
  };

  const handleAddItemClick = () => {
    if (isAddDisabled) return;
    onAddItem?.();
  };

  return (
    <div className="rounded-[30px] border border-erp-border bg-erp-card px-[18px] py-[17px] shadow-erp-card">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-[540px] 2xl:max-w-[620px]">
          <Search className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8C96A6]" />

          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search inventory..."
            className={[
              "h-[40px] w-full rounded-full border-0 bg-[#F4F4F5]",
              "pl-[50px] pr-4",
              "text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#111827]",
              "outline-none transition placeholder:text-[#8C96A6]",
              "focus:ring-2 focus:ring-erp-primary/10",
            ].join(" ")}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:flex-nowrap xl:items-center xl:justify-end">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpenCategory((prev) => !prev)}
              className={[
                "flex h-[40px] min-w-[148px] items-center justify-between",
                "rounded-full border border-erp-border bg-white px-[20px]",
                "text-[15px] font-medium leading-[20px] tracking-[-0.02em] text-[#111111]",
                "shadow-[0px_1px_2px_rgba(0,0,0,0.03)] transition hover:bg-[#F8FAFC]",
              ].join(" ")}
            >
              <span className="truncate">
                {selectedCategory === "All" ? "Category" : selectedCategory}
              </span>

              <ChevronDown
                className={`h-[18px] w-[18px] stroke-[2.2] transition-transform ${
                  openCategory ? "rotate-180" : ""
                }`}
              />
            </button>

            {openCategory && (
              <div className="absolute right-0 z-30 mt-2 max-h-[280px] w-[210px] overflow-y-auto rounded-[18px] border border-erp-border bg-white shadow-[0px_12px_30px_rgba(15,23,42,0.10)]">
                {safeCategories.map((category) => {
                  const active = category === selectedCategory;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        onCategoryChange(category);
                        setOpenCategory(false);
                      }}
                      className={[
                        "flex w-full items-center justify-start px-4 py-3 text-left",
                        "text-[14px] font-medium leading-[18px] tracking-[-0.02em] transition",
                        active
                          ? "bg-erp-dark text-white"
                          : "bg-white text-[#111111] hover:bg-[#F5F7FA]",
                      ].join(" ")}
                    >
                      {category === "All" ? "Category" : category}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            disabled={isUploading || !onUploadStock}
            onClick={() => {
              if (isUploading || !onUploadStock) return;
              fileInputRef.current?.click();
            }}
            className={[
              "flex h-[40px] items-center justify-center gap-[8px]",
              "rounded-full bg-erp-dark px-[20px]",
              "text-[15px] font-semibold leading-[20px] tracking-[-0.02em] text-white",
              "transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 sm:px-[22px]",
            ].join(" ")}
          >
            {isUploading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>

                <span className="whitespace-nowrap">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-[17px] w-[17px] stroke-[2.2]" />
                <span className="whitespace-nowrap">Upload Challan</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isAddDisabled}
            title={isAddDisabled ? addItemDisabledReason : "Add Item"}
            onClick={handleAddItemClick}
            className={[
              "flex h-[40px] items-center justify-center gap-[8px]",
              "rounded-full px-[20px]",
              "text-[15px] font-semibold leading-[20px] tracking-[-0.02em]",
              "transition sm:px-[22px]",
              isAddDisabled
                ? "cursor-not-allowed bg-[#D9DEE7] text-[#8E98A8]"
                : "bg-erp-dark text-white hover:brightness-110",
            ].join(" ")}
          >
            <Plus className="h-[18px] w-[18px] stroke-[2.2]" />
            <span className="whitespace-nowrap">Add Item</span>
          </button>

          <button
            type="button"
            onClick={onCreateReport}
            disabled={isReportDisabled}
            className={[
              "flex h-[40px] items-center justify-center gap-[8px]",
              "rounded-full px-[20px]",
              "text-[15px] font-semibold leading-[20px] tracking-[-0.02em] transition-all sm:px-[22px]",
              isReportDisabled
                ? "cursor-not-allowed bg-[#D9DEE7] text-[#8E98A8]"
                : "bg-erp-dark text-white hover:brightness-110",
            ].join(" ")}
          >
            {submitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>

                <span>Processing...</span>
              </>
            ) : (
              <>
                <Plus className="h-[18px] w-[18px] stroke-[2.2]" />

                <span className="whitespace-nowrap">
  {auditMode
    ? `Submit Audit`
    : "Create Audit"}
</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}