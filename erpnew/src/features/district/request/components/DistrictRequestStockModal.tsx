"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  X,
} from "lucide-react";

import {
  createDistrictStockRequest,
  getRetailStoresUnderDistrict,
  getStockCategories,
  getStockItemsByCategory,
  type CategoryItemApi,
  type CategoryRowApi,
} from "../request/api/district-request-api";

type RequestTargetLevel =
  | "head"
  | "retail";

type OrganizationOption = {
  id: number;
  store_code: string;
  store_name: string;
  organization_level: string;
  district_id?: number | null;
  is_active?: boolean;
};

type RequestCategoryOption = {
  label: string;
  value: string;
  quantity: number;
};

type RequestableProduct = {
  item_id: number;
  category: string;
  name: string;
  stock: number;
  article_code?: string;
  qty: string;
  tone:
    | "critical"
    | "medium"
    | "optimum";
};

type SelectedRequestItem = {
  item_id: number;
  category: string;
  name: string;
  request_qty: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

const STATIC_HEAD_OFFICE = {
  idx: 20,
  id: 21,
  store_code:
    "HO-001-1775645453292746",
  store_name: "Head Office",
  organization_level:
    "head_office",
  state: null,
  district: null,
  district_id: null,
  address: null,
  phone_number: "9999999999",
  is_active: true,
};

function cn(
  ...classes: Array<
    string | false | null | undefined
  >
) {
  return classes
    .filter(Boolean)
    .join(" ");
}

function safeText(
  value: unknown,
  fallback = "Not found"
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
}

function safeNumber(value: unknown) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

function getToneFromStock(
  quantity: number
):
  | "critical"
  | "medium"
  | "optimum" {
  if (quantity <= 5)
    return "critical";

  if (quantity <= 15)
    return "medium";

  return "optimum";
}

function getOrganizationLabel(
  org: OrganizationOption | null
) {
  if (!org) return "";

  return (
    org.store_name ||
    org.store_code ||
    `Store ${safeNumber(org.id)}`
  );
}

function mapCategoryRowToOption(
  row: CategoryRowApi
): RequestCategoryOption {
  return {
    label: safeText(
      row?.category,
      ""
    ),
    value: safeText(
      row?.category,
      ""
    ),
    quantity: safeNumber(
      row?.quantity
    ),
  };
}

function mapCategoryItemToRequestProduct(
  row: CategoryItemApi,
  category: string,
  selectedQty = ""
): RequestableProduct {
  const stock = safeNumber(
    row?.available_qty ??
      row?.quantity
  );

  return {
    item_id: safeNumber(row?.id),

    category,

    name:
      row?.item_name ||
      row?.article_code ||
      row?.sku_code ||
      "Item",

    stock,

    article_code: safeText(
      row?.article_code ||
        row?.sku_code,
      ""
    ),

    qty: selectedQty,

    tone: getToneFromStock(stock),
  };
}

function ToneBadge({
  tone,
}: {
  tone: RequestableProduct["tone"];
}) {
  const styles = {
    critical:
      "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",

    medium:
      "border-[#FDE68A] bg-[#FFF7ED] text-[#D97706]",

    optimum:
      "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]",
  };

  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center justify-center rounded-full border px-3 text-[12px] font-medium capitalize",
        styles[tone]
      )}
    >
      {tone}
    </span>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex h-[130px] items-center justify-center rounded-[22px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA] text-sm text-[#7B7B7B]">
      {text}
    </div>
  );
}

export default function DistrictRequestStockModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [mounted, setMounted] =
    useState(false);

  const [targetLevel, setTargetLevel] =
    useState<RequestTargetLevel>(
      "head"
    );

  const [
    targetDropdownOpen,
    setTargetDropdownOpen,
  ] = useState(false);

  const [categoryOpen, setCategoryOpen] =
    useState(false);

  const [targetSearch, setTargetSearch] =
    useState("");

  const [selectedTarget, setSelectedTarget] =
    useState<OrganizationOption | null>(
      null
    );

  const [priority, setPriority] =
    useState("medium");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [organizations, setOrganizations] =
    useState<OrganizationOption[]>(
      []
    );

  const [categoryOptions, setCategoryOptions] =
    useState<
      RequestCategoryOption[]
    >([]);

  const [products, setProducts] =
    useState<RequestableProduct[]>(
      []
    );

  const [selectedItems, setSelectedItems] =
    useState<
      Record<
        number,
        SelectedRequestItem
      >
    >({});

  const [loadingTargets, setLoadingTargets] =
    useState(false);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(false);

  const [loadingItems, setLoadingItems] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const firstInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [open]);

  /**
   * RESET FORM
   */

  const resetForm = () => {
    setTargetLevel("head");

    setTargetDropdownOpen(false);

    setCategoryOpen(false);

    setTargetSearch("");

    setSelectedTarget(
      STATIC_HEAD_OFFICE
    );

    setPriority("medium");

    setSelectedCategory("");

    setNotes("");

    setProducts([]);

    setSelectedItems({});

    setError("");
  };

  /**
   * INITIAL SETUP
   */

  useEffect(() => {
    if (!open) return;

    setSelectedTarget(
      STATIC_HEAD_OFFICE
    );

    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 150);
  }, [open]);

  /**
   * FETCH TARGETS
   */

  useEffect(() => {
    if (!open) return;

    const fetchTargets =
      async () => {
        try {
          setLoadingTargets(true);
          setError("");

          if (
            targetLevel === "head"
          ) {
            setOrganizations([
              STATIC_HEAD_OFFICE,
            ]);

            setSelectedTarget(
              STATIC_HEAD_OFFICE
            );

            return;
          }

          const response =
            await getRetailStoresUnderDistrict();

          const rows =
            Array.isArray(
              response?.data
            )
              ? response.data
              : Array.isArray(
                    response
                  )
                ? response
                : [];

          const activeRows =
            rows.filter(
              (row: any) =>
                row?.is_active !==
                false
            );

          setOrganizations(
            activeRows
          );

          setSelectedTarget(null);
        } catch (err: any) {
          setOrganizations([]);

          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              "Failed to load stores"
          );
        } finally {
          setLoadingTargets(false);
        }
      };

    fetchTargets();
  }, [open, targetLevel]);

  /**
   * FETCH CATEGORIES
   */

  useEffect(() => {
    if (
      !open ||
      !selectedTarget
    )
      return;

    const fetchCategories =
      async () => {
        try {
          setLoadingCategories(
            true
          );

          const organizationId =
            targetLevel ===
            "head"
              ? 21
              : selectedTarget.id;

          const organizationLevel =
            targetLevel ===
            "head"
              ? "head_office"
              : "retail";

          const response =
            await getStockCategories(
              {
                organization_id:
                  organizationId,

                organization_level:
                  organizationLevel,
              }
            );

          const rows =
            Array.isArray(
              response
            )
              ? response
              : Array.isArray(
                    response?.data
                  )
                ? response.data
                : [];

          setCategoryOptions(
            rows.map(
              mapCategoryRowToOption
            )
          );
        } catch (err: any) {
          setCategoryOptions([]);

          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              "Failed to load categories"
          );
        } finally {
          setLoadingCategories(
            false
          );
        }
      };

    fetchCategories();
  }, [
    open,
    selectedTarget,
    targetLevel,
  ]);

  /**
   * FETCH PRODUCTS
   */

  useEffect(() => {
    if (
      !open ||
      !selectedCategory ||
      !selectedTarget
    ) {
      setProducts([]);
      return;
    }

    const fetchItems =
      async () => {
        try {
          setLoadingItems(true);

          const organizationId =
            targetLevel ===
            "head"
              ? 21
              : selectedTarget.id;

          const organizationLevel =
            targetLevel ===
            "head"
              ? "head_office"
              : "retail";

          const response =
            await getStockItemsByCategory(
              {
                category:
                  selectedCategory,

                organization_id:
                  organizationId,

                organization_level:
                  organizationLevel,
              }
            );

          const rows =
            Array.isArray(
              response
            )
              ? response
              : Array.isArray(
                    response?.data
                  )
                ? response.data
                : [];

          setProducts(
            rows.map((row) =>
              mapCategoryItemToRequestProduct(
                row,
                selectedCategory
              )
            )
          );
        } catch (err: any) {
          setProducts([]);

          setError(
            err?.response?.data
              ?.message ||
              err?.message ||
              "Failed to load products"
          );
        } finally {
          setLoadingItems(false);
        }
      };

    fetchItems();
  }, [
    open,
    selectedCategory,
    selectedTarget,
    targetLevel,
  ]);

  const filteredOrganizations =
    useMemo(() => {
      const query =
        targetSearch
          .trim()
          .toLowerCase();

      if (!query)
        return organizations;

      return organizations.filter(
        (org) => {
          return (
            String(
              org.store_name || ""
            )
              .toLowerCase()
              .includes(query) ||
            String(
              org.store_code || ""
            )
              .toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      organizations,
      targetSearch,
    ]);

  const totalSelectedQty =
    Object.values(
      selectedItems
    ).reduce(
      (acc, item) =>
        acc + item.request_qty,
      0
    );

  const totalSelectedItems =
    Object.keys(selectedItems)
      .length;

  if (!mounted || !open)
    return null;

  const sanitizeQtyInput = (
    value: string
  ) => {
    return value
      .replace(/[^\d]/g, "")
      .slice(0, 5);
  };

  const handleQtyChange = (
    product: RequestableProduct,
    rawValue: string
  ) => {
    const value =
      sanitizeQtyInput(rawValue);

    setProducts((prev) =>
      prev.map((item) =>
        item.item_id ===
        product.item_id
          ? {
              ...item,
              qty: value,
            }
          : item
      )
    );

    setSelectedItems((prev) => {
      const next = {
        ...prev,
      };

      const qty =
        Number(value);

      if (!qty) {
        delete next[
          product.item_id
        ];

        return next;
      }

      next[product.item_id] = {
        item_id:
          product.item_id,

        category:
          product.category,

        name: product.name,

        request_qty: qty,
      };

      return next;
    });
  };

  /**
   * SUBMIT
   */

  const handleSubmit =
    async () => {
      try {
        if (!selectedTarget) {
          setError(
            "Please select store"
          );

          return;
        }

        const payloadItems =
          Object.values(
            selectedItems
          ).map((item) => ({
            item_id:
              item.item_id,

            request_qty:
              item.request_qty,
          }));

        if (
          payloadItems.length === 0
        ) {
          setError(
            "Please select at least one item"
          );

          return;
        }

        setSubmitting(true);

        setError("");

        const isHead =
          targetLevel === "head";

        await createDistrictStockRequest(
          {
            target_type:
              targetLevel,

            to_store_id: isHead
              ? 21
              : selectedTarget.id,

            to_store_code: isHead
              ? "HO-001-1775645453292746"
              : selectedTarget.store_code,

            organization_id:
              isHead
                ? 21
                : selectedTarget.id,

            organization_level:
              isHead
                ? "head_office"
                : "retail",

            priority,

            category:
              selectedCategory,

            notes,

            items: payloadItems,
          }
        );

        /**
         * SUCCESS UX
         */

        setSuccessMessage(
          "Stock request submitted successfully"
        );

        await onSuccess();

        /**
         * RESET FORM AFTER SUCCESS
         */

        resetForm();

        /**
         * AUTO REMOVE SUCCESS
         */

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (err: any) {
        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Failed to create request"
        );
      } finally {
        setSubmitting(false);
      }
    };

  const modal = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px]">
      <div
        className="
          relative
          flex
          max-h-[95vh]
          w-full
          max-w-[580px]
          flex-col
          overflow-hidden
          rounded-[30px]
          bg-white
          shadow-[0_20px_60px_rgba(0,0,0,0.18)]
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >
        {/* HEADER */}

        <div className="border-b border-[#F1F5F9] px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#0F172A] sm:text-[30px]">
                Request Stock
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                Request inventory from Head Office or Retail Store
              </p>
            </div>

            <button
              onClick={onClose}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                transition-all
                hover:bg-[#F8FAFC]
              "
            >
              <X className="h-5 w-5 text-[#0F172A]" />
            </button>
          </div>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {/* SUCCESS */}

          {successMessage && (
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-4 text-sm font-medium text-[#15803D]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCFCE7]">
                <Check className="h-4 w-4" />
              </div>

              {successMessage}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* SOURCE */}

          <div className="mb-6">
            <label className="mb-3 block text-[15px] font-semibold text-[#0F172A]">
              Select Source
            </label>

            <div className="flex rounded-full bg-[#02011A] p-[4px] shadow-inner">
              <button
                onClick={() =>
                  setTargetLevel(
                    "head"
                  )
                }
                className={cn(
                  "flex-1 rounded-full py-3 text-sm font-medium transition-all duration-200",
                  targetLevel ===
                    "head"
                    ? "bg-[#02011A] text-white"
                    : "bg-white text-[#0F172A]"
                )}
              >
                Head Office
              </button>

              <button
                onClick={() => {
                  setTargetLevel(
                    "retail"
                  );

                  setSelectedTarget(
                    null
                  );
                }}
                className={cn(
                  "flex-1 rounded-full py-3 text-sm font-medium transition-all duration-200",
                  targetLevel ===
                    "retail"
                    ? "bg-[#02011A] text-white"
                    : "bg-white text-[#0F172A]"
                )}
              >
                Retail Store
              </button>
            </div>
          </div>

          {/* STORE */}

          <div className="relative mb-6">
            <label className="mb-3 block text-[15px] font-semibold text-[#0F172A]">
              Select Store
            </label>

            <button
              onClick={() =>
                setTargetDropdownOpen(
                  !targetDropdownOpen
                )
              }
              className="
                flex
                h-[58px]
                w-full
                items-center
                justify-between
                rounded-[20px]
                border
                border-[#E2E8F0]
                bg-white
                px-5
                shadow-sm
                transition-all
                hover:border-[#CBD5E1]
              "
            >
              <span className="truncate text-sm font-medium text-[#0F172A]">
                {selectedTarget
                  ? getOrganizationLabel(
                      selectedTarget
                    )
                  : loadingTargets
                    ? "Loading..."
                    : "Select Store"}
              </span>

              <ChevronDown className="h-5 w-5 text-[#64748B]" />
            </button>

            {targetDropdownOpen && (
              <div className="absolute left-0 right-0 top-[72px] z-50 overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                <div className="border-b border-[#F1F5F9] p-3">
                  <div className="flex items-center gap-3 rounded-[16px] bg-[#F8FAFC] px-4">
                    <Search className="h-4 w-4 text-[#64748B]" />

                    <input
                      ref={firstInputRef}
                      value={
                        targetSearch
                      }
                      onChange={(e) =>
                        setTargetSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search store..."
                      className="h-12 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="max-h-[250px] overflow-y-auto p-2">
                  {filteredOrganizations.map(
                    (org) => (
                      <button
                        key={org.id}
                        onClick={() => {
                          setSelectedTarget(
                            org
                          );

                          setTargetDropdownOpen(
                            false
                          );
                        }}
                        className="
                          w-full
                          rounded-[16px]
                          px-4
                          py-3
                          text-left
                          transition-all
                          hover:bg-[#F8FAFC]
                        "
                      >
                        <p className="text-sm font-semibold text-[#0F172A]">
                          {
                            org.store_name
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                          {
                            org.store_code
                          }
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PRIORITY + CATEGORY */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-3 block text-[15px] font-semibold text-[#0F172A]">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value
                  )
                }
                className="
                  h-[58px]
                  w-full
                  rounded-[20px]
                  border
                  border-[#E2E8F0]
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  outline-none
                  transition-all
                  hover:border-[#CBD5E1]
                "
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>

            <div className="relative">
              <label className="mb-3 block text-[15px] font-semibold text-[#0F172A]">
                Category
              </label>

              <button
                onClick={() =>
                  setCategoryOpen(
                    !categoryOpen
                  )
                }
                className="
                  flex
                  h-[58px]
                  w-full
                  items-center
                  justify-between
                  rounded-[20px]
                  border
                  border-[#E2E8F0]
                  bg-white
                  px-4
                  shadow-sm
                  transition-all
                  hover:border-[#CBD5E1]
                "
              >
                <span className="truncate text-sm font-medium text-[#0F172A]">
                  {selectedCategory ||
                    "Select Category"}
                </span>

                <ChevronDown className="h-5 w-5 text-[#64748B]" />
              </button>

              {categoryOpen && (
                <div className="absolute left-0 right-0 top-[72px] z-50 overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                  <div className="max-h-[220px] overflow-y-auto p-2">
                    {loadingCategories ? (
                      <div className="flex h-[90px] items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : (
                      categoryOptions.map(
                        (cat) => (
                          <button
                            key={
                              cat.value
                            }
                            onClick={() => {
                              setSelectedCategory(
                                cat.value
                              );

                              setCategoryOpen(
                                false
                              );
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              justify-between
                              rounded-[16px]
                              px-4
                              py-3
                              transition-all
                              hover:bg-[#F8FAFC]
                            "
                          >
                            <span className="text-sm font-medium text-[#0F172A]">
                              {
                                cat.label
                              }
                            </span>

                            <span className="rounded-full bg-[#F8FAFC] px-2 py-1 text-xs text-[#64748B]">
                              {
                                cat.quantity
                              }
                            </span>
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY */}

          {totalSelectedItems > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
                  Selected Items
                </p>

                <h3 className="mt-2 text-[26px] font-bold text-[#02011A]">
                  {totalSelectedItems}
                </h3>
              </div>

              <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
                  Total Quantity
                </p>

                <h3 className="mt-2 text-[26px] font-bold text-[#02011A]">
                  {totalSelectedQty}
                </h3>
              </div>
            </div>
          )}

          {/* PRODUCTS */}

          <div className="mb-6">
            <label className="mb-3 block text-[15px] font-semibold text-[#0F172A]">
              Select Products
            </label>

            {loadingItems ? (
              <div className="flex h-[140px] items-center justify-center rounded-[24px] border border-[#E2E8F0]">
                <Loader2 className="h-6 w-6 animate-spin text-[#02011A]" />
              </div>
            ) : products.length ===
              0 ? (
              <EmptyState text="Select category first" />
            ) : (
              <div className="space-y-4">
                {products.map(
                  (item) => (
                    <div
                      key={
                        item.item_id
                      }
                      className="
                        rounded-[24px]
                        border
                        border-[#E2E8F0]
                        bg-white
                        p-4
                        shadow-sm
                        transition-all
                        hover:shadow-md
                      "
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[18px] font-semibold text-[#0F172A]">
                            {item.name}
                          </h3>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-[#64748B]">
                              Current Stock:
                              {" "}
                              {
                                item.stock
                              }
                            </span>

                            <ToneBadge
                              tone={
                                item.tone
                              }
                            />
                          </div>
                        </div>

                        <input
                          type="text"
                          value={item.qty}
                          onChange={(e) =>
                            handleQtyChange(
                              item,
                              e.target
                                .value
                            )
                          }
                          placeholder="Qty"
                          className="
                            h-[52px]
                            w-full
                            rounded-[18px]
                            border
                            border-transparent
                            bg-[#F8FAFC]
                            px-4
                            text-sm
                            font-medium
                            outline-none
                            transition-all
                            focus:border-[#02011A]
                            focus:bg-white
                            sm:w-[120px]
                          "
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* NOTES */}

          <div className="mb-4">
            <label className="mb-3 block text-[15px] font-semibold text-[#0F172A]">
              Additional Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Add any additional information..."
              className="
                h-[120px]
                w-full
                resize-none
                rounded-[24px]
                border
                border-[#E2E8F0]
                bg-[#F8FAFC]
                p-5
                text-sm
                outline-none
                transition-all
                focus:border-[#02011A]
                focus:bg-white
              "
            />
          </div>
        </div>

        {/* FOOTER */}

        <div className="border-t border-[#F1F5F9] p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="
                h-[56px]
                rounded-[18px]
                border
                border-[#E2E8F0]
                bg-white
                text-sm
                font-semibold
                text-[#0F172A]
                transition-all
                hover:bg-[#F8FAFC]
              "
            >
              Cancel
            </button>

            <button
              onClick={
                handleSubmit
              }
              disabled={submitting}
              className="
                flex
                h-[56px]
                items-center
                justify-center
                rounded-[18px]
                bg-[#02011A]
                text-sm
                font-semibold
                text-white
                transition-all
                hover:opacity-95
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Send Request"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(
    modal,
    document.body
  );
}