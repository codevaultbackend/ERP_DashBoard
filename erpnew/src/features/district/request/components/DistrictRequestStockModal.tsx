"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import {
  createStockRequest,
  getStockCategories,
  getStockItemsByCategory,
  requestApi,
  type CategoryItemApi,
  type CategoryRowApi,
} from "../../../retail/request/api/request-api";

type RequestTargetLevel = "head" | "retail";

type OrganizationOption = {
  id: number;
  store_code?: string;
  store_name?: string;
  organization_level?: string;
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
  tone: "critical" | "medium" | "optimum";
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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeText(value: unknown, fallback = "Not found") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function safeNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getToneFromStock(quantity: number): "critical" | "medium" | "optimum" {
  if (quantity <= 5) return "critical";
  if (quantity <= 15) return "medium";
  return "optimum";
}

function getOrganizationLabel(org: OrganizationOption | null) {
  if (!org) return "";
  return org.store_name || org.store_code || `Store ${org.id}`;
}

function mapCategoryRowToOption(row: CategoryRowApi): RequestCategoryOption {
  return {
    label: safeText(row?.category),
    value: safeText(row?.category),
    quantity: safeNumber(row?.quantity),
  };
}

function mapCategoryItemToRequestProduct(
  row: CategoryItemApi,
  category: string,
  selectedQty = ""
): RequestableProduct {
  const stock = safeNumber(row?.available_qty ?? row?.quantity);

  return {
    item_id: safeNumber(row?.id),
    category,
    name: safeText(row?.item_name || row?.article_code || row?.sku_code, "Item"),
    stock,
    article_code: safeText(row?.article_code || row?.sku_code, ""),
    qty: selectedQty,
    tone: getToneFromStock(stock),
  };
}

function ToneBadge({ tone }: { tone: RequestableProduct["tone"] }) {
  const toneClass =
    tone === "critical"
      ? "border-[#FF9B8F] bg-[#FFF1F0] text-[#F04438]"
      : tone === "optimum"
      ? "border-[#86EFAC] bg-[#F0FDF4] text-[#16A34A]"
      : "border-[#F5C27B] bg-[#FFF3E2] text-[#F59E0B]";

  return (
    <span
      className={cn(
        "inline-flex h-[22px] min-w-[68px] items-center justify-center rounded-full border px-[10px]",
        "text-[13px] font-normal leading-none tracking-[-0.02em] capitalize",
        toneClass
      )}
    >
      {tone}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[74px] items-center justify-center rounded-[13px] border border-dashed border-[#D7DCE5] bg-white px-4 text-center text-[14px] font-medium text-erp-muted">
      {text}
    </div>
  );
}

export default function DistrictRequestStockModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [mounted, setMounted] = useState(false);

  const [targetLevel, setTargetLevel] = useState<RequestTargetLevel>("head");
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [targetSearch, setTargetSearch] = useState("");
  const [selectedTarget, setSelectedTarget] =
    useState<OrganizationOption | null>(null);

  const [priority, setPriority] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notes, setNotes] = useState("");

  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<
    RequestCategoryOption[]
  >([]);
  const [products, setProducts] = useState<RequestableProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    Record<number, SelectedRequestItem>
  >({});

  const [loadingTargets, setLoadingTargets] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submitting]);

  useEffect(() => {
    if (!open) return;

    const fetchTargets = async () => {
      try {
        setLoadingTargets(true);
        setError("");
        setTargetDropdownOpen(false);
        setSelectedTarget(null);
        setSelectedCategory("");
        setProducts([]);
        setSelectedItems({});

        const level = targetLevel === "head" ? "head" : "retail";

        const res = await requestApi.get("/staff/organizations-by-level", {
          params: { level },
        });

        const rows: OrganizationOption[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];

        const activeRows = rows.filter((row) => row?.is_active !== false);

        setOrganizations(activeRows);

        if (targetLevel === "head" && activeRows.length === 1) {
          setSelectedTarget(activeRows[0]);
        }
      } catch (err: any) {
        setOrganizations([]);
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load request targets"
        );
      } finally {
        setLoadingTargets(false);
      }
    };

    fetchTargets();
  }, [open, targetLevel]);

  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        const res = await getStockCategories();
        const rows: CategoryRowApi[] = Array.isArray(res?.data) ? res.data : [];

        const mapped = rows
          .map(mapCategoryRowToOption)
          .filter((item) => item.value && item.value !== "Not found");

        setCategoryOptions(mapped);
      } catch (err: any) {
        setCategoryOptions([]);
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load categories"
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [open]);

  useEffect(() => {
    if (!open || !selectedCategory) {
      setProducts([]);
      return;
    }

    let cancelled = false;

    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        setError("");

        const res = await getStockItemsByCategory(selectedCategory, {
          organization_id: selectedTarget?.id,
        });

        const rows: CategoryItemApi[] = Array.isArray(res?.data) ? res.data : [];

        if (cancelled) return;

        const mapped = rows
          .map((row) => {
            const id = safeNumber(row?.id);

            return mapCategoryItemToRequestProduct(
              row,
              selectedCategory,
              selectedItems[id]?.request_qty
                ? String(selectedItems[id]?.request_qty)
                : ""
            );
          })
          .filter((item) => item.item_id > 0);

        setProducts(mapped);
      } catch (err: any) {
        if (!cancelled) {
          setProducts([]);
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Failed to load products"
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingItems(false);
        }
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
    // selectedItems intentionally removed for smooth qty typing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selectedCategory, selectedTarget?.id]);

  const selectedCount = useMemo(
    () => Object.keys(selectedItems).length,
    [selectedItems]
  );

  const selectedCategoryCount = useMemo(() => {
    return new Set(Object.values(selectedItems).map((item) => item.category))
      .size;
  }, [selectedItems]);

  const filteredOrganizations = useMemo(() => {
    const query = targetSearch.trim().toLowerCase();

    if (!query) return organizations;

    return organizations.filter((org) => {
      const text = [
        org.id,
        org.store_code,
        org.store_name,
        org.organization_level,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [organizations, targetSearch]);

  if (!open || !mounted) return null;

  function resetModal() {
    setTargetLevel("head");
    setTargetDropdownOpen(false);
    setCategoryOpen(false);
    setTargetSearch("");
    setSelectedTarget(null);
    setPriority("medium");
    setSelectedCategory("");
    setNotes("");
    setOrganizations([]);
    setCategoryOptions([]);
    setProducts([]);
    setSelectedItems({});
    setError("");
  }

  function handleClose() {
    if (submitting) return;
    resetModal();
    onClose();
  }

  const sanitizeQtyInput = (value: string) => {
    return value.replace(/[^\d]/g, "").slice(0, 5);
  };

  const handleQtyChange = (product: RequestableProduct, rawValue: string) => {
    const value = sanitizeQtyInput(rawValue);

    setProducts((prev) =>
      prev.map((item) =>
        item.item_id === product.item_id
          ? {
              ...item,
              qty: value,
            }
          : item
      )
    );

    setSelectedItems((prev) => {
      const next = { ...prev };
      const qty = Number(value);

      if (!value || !Number.isFinite(qty) || qty <= 0) {
        delete next[product.item_id];
        return next;
      }

      next[product.item_id] = {
        item_id: product.item_id,
        category: product.category,
        name: product.name,
        request_qty: qty,
      };

      return next;
    });
  };

  const removeSelectedItem = (itemId: number) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });

    setProducts((prev) =>
      prev.map((item) =>
        item.item_id === itemId
          ? {
              ...item,
              qty: "",
            }
          : item
      )
    );
  };

  const validateBeforeSubmit = () => {
    if (!selectedTarget?.id) {
      return targetLevel === "head"
        ? "Please select Head Office"
        : "Please select Retail Store";
    }

    if (!priority.trim()) {
      return "Please select priority";
    }

    const payloadItems = Object.values(selectedItems).filter(
      (item) => Number(item.request_qty) > 0
    );

    if (!payloadItems.length) {
      return "Please select at least one item and enter quantity";
    }

    return "";
  };

  const handleSubmit = async () => {
    try {
      if (submitting) return;

      const validationMessage = validateBeforeSubmit();

      if (validationMessage) {
        setError(validationMessage);
        return;
      }

      setSubmitting(true);
      setError("");

      const payloadItems = Object.values(selectedItems)
        .filter((item) => Number(item.request_qty) > 0)
        .map((item) => ({
          item_id: item.item_id,
          request_qty: item.request_qty,
        }));

      const selectedCategories = Array.from(
        new Set(Object.values(selectedItems).map((item) => item.category))
      );

      await createStockRequest({
        store_id: selectedTarget!.id,
        priority,
        category: selectedCategories.join(", "),
        notes: notes.trim() || "Not found",
        items: payloadItems,
      });

      resetModal();
      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to send request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <div
      onMouseDown={() => {
        setCategoryOpen(false);
        setTargetDropdownOpen(false);
      }}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/35 px-[14px] py-[20px] font-erp backdrop-blur-[1px] sm:px-6 sm:py-[34px]"
    >
      <div className="mx-auto flex min-h-[calc(100svh-40px)] w-full max-w-[556px] items-center justify-center">
        <div
          onMouseDown={(event) => event.stopPropagation()}
          className="relative flex w-full max-h-[calc(100svh-40px)] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0px_24px_70px_rgba(15,23,42,0.24)]"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 px-[28px] pb-[18px] pt-[24px] max-sm:px-[20px] max-sm:pt-[18px]">
            <h3 className="min-w-0 text-[20px] font-semibold leading-[25px] tracking-[-0.035em] text-[#0A0A0A] max-sm:text-[18px]">
              Request Stock from Head Office / Retail Store
            </h3>

            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[#222222] transition hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close request stock modal"
            >
              <X className="h-[18px] w-[18px] stroke-[2.1]" />
            </button>
          </div>

          <div className="dashboard-hidden-scroll flex-1 overflow-y-auto px-[28px] pb-[18px] max-sm:px-[20px]">
            {error ? (
              <div className="mb-[14px] rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium leading-[18px] text-red-700">
                {error}
              </div>
            ) : null}

            <div>
              <p className="mb-[8px] text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-[#0A0A0A]">
                Select Source
              </p>

              <div className="grid h-[52px] grid-cols-2 rounded-full bg-[#060313] p-[6px]">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setTargetLevel("head")}
                  className={cn(
                    "flex items-center justify-center rounded-full text-[16px] font-medium leading-[20px] tracking-[-0.02em] transition",
                    targetLevel === "head"
                      ? "bg-transparent text-white"
                      : "bg-white text-[#111111]"
                  )}
                >
                  Head Office
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setTargetLevel("retail")}
                  className={cn(
                    "flex items-center justify-center rounded-full text-[16px] font-medium leading-[20px] tracking-[-0.02em] transition",
                    targetLevel === "retail"
                      ? "bg-transparent text-white"
                      : "bg-white text-[#111111]"
                  )}
                >
                  Retail Store
                </button>
              </div>
            </div>

            <div className="relative mt-[22px]">
              <label className="mb-[8px] block text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-[#0A0A0A]">
                {targetLevel === "head"
                  ? "Select Head Office"
                  : "Select Retail Store"}
              </label>

              <button
                type="button"
                disabled={submitting || loadingTargets}
                onClick={() => setTargetDropdownOpen((prev) => !prev)}
                className="flex h-[44px] w-full items-center justify-between rounded-full border border-[#F1F5F9] bg-white px-[22px] text-left text-[16px] font-medium leading-[22px] tracking-[-0.02em] text-[#111111] shadow-erp-card outline-none transition hover:bg-[#FAFAFB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="truncate">
                  {loadingTargets
                    ? "Loading..."
                    : selectedTarget
                    ? getOrganizationLabel(selectedTarget)
                    : targetLevel === "head"
                    ? "Select Head Office"
                    : "Select Retail Store"}
                </span>

                <ChevronDown
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 text-[#111111] transition",
                    targetDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {targetDropdownOpen ? (
                <div className="absolute left-0 right-0 top-[76px] z-[80] overflow-hidden rounded-[16px] border border-erp-border bg-white shadow-[0px_14px_34px_rgba(15,23,42,0.14)]">
                  <div className="border-b border-[#F1F5F9] p-2">
                    <div className="flex h-[40px] items-center gap-2 rounded-[12px] bg-[#F5F6F8] px-3">
                      <Search className="h-4 w-4 text-[#98A2B3]" />
                      <input
                        value={targetSearch}
                        onChange={(event) =>
                          setTargetSearch(event.target.value)
                        }
                        placeholder="Search store..."
                        className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#98A2B3]"
                      />
                    </div>
                  </div>

                  <div className="dashboard-hidden-scroll max-h-[220px] overflow-y-auto p-2">
                    {loadingTargets ? (
                      <div className="flex h-[42px] items-center px-4 text-[14px] font-medium text-erp-muted">
                        Loading...
                      </div>
                    ) : filteredOrganizations.length === 0 ? (
                      <div className="flex h-[42px] items-center px-4 text-[14px] font-medium text-erp-muted">
                        No store found
                      </div>
                    ) : (
                      filteredOrganizations.map((org) => {
                        const active = selectedTarget?.id === org.id;

                        return (
                          <button
                            key={`${org.id}-${org.store_code}`}
                            type="button"
                            onClick={() => {
                              setSelectedTarget(org);
                              setTargetDropdownOpen(false);
                            }}
                            className={cn(
                              "flex min-h-[46px] w-full flex-col justify-center rounded-[12px] px-4 text-left transition",
                              active
                                ? "bg-erp-primary-soft text-erp-primary"
                                : "text-erp-heading hover:bg-erp-card-soft"
                            )}
                          >
                            <span className="truncate text-[14px] font-semibold leading-[20px] tracking-[-0.02em]">
                              {getOrganizationLabel(org)}
                            </span>

                            <span className="truncate text-[12px] font-medium leading-[16px] text-erp-muted">
                              {org.store_code || "No code"} ·{" "}
                              {org.organization_level || targetLevel}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-[17px] grid grid-cols-1 gap-[14px] sm:grid-cols-[1fr_150px] sm:items-end sm:gap-[100px]">
              <div>
                <label className="mb-[7px] block text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-[#0A0A0A]">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  disabled={submitting}
                  className="h-[44px] w-full rounded-[8px] border border-[#D6DDE7] bg-white px-[14px] text-[15px] font-medium leading-[20px] text-erp-text outline-none transition focus:border-erp-primary focus:ring-2 focus:ring-erp-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Select priority</option>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>

              <div className="relative">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setCategoryOpen((prev) => !prev)}
                  className="flex h-[44px] w-full items-center justify-between rounded-full border border-[#F1F5F9] bg-white px-[22px] text-left text-[16px] font-medium leading-[22px] tracking-[-0.02em] text-[#111111] shadow-erp-card outline-none transition hover:bg-[#FAFAFB] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="truncate">
                    {loadingCategories
                      ? "Loading..."
                      : selectedCategory || "Category"}
                  </span>

                  <ChevronDown
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 text-[#111111] transition",
                      categoryOpen && "rotate-180"
                    )}
                  />
                </button>

                {categoryOpen ? (
                  <div className="absolute right-0 top-[52px] z-[70] w-full overflow-hidden rounded-[16px] border border-erp-border bg-white shadow-[0px_14px_34px_rgba(15,23,42,0.14)] sm:w-[220px]">
                    <div className="dashboard-hidden-scroll max-h-[230px] overflow-y-auto p-2">
                      {loadingCategories ? (
                        <div className="flex h-[42px] items-center px-4 text-[14px] font-medium text-erp-muted">
                          Loading...
                        </div>
                      ) : categoryOptions.length === 0 ? (
                        <div className="flex h-[42px] items-center px-4 text-[14px] font-medium text-erp-muted">
                          Not found
                        </div>
                      ) : (
                        categoryOptions.map((cat) => {
                          const active = selectedCategory === cat.value;
                          const categorySelectedCount = Object.values(
                            selectedItems
                          ).filter((item) => item.category === cat.value).length;

                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat.value);
                                setCategoryOpen(false);
                              }}
                              className={cn(
                                "flex h-[42px] w-full items-center justify-between rounded-[12px] px-4 text-left transition",
                                active
                                  ? "bg-erp-primary-soft text-erp-primary"
                                  : "text-erp-heading hover:bg-erp-card-soft"
                              )}
                            >
                              <span className="truncate text-[14px] font-medium leading-[20px] tracking-[-0.02em]">
                                {safeText(cat.label)}
                              </span>

                              <span className="ml-3 shrink-0 text-[12px] font-medium text-erp-muted">
                                {categorySelectedCount > 0
                                  ? `${categorySelectedCount} selected`
                                  : safeNumber(cat.quantity)}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-[17px]">
              <p className="mb-[9px] text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-[#0A0A0A]">
                Select Products
                {selectedCount > 0
                  ? ` (${selectedCount} selected from ${selectedCategoryCount} categories)`
                  : ""}
              </p>

              {selectedCount > 0 ? (
                <div className="mb-[10px] flex max-h-[82px] flex-wrap gap-2 overflow-y-auto rounded-[12px] border border-[#E1E4EA] bg-[#FAFBFC] p-2">
                  {Object.values(selectedItems).map((item) => (
                    <button
                      key={item.item_id}
                      type="button"
                      onClick={() => removeSelectedItem(item.item_id)}
                      disabled={submitting}
                      className="inline-flex max-w-full items-center gap-2 rounded-full border border-erp-border bg-white px-3 py-1.5 text-[12px] font-medium text-erp-heading shadow-sm transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="truncate">
                        {item.name} · Qty {item.request_qty}
                      </span>
                      <X className="h-[14px] w-[14px] shrink-0 text-erp-muted" />
                    </button>
                  ))}
                </div>
              ) : null}

              {!selectedTarget ? (
                <EmptyState
                  text={
                    targetLevel === "head"
                      ? "Please select Head Office first"
                      : "Please select Retail Store first"
                  }
                />
              ) : !selectedCategory ? (
                <EmptyState text="Please select a category first" />
              ) : loadingItems ? (
                <div className="flex min-h-[77px] items-center justify-center rounded-[13px] border border-[#E1E4EA] bg-white px-4 text-[14px] font-medium text-erp-muted">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading items...
                </div>
              ) : products.length === 0 ? (
                <EmptyState text="No products found" />
              ) : (
                <div className="dashboard-hidden-scroll max-h-[300px] space-y-[10px] overflow-y-auto pr-[2px] max-sm:max-h-[34svh]">
                  {products.map((item) => {
                    const isSelected = safeNumber(item.qty) > 0;

                    return (
                      <div
                        key={item.item_id}
                        className={cn(
                          "grid min-h-[74px] items-center rounded-[13px] border bg-white px-[14px] py-[10px] transition",
                          "grid-cols-[minmax(0,1fr)_120px] gap-[14px]",
                          "max-sm:grid-cols-1 max-sm:gap-[10px]",
                          isSelected
                            ? "border-erp-primary bg-erp-primary-soft/35"
                            : "border-[#E1E4EA]"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[18px] font-medium leading-[24px] tracking-[-0.03em] text-[#101010]">
                            {safeText(item.name, "Item")}
                          </p>

                          <div className="mt-[4px] flex flex-wrap items-center gap-[7px]">
                            <p className="text-[16px] font-normal leading-[20px] tracking-[-0.02em] text-erp-muted">
                              Current Stock: {safeNumber(item.stock)}
                            </p>
                            <ToneBadge tone={item.tone} />
                          </div>
                        </div>

                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.qty}
                          disabled={submitting}
                          onChange={(event) =>
                            handleQtyChange(item, event.target.value)
                          }
                          placeholder="Qty"
                          autoComplete="off"
                          className="h-[44px] w-full rounded-[9px] border-0 bg-[#F4F4F6] px-[14px] text-[15px] font-medium leading-[20px] text-erp-text outline-none placeholder:text-[#6B7280] focus:ring-2 focus:ring-erp-primary/15 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[40px]"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-[17px]">
              <label className="mb-[5px] block text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-[#0A0A0A]">
                Additional Notes
              </label>

              <textarea
                value={notes}
                disabled={submitting}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add any additional information..."
                className="h-[70px] w-full resize-none rounded-[10px] border-0 bg-[#F4F4F6] px-[14px] py-[13px] text-[15px] font-normal leading-[20px] text-erp-text outline-none placeholder:text-[#747489] focus:ring-2 focus:ring-erp-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-1 gap-[10px] bg-white px-[28px] pb-[27px] pt-[12px] sm:grid-cols-2 sm:gap-[12px] max-sm:px-[20px] max-sm:pb-[18px]">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="h-[42px] rounded-[9px] border border-erp-border bg-white text-[16px] font-normal tracking-[-0.02em] text-[#111111] transition hover:bg-erp-card-soft disabled:cursor-not-allowed disabled:opacity-60 sm:h-[40px]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex h-[42px] items-center justify-center rounded-[9px] bg-erp-dark text-[16px] font-normal tracking-[-0.02em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[40px]"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Request"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}