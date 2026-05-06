"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Loader2,
  Search,
  Store,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRetailStores } from "@/features/head-office/store-management/api/store-management-api";

type RetailStore = {
  id: string;
  name: string;
  code: string;
};

function formatTitle(value?: string) {
  if (!value) return "District Store";

  return decodeURIComponent(value)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function RetailStoresPage() {
  const router = useRouter();
  const params = useParams<{ districtId: string }>();

  const districtId = decodeURIComponent(params?.districtId ?? "");
  const districtName = formatTitle(districtId);

  const [stores, setStores] = useState<RetailStore[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadStores() {
      try {
        setLoading(true);
        setError("");

        const res = await getRetailStores(districtId);

        if (!mounted) return;

        const mappedStores = (res?.data || []).map((item) => ({
          id: String(item.store_code),
          name: item.store_name || "Retail Store",
          code: item.store_code || "-",
        }));

        setStores(mappedStores);
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load retail stores."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (districtId) loadStores();

    return () => {
      mounted = false;
    };
  }, [districtId]);

  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return stores;

    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(q) ||
        store.code.toLowerCase().includes(q)
    );
  }, [stores, search]);

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <section className="mx-auto w-full max-w-[1500px] ">
        <div className="mb-5 flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              router.push(`/head-office/store-management/${districtId}`)
            }
            className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_3px_10px_rgba(15,23,42,0.06)] transition hover:bg-[#F8FAFC]"
            aria-label="Go back"
          >
            <ChevronRight className="h-7 w-7 rotate-180 text-black" />
          </button>

          <h1 className="text-[30px] font-bold tracking-[-0.035em] text-[#111827] sm:text-[36px]">
            Store Management
          </h1>
        </div>

        <div className="rounded-[30px] border border-[#E1E5EA] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex h-[42px] flex-1 items-center rounded-full bg-[#F4F4F5] px-4">
              <Search className="mr-3 h-5 w-5 text-[#8A94A6]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search retail store..."
                className="h-full w-full bg-transparent text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#7C8495]"
              />
            </div>

            <button
              type="button"
              className="flex h-[42px] min-w-[150px] items-center justify-between rounded-full bg-white px-5 text-[15px] font-semibold text-[#222] shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
            >
              Category
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[18px] font-medium text-[#334155]">
            Main Warehouse / {districtName} / Store Management
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/head-office/store-management"
              className="flex h-[44px] min-w-[132px] items-center justify-center rounded-full bg-[#020315] px-7 text-[15px] font-semibold text-white transition hover:bg-[#111827]"
            >
              Districts
            </Link>

            <Link
              href={`/head-office/store-management/${districtId}/stores`}
              className="flex h-[44px] min-w-[132px] items-center justify-center rounded-full bg-[#020315] px-7 text-[15px] font-semibold text-white transition hover:bg-[#111827]"
            >
              All Stores
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-[14px] font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 flex h-[220px] items-center justify-center rounded-[26px] border border-[#E6EAF0] bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-[#111827]" />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredStores.map((store) => (
              <Link
                key={store.id}
                href={`/head-office/store-management/${encodeURIComponent(
                  districtId
                )}/stores/${encodeURIComponent(store.code)}`}
                className="group flex min-h-[112px] items-center justify-between rounded-[26px] border border-[#E6EAF0] bg-white px-6 py-5 shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition hover:-translate-y-[1px] hover:shadow-[0_8px_22px_rgba(15,23,42,0.09)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[#EFF6FF]">
                    <Store className="h-8 w-8 text-[#0667D8]" />
                  </div>

                  <div>
                    <h3 className="text-[20px] font-bold text-[#111827]">
                      {store.name}
                    </h3>
                    <p className="mt-1 text-[15px] font-medium text-[#566174]">
                      {store.code}
                    </p>
                  </div>
                </div>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F5F5] transition group-hover:bg-[#EAF2FF]">
                  <ArrowRight className="h-4 w-4 text-[#111827]" />
                </span>
              </Link>
            ))}

            {filteredStores.length === 0 && (
              <div className="col-span-full flex h-[180px] items-center justify-center rounded-[26px] border border-[#E6EAF0] bg-white text-[15px] font-semibold text-[#64748B]">
                No retail stores found.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}