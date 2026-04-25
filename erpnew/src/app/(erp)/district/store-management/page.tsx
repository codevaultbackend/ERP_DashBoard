"use client";

import { useEffect, useMemo, useState } from "react";
import SearchInput from "../../../../features/district/StoreManagement/components/SearchInput";
import StoreManagementStoreGrid from "../../../../features/district/StoreManagement/components/StoreManagementStoreGrid";
import { getDistrictRetailStores } from "../../../../features/district/StoreManagement/api";
import { RetailStore } from "../../../../features/district/StoreManagement/types";
import {
  formatCurrency,
  formatPlainNumber,
  mapStoresToUi,
} from "../../../../features/district/StoreManagement/utils";

export default function DistrictStoreManagementPage() {
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState<RetailStore[]>([]);
  const [summary, setSummary] = useState({
    total_stores: 0,
    active_stores: 0,
    total_employees: 0,
    total_stock_value: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStores() {
      try {
        setLoading(true);
        setError("");

        const res = await getDistrictRetailStores({
          search: search.trim() || undefined,
        });

        if (!active) return;

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load stores.");
        }

        setSummary(
          res.data?.summary ?? {
            total_stores: 0,
            active_stores: 0,
            total_employees: 0,
            total_stock_value: 0,
            total_revenue: 0,
          }
        );
        setStores(mapStoresToUi(res));
      } catch (error) {
        if (!active) return;
        setStores([]);
        setError(
          error instanceof Error ? error.message : "Failed to load stores."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStores();

    return () => {
      active = false;
    };
  }, [search]);

  const cards = useMemo(
    () => [
      { label: "Total Stores", value: formatPlainNumber(summary.total_stores) },
      { label: "Active Stores", value: formatPlainNumber(summary.active_stores) },
      {
        label: "Employees",
        value: formatPlainNumber(summary.total_employees),
      },
      {
        label: "Stock Value",
        value: formatCurrency(summary.total_stock_value),
      },
      {
        label: "Revenue",
        value: formatCurrency(summary.total_revenue),
      },
    ],
    [summary]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[28px] border border-[#E2E8F0] bg-white px-6 py-5 shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)]"
          >
            <p className="text-sm font-medium text-[#64748B]">{card.label}</p>
            <p className="mt-2 text-[24px] font-semibold text-[#0F172A]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by store name or code..."
      />

      {loading ? (
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)]">
          Loading stores...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-[#F3D2D2] bg-[#FFF7F7] p-10 text-center text-sm font-medium text-[#B42318] shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)]">
          {error}
        </div>
      ) : (
        <StoreManagementStoreGrid stores={stores} />
      )}
    </div>
  );
}