"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Store, Users, TrendingUp } from "lucide-react";
import SearchInput from "../../../../features/district/StoreManagement/components/SearchInput";
import StoreManagementStoreGrid from "../../../../features/district/StoreManagement/components/StoreManagementStoreGrid";
import { getDistrictRetailStores } from "../../../../features/district/StoreManagement/api";
import type { RetailStore } from "../../../../features/district/StoreManagement/types";
import {
  formatCurrency,
  formatPlainNumber,
  mapStoresToUi,
} from "../../../../features/district/StoreManagement/utils";

const useDebounce = (value: string, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default function DistrictStoreManagementPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
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

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let active = true;

    async function loadStores() {
      try {
        setLoading(true);
        setError("");

        const res = await getDistrictRetailStores({
          search: debouncedSearch.trim() || undefined,
          status: status === "all" ? undefined : status,
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
      } catch (err) {
        if (!active) return;
        setStores([]);
        setError(err instanceof Error ? err.message : "Failed to load stores.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStores();

    return () => {
      active = false;
    };
  }, [debouncedSearch, status]);

  const cards = useMemo(
    () => [
      {
        label: "Total Stores",
        value: formatPlainNumber(summary.total_stores),
        icon: Store,
        bg: "bg-erp-yellow-soft",
        color: "text-erp-yellow",
        trend: "+12.5%",
        trendColor: "text-erp-success",
      },
      {
        label: "Active Stores",
        value: formatPlainNumber(summary.active_stores),
        icon: Store,
        bg: "bg-erp-green-soft",
        color: "text-erp-success",
        trend: "+12.5%",
        trendColor: "text-erp-danger",
      },
      {
        label: "Total Employees",
        value: formatPlainNumber(summary.total_employees),
        icon: Users,
        bg: "bg-erp-blue-soft",
        color: "text-erp-primary",
      },
      {
        label: "Total Revenue",
        value: formatCurrency(summary.total_revenue),
        icon: TrendingUp,
        bg: "bg-erp-green-soft",
        color: "text-erp-success",
      },
    ],
    [summary]
  );

  return (
    <main className="w-full font-erp">
      <section className="mb-[26px] flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="erp-page-title">Retail Store Management</h1>
          <p className="mt-1 erp-page-subtitle">
            Manage all retail stores under Karnal District
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-[48px] w-fit items-center justify-center gap-3 rounded-erp-full bg-erp-dark px-8 text-[15px] font-semibold leading-none tracking-[-0.02em] text-white shadow-erp-card transition hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </section>

      <section className="mb-[18px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="min-h-[158px] rounded-erp-2xl border border-erp-border bg-erp-card px-[18px] py-4 shadow-erp-card"
            >
              <div
                className={`mb-[22px] flex h-[54px] w-[54px] items-center justify-center rounded-erp-sm ${card.bg} ${card.color}`}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-erp-text-soft">
                    {card.label}
                  </p>
                  <h2 className="mt-1 text-[30px] font-semibold leading-[34px] tracking-[-0.045em] text-black">
                    {card.value}
                  </h2>
                </div>

                {card.trend ? (
                  <p
                    className={`pb-1 text-[16px] font-semibold leading-[20px] tracking-[-0.02em] ${card.trendColor}`}
                  >
                    ↗ {card.trend}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </section>

      <section className="mb-[18px] flex flex-col gap-4 rounded-erp-2xl border border-erp-border bg-white p-4 shadow-erp-card md:flex-row md:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name..."
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-[48px] min-w-[150px] rounded-erp-full border border-erp-border bg-white px-5 text-[15px] font-medium text-erp-text outline-none shadow-erp-sm"
        >
          <option value="all">All Stores</option>
          <option value="active">Active Stores</option>
          <option value="inactive">Inactive Stores</option>
        </select>
      </section>

      {loading ? (
        <div className="rounded-erp-xl border border-erp-border bg-white p-10 text-center text-[15px] font-medium text-erp-muted shadow-erp-card">
          Loading stores...
        </div>
      ) : error ? (
        <div className="rounded-erp-xl border border-red-200 bg-red-50 p-10 text-center text-[15px] font-medium text-red-600 shadow-erp-card">
          {error}
        </div>
      ) : (
        <StoreManagementStoreGrid stores={stores} />
      )}
    </main>
  );
}