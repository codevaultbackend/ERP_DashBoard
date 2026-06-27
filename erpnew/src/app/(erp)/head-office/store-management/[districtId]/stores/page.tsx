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
            className="flex h-[54px] w-[54px] max-[768px]:h-[48px] max-[768px]:w-[48px] shrink-0 items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_3px_10px_rgba(15,23,42,0.06)] transition hover:bg-[#F8FAFC]"
            aria-label="Go back"
          >
            <ChevronRight className="h-7 w-7 rotate-180 text-black max-[768px]:h-6 max-[768px]:w-6" />
          </button>

          <h1 className="text-[30px] max-[768px]:text-[22px] font-bold tracking-[-0.035em] text-[#111827] sm:text-[36px]">
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
                className="h-full max-[768px]:h-[36px] w-full bg-transparent text-[15px] font-medium text-[#111827] outline-none placeholder:text-[#7C8495]"
              />
            </div>

            <button
              type="button"
              className="
    group

    flex
    h-12
    w-full
    items-center
    justify-between

    rounded-full

    border
    border-[#E5E7EB]

    bg-white

    px-5

    shadow-[0_2px_8px_rgba(15,23,42,0.05)]

    transition-all
    duration-200

    hover:border-[#C8D8F5]
    hover:bg-[#FAFBFC]
    hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]

    focus:outline-none
    focus:ring-2
    focus:ring-[#D8E8FF]

    lg:w-[220px]
    lg:min-w-[220px]
    lg:max-w-[220px]
    lg:flex-none
  "
            >
              <span
                className="
      truncate

      text-[15px]
      font-semibold
      text-[#111827]
    "
              >
                Category
              </span>

              <ChevronDown
                className="
      ml-3
      h-4
      w-4
      shrink-0

      text-[#64748B]

      transition-transform
      duration-200

      group-hover:rotate-180
    "
              />
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

        {/* ================= Error ================= */}

        {error && (
          <div
            className="
            mt-6

            rounded-[22px]

            border
            border-red-200

            bg-red-50

            px-5
            py-4

            text-[14px]
            font-semibold
            text-red-700

            shadow-sm
          "
          >
            {error}
          </div>
        )}

        {/* ================= Loading ================= */}

        {loading ? (
          <div
            className="
            mt-8

            flex
            h-[260px]
            flex-col
            items-center
            justify-center

            rounded-[28px]

            border
            border-[#E5E7EB]

            bg-white

            shadow-[0_2px_10px_rgba(15,23,42,0.05)]
          "
          >
            <Loader2 className="h-9 w-9 animate-spin text-[#0A6CFF]" />

            <p className="mt-4 text-[15px] font-medium text-[#64748B]">
              Loading retail stores...
            </p>
          </div>
        ) : (
          <div
            className="
            mt-8

            grid
            grid-cols-1
            gap-4
            max-[768px]:grid-cols-1
            sm:gap-5
            lg:grid-cols-2
            max-[1240px]:grid-cols-3
          "
          >
            {/* Empty State */}

            {filteredStores.length === 0 && (
              <div
                className="
                col-span-full

                flex
                flex-col
                items-center
                justify-center

                rounded-[28px]

                border
                border-dashed
                border-[#D8E2EC]

                bg-white

                px-6
                py-16

                text-center

                shadow-sm
              "
              >
                <div
                  className="
                  mb-4

                  flex
                  h-16
                  w-16
                  items-center
                  justify-center

                  rounded-full

                  bg-[#EEF5FF]
                "
                >
                  <Store className="h-8 w-8 text-[#0A6CFF]" />
                </div>

                <h3 className="text-lg font-semibold text-[#111827]">
                  No Retail Stores Found
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                  We couldn't find any retail stores matching your search.
                  Try changing the search keyword or check back later.
                </p>
              </div>
            )}

            {/* Store Cards Start Below */}

            {filteredStores.map((store) => (
              <Link
                key={store.id}
                href={`/head-office/store-management/${encodeURIComponent(
                  districtId
                )}/stores/${encodeURIComponent(store.code)}`}
                className="
      group

      flex
      items-center
      justify-between

      rounded-[24px]

      border
      border-[#E4EAF2]

      bg-white

      px-4
      py-4

      sm:px-5
      sm:py-5

      shadow-[0_2px_8px_rgba(15,23,42,0.05)]

      transition-all
      duration-200

      hover:-translate-y-0.5
      hover:border-[#C9DCF8]
      hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]
    "
              >
                {/* Left */}

                <div className="flex min-w-0 flex-1 items-center gap-4">

                  {/* Store Icon */}

                  <div
                    className="
          flex

          h-14
          w-14

          shrink-0

          items-center
          justify-center

          rounded-[18px]

          bg-[#EDF5FF]

          transition

          group-hover:bg-[#E4F0FF]

          sm:h-[60px]
          sm:w-[60px]
        "
                  >
                    <Store
                      className="
            h-7
            w-7

            text-[#0A6CFF]
          "
                    />
                  </div>

                  {/* Text */}

                  <div className="min-w-0 flex-1">

                    <h3
                      className="
            truncate

            text-[18px]
            font-bold

            leading-tight

            text-[#111827]
          "
                      title={store.name}
                    >
                      {store.name}
                    </h3>

                    <p
                      className="
            mt-2

            text-[15px]
            font-medium

            text-[#64748B]
          "
                    >
                      {store.code}
                    </p>

                  </div>
                </div>

                {/* Arrow */}

                <div
                  className="
        ml-4

        flex

        h-11
        w-11

        shrink-0

        items-center
        justify-center

        rounded-xl

        bg-[#F8FAFC]

        transition-all

        group-hover:bg-[#EAF2FF]
        group-hover:translate-x-1
      "
                >
                  <ArrowRight
                    className="
          h-5
          w-5

          text-[#111827]
        "
                  />
                </div>
              </Link>
            ))}

            {filteredStores.length === 0 && (
              <div
                className="
col-span-full

flex
flex-col
items-center
justify-center

rounded-[24px]

border
border-[#DDE6F0]

bg-white

py-16

shadow-sm
"
              >
                No retail stores found.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}