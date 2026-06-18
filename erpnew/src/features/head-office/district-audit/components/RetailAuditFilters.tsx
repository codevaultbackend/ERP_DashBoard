"use client";

import {
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";

import type {
  RetailAuditStore,
} from "../types/retail-audit.types";

type Props = {
  search: string;
  selectedStore: number | null;
  selectedDate: string;
  stores?: RetailAuditStore[];
  loadingStores?: boolean;
  storeError?: string | null;

  onSearchChange: (value: string) => void;
  onStoreChange: (value: number | null) => void;
  onDateChange: (value: string) => void;
  onClearFilters: () => void;
};

export default function RetailAuditFilters({
  search,
  selectedStore,
  selectedDate,
  stores = [],
  loadingStores = false,
  storeError = null,
  onSearchChange,
  onStoreChange,
  onDateChange,
}: Props) {
  return (
    <div
      className="
        mb-8
        flex
        flex-col
        gap-4
        xl:flex-row
        xl:items-center
        bg-white
        h-[70px]
        rounded-full
             shadow-sm
             pl-6
            pr-6
      "
    >
      {/* SEARCH */}

      <div className="relative flex-1 ">
        <Search
          className="
            absolute
            left-5
            top-1/2
            h-5
            w-5
            -translate-y-1/2
            text-[#94A3B8]
          "
        />

        <input
          value={search}
          onChange={(e) =>
            onSearchChange(
              e.target.value
            )
          }
          placeholder="Search by name..."
          className="
            h-[36px]
            w-full
            rounded-full
             pl-14
            pr-6
            border
            border-[#E5E7EB]
            bg-[#F7F7F7]
            
            text-[16px]
            font-medium
            text-[#111827]
            outline-none
            transition-all
            duration-200
            placeholder:text-[#9CA3AF]
            focus:border-[#2563EB]
            focus:ring-4
            focus:ring-[#DBEAFE]
          "
        />
      </div>

      {/* STORE FILTER */}

      <div className="relative w-full xl:w-auto shadow-erp-card h-[35px] p-2 rounded-[32px]">
        <select
          value={selectedStore ?? ""}
          disabled={loadingStores || !!storeError}
          onChange={(e) =>
            onStoreChange(
              e.target.value
                ? Number(e.target.value)
                : null
            )
          }
        >
          {loadingStores ? (
            <option>Loading stores...</option>
          ) : storeError ? (
            <option>Failed to load stores</option>
          ) : (
            <>
              <option value="">
                All Stores
                {stores.length > 0
                  ? ` (${stores.length})`
                  : ""}
              </option>

              {stores.map((store) => (
                <option
                  key={store.id}
                  value={store.id}
                >
                  {store.store_name}
                </option>
              ))}
            </>
          )}
        </select>

        {loadingStores ? (
          <Loader2
            className="
              absolute
              right-5
              top-1/2
              h-5
              w-5
              -translate-y-1/2
              animate-spin
              text-[#64748B]
            "
          />
        ) : (
          <></>
        )}
      </div>

      {/* DATE FILTER */}

      <div className="w-full xl:w-auto">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) =>
            onDateChange(
              e.target.value
            )
          }
          className="
            h-[36px]
            w-full
            xl:w-[240px]
            rounded-full
            border
            border-[#E5E7EB]
            bg-white
            px-6
            text-[16px]
            font-medium
            text-[#111827]
            shadow-sm
            outline-none
            transition-all
            duration-200
            focus:border-[#2563EB]
            focus:ring-4
            focus:ring-[#DBEAFE]
          "
        />
      </div>
    </div>
  );
}

