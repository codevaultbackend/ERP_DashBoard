"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageBackButton from "../../../../../features/district/StoreManagement/components/PageBackButton";
import SearchInput from "../../../../../features/district/StoreManagement/components/SearchInput";
import StoreManagementCategoryTable from "../../../../../features/district/StoreManagement/components/StoreManagementCategoryTable";
import {
  getDistrictStoreCategoryItems,
  getDistrictStoreDetail,
} from "../../../../../features/district/StoreManagement/api";
import {
  mapCategoryItemsToUi,
  mapStoreDetailToCategories,
} from "../../../../../features/district/StoreManagement/utils";
import type {
  AuditIssue,
  Category,
} from "../../../../../features/district/StoreManagement/types";

export default function DistrictStoreCategoriesPage() {
  const params = useParams<{ storeId: string }>();
  const storeId = params?.storeId ?? "";

  const [search, setSearch] = useState("");
  const [storeName, setStoreName] = useState("Store");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStoreDetail() {
      try {
        setLoading(true);
        setError("");

        if (!storeId) throw new Error("Store ID is missing.");

        const res = await getDistrictStoreDetail(storeId, {
          search: search.trim() || undefined,
        });

        if (!active) return;

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load store detail.");
        }

        const mapped = mapStoreDetailToCategories(res);
        setStoreName(mapped.storeName);
        setCategories(mapped.categories);
      } catch (error) {
        if (!active) return;
        setStoreName("Store");
        setCategories([]);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load store detail."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStoreDetail();

    return () => {
      active = false;
    };
  }, [storeId, search]);

  const handleAuditSubmit = (categoryId: string, issue: AuditIssue) => {
    console.log("audit submitted", { categoryId, issue });
  };

  const handleLoadCategoryItems = async (category: Category) => {
    const res = await getDistrictStoreCategoryItems(storeId, category.name, {
      search: search.trim() || undefined,
    });

    if (!res?.success) {
      throw new Error(res?.message || "Failed to load category items.");
    }

    return mapCategoryItemsToUi(res);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <PageBackButton href="/district/store-management" />
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#0F172A] md:text-[36px]">
          {loading ? "Loading..." : storeName}
        </h1>
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by item name, code, or category..."
      />

      {loading ? (
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)]">
          Loading store categories...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-[#F3D2D2] bg-[#FFF7F7] p-10 text-center text-sm font-medium text-[#B42318] shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)]">
          {error}
        </div>
      ) : (
        <StoreManagementCategoryTable
          storeId={storeId}
          categories={categories}
          onAuditSubmit={handleAuditSubmit}
          onLoadCategoryItems={handleLoadCategoryItems}
        />
      )}
    </div>
  );
}