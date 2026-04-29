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
  Category,
} from "../../../../../features/district/StoreManagement/types";

function useDebounce(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default function DistrictStoreCategoriesPage() {
  const params = useParams<{ storeId: string }>();
  const storeId = params?.storeId ?? "";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [storeName, setStoreName] = useState("Store");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    let active = true;

    async function loadStoreDetail() {
      try {
        setLoading(true);
        setError("");

        if (!storeId) throw new Error("Store ID is missing.");

        const res = await getDistrictStoreDetail(storeId, {
          search: debouncedSearch.trim() || undefined,
          category: categoryFilter === "all" ? undefined : categoryFilter,
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
  }, [storeId, debouncedSearch, categoryFilter]);

  const handleLoadCategoryItems = async (category: Category) => {
    const res = await getDistrictStoreCategoryItems(storeId, category.name, {
      search: debouncedSearch.trim() || undefined,
    });

    if (!res?.success) {
      throw new Error(res?.message || "Failed to load category items.");
    }

    return mapCategoryItemsToUi(res);
  };

  const categoryOptions = categories.map((item) => item.name);

  return (
    <main className="w-full font-erp">
      <section className="mb-[24px] flex min-w-0 items-center gap-4">
        <PageBackButton href="/district/store-management" />

        <div className="min-w-0">
          <h1 className="erp-page-title truncate">
            {loading ? "Loading..." : storeName}
          </h1>
        </div>
      </section>

      <section className="mb-[26px] rounded-erp-2xl border border-erp-border bg-white p-4 shadow-erp-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search inventory..."
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-[48px] min-w-[150px] rounded-erp-full border border-erp-border bg-white px-5 text-[15px] font-medium text-erp-text outline-none shadow-erp-sm"
          >
            <option value="all">Category</option>
            {categoryOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <StateBox text="Loading store categories..." />
      ) : error ? (
        <StateBox text={error} danger />
      ) : (
        <StoreManagementCategoryTable
          storeId={storeId}
          categories={categories}
          onLoadCategoryItems={handleLoadCategoryItems}
        />
      )}
    </main>
  );
}

function StateBox({
  text,
  danger = false,
}: {
  text: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-erp-xl border p-10 text-center text-[15px] font-medium shadow-erp-card ${
        danger
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-erp-border bg-white text-erp-muted"
      }`}
    >
      {text}
    </div>
  );
}