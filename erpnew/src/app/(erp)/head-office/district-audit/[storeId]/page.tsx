"use client";

import { useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import RetailAuditFilters from "@/features/head-office/district-audit/components/RetailAuditFilters";
import RetailAuditGrid from "@/features/head-office/district-audit/components/RetailAuditGrid";

import { useRetailAudit } from "@/features/head-office/district-audit/hooks/useRetailAudit";

import type {
  RetailAudit,
} from "@/features/head-office/district-audit/types/retail-audit.types";

import {
  downloadRetailAudit,
} from "@/features/head-office/district-audit/api/merge-audit-api";

export default function DistrictStoreAuditPage() {
  const params = useParams();
  const router = useRouter();

  const districtId = Number(params?.storeId);

  const {
    filteredAudits,
    districtStores,

    loading,
    auditLoading,

    filters,

    updateSearch,
    updateStore,
    updateDate,
    clearFilters,

    fetchDistrictAudits,
  } = useRetailAudit();

  const currentDistrict = useMemo(() => {
    return (
      districtStores.find(
        (store) =>
          Number(store.id) === districtId
      ) || null
    );
  }, [
    districtStores,
    districtId,
  ]);

  useEffect(() => {
    if (!currentDistrict?.store_code) return;

    fetchDistrictAudits(
      currentDistrict.store_code
    );
  }, [
    currentDistrict?.store_code,
    fetchDistrictAudits,
  ]);

  const districtAudits = useMemo(() => {
    return filteredAudits;
  }, [filteredAudits]);

  const districtRetailStores = useMemo(() => {
    const uniqueStores = new Map();

    districtAudits.forEach((audit) => {
      const storeId =
        audit.store_id ??
        audit.retail_store_id;

      const storeName =
        audit.store_name ??
        audit.retail_store_name;

      if (storeId && storeName) {
        uniqueStores.set(
          String(storeId),
          {
            id: String(storeId),
            store_name: storeName,
            store_code:
              audit.store_code ?? "",
          }
        );
      }
    });

    return Array.from(
      uniqueStores.values()
    );
  }, [districtAudits]);

  const handleViewAudit = async (
    audit: RetailAudit
  ) => {
    try {
      if (!currentDistrict?.store_code)
        return;

      await downloadRetailAudit(
        currentDistrict.store_code,
        audit.id
      );
    } catch (error) {
      console.error(
        "Download failed:",
        error
      );
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1600px]">
        <button
          type="button"
          onClick={() => router.back()}
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
            hover:border-[#2563EB]
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
            {currentDistrict?.store_name ??
              "District Audit Reports"}
          </h1>

          <p
            className="
              mt-2
              text-[15px]
              text-[#64748B]
            "
          >
            View all audit reports for this district.
          </p>
        </div>

        <div className="mb-6">
          <RetailAuditFilters
            search={filters.search}
            selectedStore={
              filters.retailStoreId
                ? String(
                    filters.retailStoreId
                  )
                : null
            }
            selectedDate={filters.date}
            stores={districtRetailStores}
            onSearchChange={
              updateSearch
            }
            onStoreChange={(
              value
            ) => {
              updateStore(
                value
                  ? Number(value)
                  : null
              );
            }}
            onDateChange={
              updateDate
            }
          />
        </div>

        <RetailAuditGrid
          audits={districtAudits}
          loading={
            loading ||
            auditLoading
          }
          downloadingId={null}
          onView={
            handleViewAudit
          }
          onDownload={(
            auditId
          ) =>
            downloadRetailAudit(
              currentDistrict?.store_code ??
                "",
              auditId
            )
          }
          onClearFilters={
            clearFilters
          }
        />
      </div>
    </div>
  );
}