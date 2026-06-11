"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronRight,
  Loader2,
  Store,
} from "lucide-react";

import { getRetailStores } from "@/features/district/retail-audit/api/retail-audit-api";

import type { RetailAuditStore } from "@/features/district/retail-audit/types/retail-audit.types";

import RetailAuditHeader from "@/features/district/retail-audit/components/RetailAuditHeader";
import RetailAuditFilters from "@/features/district/retail-audit/components/RetailAuditFilters";

export default function DistrictAuditPage() {
  const router = useRouter();

  const [stores, setStores] = useState<RetailAuditStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getRetailStores();

        setStores(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(
          err?.message || "Failed to load retail stores"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className="min-h-screen ">
      <RetailAuditHeader />
      <RetailAuditFilters />

      <div className="mx-auto w-full max-w-[1600px] ">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
              <Loader2 className="h-8 w-8 text-red-500" />
            </div>

            <p className="text-center text-red-500">
              {error}
            </p>
          </div>
        ) : stores.length === 0 ? (
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
              No Stores Found
            </h3>

            <p className="mt-2 text-sm text-[#64748B]">
              No retail stores are available for audit.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#02011A]">
                Retail Stores
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Select a store to view audit details.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() =>
                    router.push(
                      `/district/retail-audit/${store.id}`
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

                      <div className="min-w-0">
                        <h3
                          className="
                            truncate
                            text-[18px]
                            font-semibold
                            text-[#02011A]
                          "
                        >
                          {store.store_name}
                        </h3>

                        <p
                          className="
                            mt-1
                            text-sm
                            font-medium
                            text-[#64748B]
                          "
                        >
                          {store.store_code}
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
                          Retail Store
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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}