"use client";

import {
  Search,
  ChevronDown,
  Calendar,
} from "lucide-react";

import type {
  RetailAuditStore,
} from "../types/retail-audit.types";

type Props = {
  search: string;
  selectedStore: number | null;
  selectedDate: string;
  stores?: RetailAuditStore[];

  onSearchChange: (value: string) => void;
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
        mb-10
        flex
        flex-col
        gap-4
        xl:flex-row
        xl:items-center
      "
    >
      {/* SEARCH */}

      <div className="relative flex-1">
        <Search
          className="
            absolute
            left-6
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
            h-[68px]
            w-full
            rounded-full
            border
            border-[#E5E7EB]
            bg-white
            pl-16
            pr-6
            text-[16px]
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

      <div className="relative">
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
            h-[68px]
            min-w-[220px]
            appearance-none
            rounded-full
            border
            border-[#E5E7EB]
            bg-white
            px-6
            pr-12
            text-[16px]
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
            right-5
            top-1/2
            h-5
            w-5
            -translate-y-1/2
            text-[#64748B]
          "
        />
      </div>

      {/* DATE FILTER */}

      <div className="relative">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) =>
            onDateChange(
              e.target.value
            )
          }
          className="
            h-[68px]
            min-w-[220px]
            rounded-full
            border
            border-[#E5E7EB]
            bg-white
            px-6
            pr-12
            text-[16px]
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