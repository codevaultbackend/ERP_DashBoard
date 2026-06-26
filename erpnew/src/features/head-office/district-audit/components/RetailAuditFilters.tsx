"use client";

import {
  Search,
  ChevronDown,
  Loader2,
  Store,
  Calendar,
} from "lucide-react";

import type { RetailAuditStore } from "../types/retail-audit.types";

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
    <div className="mb-6 rounded-3xl bg-white p-4 shadow-md border border-slate-100">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
        {/* SEARCH */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name..."
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                pl-11
                pr-4
                text-sm
                font-medium
                text-slate-700
                outline-none
                transition-all
                duration-200
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-100
              "
            />
          </div>
        </div>

        {/* STORE FILTER */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Store
          </label>

          <div className="relative">
            <Store
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={selectedStore ?? ""}
              disabled={loadingStores || !!storeError}
              onChange={(e) =>
                onStoreChange(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="
                h-12
                w-full
                appearance-none
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                pl-11
                pr-12
                text-sm
                font-medium
                text-slate-700
                outline-none
                transition-all
                duration-200
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-100
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              {loadingStores ? (
                <option>Loading stores...</option>
              ) : storeError ? (
                <option>Failed to load stores</option>
              ) : (
                <>
                  <option value="">
                    All Stores
                    {stores.length
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
                size={18}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  animate-spin
                  text-slate-400
                "
              />
            ) : (
              <ChevronDown
                size={18}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />
            )}
          </div>
        </div>

        {/* DATE FILTER */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Audit Date
          </label>

          <div className="relative">
            <Calendar
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                onDateChange(e.target.value)
              }
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                pl-11
                pr-4
                text-sm
                font-medium
                text-slate-700
                outline-none
                transition-all
                duration-200
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-100
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}