"use client";

import {
  FileText,
  Plus,
  Receipt,
  Search,
  Wifi,
} from "lucide-react";

import { useState } from "react";

import type { Product } from "../../../../features/retail/data/billing-data";

import { formatCurrency } from "../../../../features/retail/utils/billing-utils";

import ManualBillingEntryModal from "./ManualBillingEntryModal";

import Link from "next/link";

import { usePathname } from "next/navigation";

type Props = {
  query: string;

  setQuery: (value: string) => void;

  showSuggestions: boolean;

  setShowSuggestions: (
    value: boolean
  ) => void;

  suggestions: Product[];

  onSubmit: (
    e: React.FormEvent
  ) => void;

  onSelectProduct: (
    product: Product
  ) => void;

  onManualBillCreated?: () => void;
};

export default function BillingSearchBar({
  query,
  setQuery,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  onSubmit,
  onSelectProduct,
  onManualBillCreated,
}: Props) {

  const pathname = usePathname();

  const [manualBillingOpen, setManualBillingOpen] =
    useState(false);

  // =========================================
  // DYNAMIC PENDING AMOUNT ROUTE
  // =========================================
  const pendingAmountRoute =
    pathname.includes("/district")
      ? "/district/billing/pending-amount"
      : "/retail/billing/pending-amount";

  return (
    <>
      <div className="relative my-8 flex items-center gap-[12px]">

        <div className="relative w-full flex-1">

          <form
            onSubmit={onSubmit}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />

            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);

                setShowSuggestions(true);
              }}
              onFocus={() =>
                setShowSuggestions(true)
              }
              placeholder="Scan or enter product code (e.g., GN001, SR002)..."
              className="h-[42px] w-full rounded-[18px] border border-[#ECEFF3] bg-white pl-[48px] pr-5 text-[14px] font-medium text-[#111827] outline-none placeholder:text-[14px] placeholder:font-medium placeholder:text-[#98A2B3] shadow-[0px_2px_10px_rgba(15,23,42,0.03)] transition-all focus:border-[#D8DCE5] focus:ring-2 focus:ring-[#EEF2FF]"
            />
          </form>

          {showSuggestions &&
            suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[22px] border border-[#E6EAF0] bg-white shadow-[0px_20px_50px_rgba(15,23,42,0.10)]">

                {suggestions.map(
                  (item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onSelectProduct(
                          item
                        )
                      }
                      className="flex w-full items-center justify-between gap-4 border-b border-[#EEF1F5] px-5 py-4 text-left transition-all last:border-b-0 hover:bg-[#F8FAFC]"
                    >
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#F4F3FF] text-[#7C3AED]">

                          <FileText className="h-4 w-4" />

                        </div>

                        <div>
                          <p className="text-[14px] font-semibold text-[#111827]">
                            {item.name}
                          </p>

                          <p className="mt-1 text-[12px] font-medium text-[#667085]">
                            {item.code}
                          </p>
                        </div>
                      </div>

                      <span className="text-[14px] font-bold text-[#111827]">
                        {formatCurrency(
                          item.metalValue +
                          item.makingCharges
                        )}
                      </span>
                    </button>
                  )
                )}
              </div>
            )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setManualBillingOpen(true)
            }
            className="flex h-[42px] items-center gap-2 rounded-[14px] border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold text-[#111827] shadow-[0px_2px_8px_rgba(15,23,42,0.03)] transition-all hover:bg-[#F9FAFB]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#F4F3FF] text-[#7C3AED]">

              <Plus className="h-4 w-4" />

            </div>

            <span className="hidden sm:block">
              Manual Billing
            </span>
          </button>

        </div>
      </div>

      <ManualBillingEntryModal
        open={manualBillingOpen}
        onClose={() => setManualBillingOpen(false)}
        onCreate={() => {
          setManualBillingOpen(false);
        }}
        onBillCreated={() => {
          onManualBillCreated?.();
          setManualBillingOpen(false);
        }}
      />
    </>
  );
}