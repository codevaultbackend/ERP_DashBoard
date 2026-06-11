
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronRight,
  Loader2,
  Store,
} from "lucide-react";

import { getStores } from "@/features/head-office/district-audit/api/merge-audit-api";

import type { RetailAuditStore } from "@/features/head-office/district-audit/types/retail-audit.types";

import RetailAuditHeader from "@/features/head-office/district-audit/components/RetailAuditHeader";
import RetailAuditFilters from "@/features/head-office/district-audit/components/RetailAuditFilters";

export default function DistrictAuditPage() {
  const router = useRouter();

  // DISTRICT CARDS
  const [districtStores, setDistrictStores] = useState<
    RetailAuditStore[]
  >([]);

  // RETAIL FILTER DROPDOWN
  const [retailStores, setRetailStores] = useState<
    RetailAuditStore[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedStore, setSelectedStore] =
    useState<string | null>(null);
  const [selectedDate, setSelectedDate] =
    useState("");
  const filteredDistrictStores =
    districtStores.filter((store) => {
      const searchText =
        search.toLowerCase();

      return (
        store.store_name
          ?.toLowerCase()
          .includes(searchText) ||
        store.store_code
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          districtData,
          retailData,
        ] = await Promise.all([
          getStores("district"),
          getStores("retail"),
        ]);

        setDistrictStores(
          Array.isArray(districtData)
            ? districtData
            : []
        );

        setRetailStores(
          Array.isArray(retailData)
            ? retailData
            : []
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
          "Failed to load stores"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleRetailStoreSelect = (
    value: string | null
  ) => {
    setSelectedStore(value);

    if (value) {
      router.push(
        `/head-office/district-audit/retail/${value}`
      );
    }
  };

  return (
    <div className="min-h-screen">
      <RetailAuditHeader />

      <RetailAuditFilters
        search={search}
        selectedStore={selectedStore}
        selectedDate={selectedDate}
        stores={retailStores}
        onSearchChange={setSearch}
        onStoreChange={handleRetailStoreSelect}
        onDateChange={setSelectedDate}
        onClearFilters={() => {
          setSearch("");
          setSelectedStore(null);
          setSelectedDate("");
        }}
      />

      <div className="mx-auto w-full max-w-[1600px]">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, i) => (
              <div
                key={i}
                className="
                  h-[140px]
                  animate-pulse
                  rounded-[28px]
                  border
                  border-[#E5E7EB]
                  bg-white
                "
              />
            ))}
          </div>
        ) : error ? (
          <div
            className="
              flex
              min-h-[400px]
              flex-col
              items-center
              justify-center
              gap-4
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-red-50
              "
            >
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>

            <p className="text-center text-red-500">
              {error}
            </p>
          </div>
        ) : districtStores.length ===
          0 ? (
          <div
            className="
              flex
              min-h-[400px]
              flex-col
              items-center
              justify-center
            "
          >
            <div
              className="
                mb-4
                flex
                h-20
                w-20
                items-center
                justify-center
                rounded-full
                bg-slate-100
              "
            >
              <Store className="h-10 w-10 text-slate-500" />
            </div>

            <h3 className="text-lg font-semibold text-[#02011A]">
              No District Stores Found
            </h3>

            <p className="mt-2 text-sm text-[#64748B]">
              No district stores are
              available for audit.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#02011A]">
                District Stores
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Select a district
                store to view audit
                reports.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredDistrictStores.map(
                (store) => (
                  <button
                    key={store.id}
                    onClick={() =>
                      router.push(
                        `/head-office/district-audit/${store.id}`
                      )
                    }
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-[28px]
                      border
                      border-[#E5E7EB]
                      bg-white
                      p-6
                      text-left
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-[#2563EB]
                      hover:shadow-xl
                    "
                  >
                    <div
                      className="
                        absolute
                        inset-x-0
                        top-0
                        h-1
                        bg-gradient-to-r
                        from-blue-500
                        to-indigo-500
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                      "
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="
                            flex
                            h-[64px]
                            w-[64px]
                            items-center
                            justify-center
                            rounded-[20px]
                            bg-[#EEF4FF]
                            transition-all
                            duration-300
                            group-hover:scale-110
                          "
                        >
                          <Building2 className="h-8 w-8 text-[#2563EB]" />
                        </div>

                        <div className="min-w-0 max-w-[167px]">
                          <h3
                            className="
                              
                              text-[18px]
                              font-semibold
                              text-[#02011A]
                            "
                          >
                            {
                              store.store_name
                            }
                          </h3>

                          <p
                            className="
                              mt-1
                              text-sm
                              font-medium
                              text-[#64748B]
                            "
                          >
                            {
                              store.store_code
                            }
                          </p>

                          <span
                            className="
                              mt-2
                              inline-flex
                              rounded-full
                              bg-[#EEF4FF]
                              px-3
                              py-1
                              text-xs
                              font-medium
                              text-[#2563EB]
                            "
                          >
                            District
                            Store
                          </span>
                        </div>
                      </div>

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#F8FAFC]
                          transition-all
                          duration-300
                          group-hover:bg-[#EEF4FF]
                          group-hover:translate-x-1
                        "
                      >
                        <ChevronRight className="h-5 w-5 text-[#02011A]" />
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

