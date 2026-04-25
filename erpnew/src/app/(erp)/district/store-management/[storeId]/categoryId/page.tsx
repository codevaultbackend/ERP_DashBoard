"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageBackButton from "../../../../../../features/district/StoreManagement/components/PageBackButton";
import SearchInput from "../../../../../../features/district/StoreManagement/components/SearchInput";
import StoreManagementItemTable from "../../../../../../features/district/StoreManagement/components/StoreManagementItemTable";
import { getDistrictStoreCategoryItems } from "../../../../../../features/district/StoreManagement/api";
import type {
  AuditIssue,
  Item,
} from "../../../../../../features/district/StoreManagement/types";
import { mapCategoryItemsToUi } from "../../../../../../features/district/StoreManagement/utils";

export default function DistrictStoreCategoryItemsPage() {
  const params = useParams<{ storeId: string; category: string }>();
  const storeId = params?.storeId ?? "";
  const category = decodeURIComponent(params?.category ?? "");

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        setLoading(true);
        setError("");

        if (!storeId) throw new Error("Store ID is missing.");
        if (!category) throw new Error("Category is missing.");

        const res = await getDistrictStoreCategoryItems(storeId, category, {
          search: search.trim() || undefined,
        });

        if (!active) return;

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load category items.");
        }

        setItems(mapCategoryItemsToUi(res));
      } catch (error) {
        if (!active) return;
        setItems([]);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load category items."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadItems();

    return () => {
      active = false;
    };
  }, [storeId, category, search]);

  const handleAuditComplete = (issue: AuditIssue) => {
    console.log("audit complete", { issue, storeId, category });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <PageBackButton href={`/district/store-management/${storeId}`} />
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#0F172A] md:text-[36px]">
          {category || "Category"}
        </h1>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search category items..."
      />

      {loading ? (
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)]">
          Loading items...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-[#F3D2D2] bg-[#FFF7F7] p-10 text-center text-sm font-medium text-[#B42318] shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)]">
          {error}
        </div>
      ) : (
        <StoreManagementItemTable
          items={items}
          onAuditComplete={handleAuditComplete}
        />
      )}
    </div>
  );
}