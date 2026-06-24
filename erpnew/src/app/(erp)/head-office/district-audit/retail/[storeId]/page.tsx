"use client";

import {
  useEffect,
  useMemo,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ChevronLeft,
} from "lucide-react";

import RetailAuditFilters from "@/features/head-office/district-audit/components/RetailAuditFilters";
import RetailAuditGrid from "@/features/head-office/district-audit/components/RetailAuditGrid";

import { useRetailAudit } from "@/features/head-office/district-audit/hooks/useRetailAudit";

import type {
  RetailAudit,
} from "@/features/head-office/district-audit/types/retail-audit.types";

import {
  downloadRetailAudit,
} from "@/features/head-office/district-audit/api/merge-audit-api";

export default function RetailStoreAuditPage() {
  const params = useParams();
  const router = useRouter();

  const retailStoreId = Number(
    params?.storeId
  );

  const {
    retailStores,
    districtStores,

    filteredAudits,

    loading,
    auditLoading,

    filters,

    updateSearch,
    updateStore,
    updateDate,
    clearFilters,

    fetchRetailStoreAudits,
  } = useRetailAudit();

  const currentStore =
    useMemo(() => {
      return (
        retailStores.find(
          (store) =>
            Number(store.id) ===
            retailStoreId
        ) || null
      );
    }, [
      retailStores,
      retailStoreId,
    ]);

  const districtRetailStores =
    useMemo(() => {
      if (!currentStore?.district_id) {
        return retailStores;
      }

      return retailStores.filter(
        (store) =>
          String(store.district_id) ===
          String(currentStore.district_id)
      );
    }, [
      retailStores,
      currentStore,
    ]);
  console.log("retailStoreId", retailStoreId);

  console.log("currentStore", currentStore);

  console.log("retailStores", retailStores);

  console.log(
    "districtRetailStores",
    districtRetailStores
  );

  useEffect(() => {
    const loadRetailAudits =
      async () => {
        if (
          !currentStore?.store_code
        ) {
          return;
        }

        updateStore(
          Number(currentStore.id)
        );

        await fetchRetailStoreAudits(
          currentStore.store_code
        );
      };

    loadRetailAudits();
  }, [
    currentStore,
    fetchRetailStoreAudits,
    updateStore,
  ]);

  const handleStoreChange = (
    value: string | null
  ) => {
    if (!value) return;

    router.push(
      `/head-office/district-audit/retail/${value}`
    );
  };
  const getDistrictStoreCode = (
    audit: RetailAudit
  ) => {
    return districtStores.find(
      (district) =>
        String(district.id) ===
        String(audit.district_id)
    )?.store_code;
  };

  const handleViewAudit = async (
    audit: RetailAudit
  ) => {
    try {
      const districtStoreCode =
        getDistrictStoreCode(audit);

      if (!districtStoreCode) {
        console.error(
          "District store code not found",
          audit.district_id
        );
        return;
      }

      await downloadRetailAudit(
        districtStoreCode,
        audit.id
      );
    } catch (error) {
      console.error(
        "Download failed:",
        error
      );
    }
  };

  console.log("ROUTE ID", retailStoreId);

  console.log(
    "FOUND IN RETAIL",
    retailStores.find(
      (s) => Number(s.id) === retailStoreId
    )
  );

  console.log(
    "FOUND IN DISTRICT",
    districtStores.find(
      (s) => Number(s.id) === retailStoreId
    )
  );
  console.log(
  "ROUTE STORE ID:",
  retailStoreId
);

console.log(
  "CURRENT RETAIL STORE:",
  currentStore
);

console.log(
  "DISTRICT STORE MATCH:",
  districtStores.find(
    (store) =>
      Number(store.id) ===
      retailStoreId
  )
);

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1600px]">

        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="
            mb-6
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-[#E5E7EB]
            bg-white
            px-4
            py-2.5
            text-[24px]
            font-medium
            text-[#111827]
            transition-all
            hover:text-[#2563EB]
            shadow-erp-bg
          "
        >
          <ChevronLeft />
        </button>

        <div className="mb-8">
          <h1
            className="
              text-[42px]
              font-bold
              tracking-tight
              text-[#02011A]
            "
          >
            {currentStore?.store_name ??
              "Retail Audit Reports"}
          </h1>

          <p
            className="
              mt-2
              text-[15px]
              text-[#64748B]
            "
          >
            View all audit reports
            for this retail store.
          </p>
        </div>

        <div className="mb-6">
          <RetailAuditFilters
            search={
              filters.search
            }
            selectedStore={
              filters.retailStoreId
                ? String(
                  filters.retailStoreId
                )
                : null
            }
            selectedDate={
              filters.date
            }
            stores={
              districtRetailStores
            }
            onSearchChange={
              updateSearch
            }
            onStoreChange={
              handleStoreChange
            }
            onDateChange={
              updateDate
            }
          />
        </div>

        <RetailAuditGrid
          audits={
            filteredAudits
          }
          loading={
            loading ||
            auditLoading
          }
          downloadingId={
            null
          }
          onView={
            handleViewAudit
          }
          onDownload={(auditId) => {
            const audit =
              filteredAudits.find(
                (a) => a.id === auditId
              );

            if (!audit) return;

            const districtStoreCode =
              getDistrictStoreCode(audit);

            if (!districtStoreCode) {
              console.error(
                "District store code not found",
                audit.district_id
              );
              return;
            }

            return downloadRetailAudit(
              districtStoreCode,
              auditId
            );
          }}
          onClearFilters={
            clearFilters
          }
        />
      </div>
    </div>
  );
}