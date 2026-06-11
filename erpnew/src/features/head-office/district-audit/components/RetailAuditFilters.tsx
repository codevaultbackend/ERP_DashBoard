"use client";

import {
  Search,
  ChevronDown,
} from "lucide-react";

import type {
  RetailAuditStore,
} from "../types/retail-audit.types";

type Props = {
  search: string;
  selectedStore: number | null;
  selectedDate: string;
  stores?: RetailAuditStore[];

  onSearchChange: (
    value: string
  ) => void;

  onStoreChange: (
    value: number | null
  ) => void;

  onDateChange: (
    value: string
  ) => void;

  onClearFilters: () => void;
};

export default function RetailAuditFilters({
  search,
  selectedStore,
  selectedDate,
  stores = [],
  onSearchChange,
  onStoreChange,
  onDateChange,
}: Props) {
  return (
    <div
      className="
        mb-6
        sm:mb-8
        lg:mb-10
        flex
        flex-col
        gap-3
        lg:flex-row
        lg:items-center
      "
    >
      {/* SEARCH */}

      <div className="relative w-full flex-1">
        <Search
          className="
            absolute
            left-4
            sm:left-5
            top-1/2
            h-4
            w-4
            sm:h-5
            sm:w-5
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
            h-[56px]
            sm:h-[60px]
            lg:h-[68px]
            w-full
            rounded-2xl
            lg:rounded-full
            border
            border-[#E5E7EB]
            bg-white
            pl-12
            sm:pl-14
            pr-4
            sm:pr-6
            text-sm
            sm:text-[16px]
            font-medium
            text-[#02011A]
            shadow-sm
            outline-none
            transition-all
            duration-200
            placeholder:text-[#9CA3AF]
            hover:border-[#CBD5E1]
            focus:border-[#2563EB]
            focus:ring-4
            focus:ring-[#DBEAFE]
          "
        />
      </div>

      {/* STORE FILTER */}

      <div className="relative w-full lg:w-auto">
        <select
          value={selectedStore ?? ""}
          onChange={(e) =>
            onStoreChange(
              e.target.value
                ? Number(
                    e.target.value
                  )
                : null
            )
          }
          className="
            h-[56px]
            sm:h-[60px]
            lg:h-[68px]
            w-full
            lg:min-w-[240px]
            appearance-none
            rounded-2xl
            lg:rounded-full
            border
            border-[#E5E7EB]
            bg-white
            px-4
            sm:px-6
            pr-12
            text-sm
            sm:text-[16px]
            font-medium
            text-[#111827]
            shadow-sm
            outline-none
            transition-all
            duration-200
            hover:border-[#CBD5E1]
            focus:border-[#2563EB]
            focus:ring-4
            focus:ring-[#DBEAFE]
          "
        >
          <option value="">
            All Stores
          </option>

          {stores.map(
            (store) => (
              <option
                key={store.id}
                value={store.id}
              >
                {store.store_name ||
                  (store as any)
                    .organization_name ||
                  (store as any)
                    .name ||
                  `Store ${store.id}`}
              </option>
            )
          )}
        </select>

        <ChevronDown
          className="
            pointer-events-none
            absolute
            right-4
            sm:right-5
            top-1/2
            h-4
            w-4
            sm:h-5
            sm:w-5
            -translate-y-1/2
            text-[#64748B]
          "
        />
      </div>

      {/* DATE FILTER */}

      <div className="relative w-full lg:w-auto">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) =>
            onDateChange(
              e.target.value
            )
          }
          className="
            h-[56px]
            sm:h-[60px]
            lg:h-[68px]
            w-full
            lg:min-w-[220px]
            rounded-2xl
            lg:rounded-full
            border
            border-[#E5E7EB]
            bg-white
            px-4
            sm:px-6
            text-sm
            sm:text-[16px]
            font-medium
            text-[#111827]
            shadow-sm
            outline-none
            transition-all
            duration-200
            hover:border-[#CBD5E1]
            focus:border-[#2563EB]
            focus:ring-4
            focus:ring-[#DBEAFE]
          "
        />
      </div>
    </div>
  );
}