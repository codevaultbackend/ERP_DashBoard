"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft } from "lucide-react";

import RetailAuditFilters from "@/features/district/retail-audit/components/RetailAuditFilters";
import RetailAuditGrid from "@/features/district/retail-audit/components/RetailAuditGrid";

import { useRetailAudit } from "@/features/district/retail-audit/hooks/useRetailAudit";

import type {
    RetailAudit,
    RetailAuditStore,
} from "@/features/district/retail-audit/types/retail-audit.types";


export default function DistrictStoreAuditPage() {
    const params = useParams();

    const storeId = Number(params?.storeId);
    const router = useRouter();


    const {
        filteredAudits,
        stores = [],
        loading,
        downloadingId,
        filters,
        updateSearch,
        updateStore,
        updateDate,
        clearFilters,
        handleDownload,
    } = useRetailAudit();

    const currentStore =
        useMemo<RetailAuditStore | null>(() => {
            return (
                stores.find(
                    (store) =>
                        Number(store.id) === storeId
                ) || null
            );
        }, [stores, storeId]);

    const storeAudits =
        useMemo(() => {
            return filteredAudits.filter(
                (audit) =>
                    Number(audit.store_id) ===
                    storeId
            );
        }, [filteredAudits, storeId]);

    const handleViewAudit = async (
        audit: RetailAudit
    ) => {
        try {
            await handleDownload(audit.id);
        } catch (error) {
            console.error(
                "Failed to download audit report:",
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
                            "Retail Store"}
                    </h1>

                    <p
                        className="
                            mt-2
                            text-[15px]
                            text-[#64748B]
                        "
                    >
                        View and manage audit reports
                        for this store
                    </p>
                </div>
                <RetailAuditGrid
                    audits={storeAudits}
                    loading={loading}
                    downloadingId={downloadingId}
                    onView={handleViewAudit}
                    onDownload={handleDownload}
                    onClearFilters={clearFilters}
                />
            </div>
        </div>
    );
}