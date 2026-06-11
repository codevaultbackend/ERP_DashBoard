"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2, X } from "lucide-react";
import {
  createStockRequest,
  getStockCategories,
  getStockItemsByCategory,
  type CategoryItemApi,
  type CategoryRowApi,
} from "../api/request-api";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const safeText = (val: unknown, fallback = "Not found") => {
  if (val === null || val === undefined || val === "") return fallback;
  return String(val);
};

const safeNumber = (val: unknown) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
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
  storeId: number | string;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => Promise<void> | void;
};

function mapCategoryRowToOption(row: CategoryRowApi): RequestCategoryOption {
  return {
    label: safeText(row?.category),
    value: safeText(row?.category),
    quantity: safeNumber(row?.quantity),
  };
}

function getToneFromStock(quantity: number): "critical" | "medium" | "optimum" {
  if (quantity <= 5) return "critical";
  if (quantity <= 15) return "medium";
  return "optimum";
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
  const cls =
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
        cls
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

export default function RequestStockModal({
  open,
  onClose,
  storeId,
  submitting,
  setSubmitting,
  onSuccess,
}: Props) {
  const [mounted, setMounted] = useState(false);

  const [priority, setPriority] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<
    RequestCategoryOption[]
  >([]);
  const [products, setProducts] = useState<RequestableProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    Record<number, SelectedRequestItem>
  >({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submitting]);

  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        const res = await getStockCategories();
        const rows: CategoryRowApi[] = Array.isArray(res?.data) ? res.data : [];

        setCategoryOptions(
          rows
            .map(mapCategoryRowToOption)
            .filter((item) => item.value && item.value !== "Not found")
        );
      } catch (err: any) {
        setError(
          safeText(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message,
            "Failed to load categories"
          )
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [open]);

useEffect(() => {
  if (!selectedTarget) {
    setCategoryOptions([]);
    return;
  }

  const inventory =
    selectedTarget.inventory || [];

  const categories = inventory.map(
    (item) => ({
      label: item.category,
      value: item.category,
      quantity: item.total_qty || 0,
    })
  );

  setCategoryOptions(categories);
}, [selectedTarget]);

  const selectedCount = useMemo(
    () => Object.keys(selectedItems).length,
    [selectedItems]
  );

  const selectedCategoryCount = useMemo(() => {
    return new Set(Object.values(selectedItems).map((item) => item.category))
      .size;
  }, [selectedItems]);

  if (!open || !mounted) return null;

  const resetModal = () => {
    setPriority("medium");
    setSelectedCategory("");
    setCategoryOpen(false);
    setNotes("");
    setProducts([]);
    setSelectedItems({});
    setError("");
  };

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
      prev.map((p) =>
        p.item_id === product.item_id ? { ...p, qty: value } : p
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
        item.item_id === itemId ? { ...item, qty: "" } : item
      )
    );
  };

  const handleSubmit = async () => {
  try {
    if (submitting) return;

    setSubmitting(true);
    setError("");

    const numericStoreId = Number(storeId);

    if (!numericStoreId) {
      setError("Store not found");
      return;
    }

    if (!priority) {
      setError("Please select priority");
      return;
    }

    const payloadItems = Object.values(selectedItems)
      .map((item) => ({
        item_id: Number(item.item_id),
        request_qty: Number(item.request_qty),
      }))
      .filter(
        (item) =>
          item.item_id > 0 &&
          Number.isFinite(item.request_qty) &&
          item.request_qty > 0
      );

    if (payloadItems.length === 0) {
      setError(
        "Please select at least one item and enter quantity"
      );
      return;
    }

    const payload = {
      store_id: numericStoreId,

      priority: priority.toLowerCase(),

      // IMPORTANT FIX
      category: selectedCategory || '',

      notes: notes.trim() || "",

      items: payloadItems,
    };

    console.group(
      "📤 FINAL STOCK REQUEST PAYLOAD"
    );

    console.log(payload);

    console.table(payload.items);

    console.groupEnd();

    await createStockRequest(payload);

    resetModal();

    await onSuccess();

    onClose();

  } catch (err: any) {
    console.log(
      "API ERROR:",
      err?.response?.data
    );

    setError(
      safeText(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message,
        "Failed to send request"
      )
    );
  } finally {
    setSubmitting(false);
  }
};

  const modal = (
    <div
      className={[
        "fixed inset-0 z-[99999] bg-black/35 font-erp backdrop-blur-[1px]",
        "overflow-y-auto overscroll-contain",
      ].join(" ")}
      onMouseDown={() => setCategoryOpen(false)}
    >
      <div
        className={[
          "flex min-h-[100svh] w-full justify-center",
          "px-[14px] py-[20px]",
          "sm:px-6 sm:py-[34px]",
          "lg:items-start lg:py-[48px]",
        ].join(" ")}
      >
        <div
          onMouseDown={(event) => event.stopPropagation()}
          className={[
            "relative my-auto flex w-full max-w-[556px] flex-col overflow-hidden bg-white",
            "rounded-[22px] shadow-[0px_24px_70px_rgba(15,23,42,0.24)]",
            "max-h-[calc(100svh-40px)]",
            "sm:rounded-[24px] sm:max-h-[calc(100svh-68px)]",
            "lg:my-0 lg:max-h-[calc(100svh-96px)]",
          ].join(" ")}
        >
          <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 bg-white px-[20px] pb-[15px] pt-[18px] sm:px-[28px] sm:pb-[20px] sm:pt-[24px]">
            <h3 className="min-w-0 text-[18px] font-semibold leading-[23px] tracking-[-0.035em] text-[#0A0A0A] sm:text-[20px] sm:leading-[25px]">
              Request Stock from District Manager
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

          <div className="dashboard-hidden-scroll flex-1 overflow-y-auto px-[20px] pb-[16px] sm:px-[28px] sm:pb-[18px]">
            {error ? (
              <div className="mb-[14px] rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium leading-[18px] text-red-700">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-[1fr_150px] sm:items-end sm:gap-[100px]">
              <div>
                <label className="mb-[7px] block text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-[#0A0A0A]">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
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
                  onMouseDown={(e) => e.stopPropagation()}
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
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute right-0 top-[52px] z-[160] w-full overflow-hidden rounded-[16px] border border-erp-border bg-white shadow-[0px_14px_34px_rgba(15,23,42,0.14)] sm:w-[220px]"
                  >
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

              {!selectedCategory ? (
                <EmptyState text="Please select a category first" />
              ) : loadingItems ? (
                <div className="flex min-h-[77px] items-center justify-center rounded-[13px] border border-[#E1E4EA] bg-white px-4 text-[14px] font-medium text-erp-muted">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading items...
                </div>
              ) : products.length === 0 ? (
                <EmptyState text="Not found" />
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
                          onChange={(e) =>
                            handleQtyChange(item, e.target.value)
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
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information..."
                className="h-[70px] w-full resize-none rounded-[10px] border-0 bg-[#F4F4F6] px-[14px] py-[13px] text-[15px] font-normal leading-[20px] text-erp-text outline-none placeholder:text-[#747489] focus:ring-2 focus:ring-erp-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div className="sticky bottom-0 z-10 grid shrink-0 grid-cols-1 gap-[10px] bg-white px-[20px] pb-[18px] pt-[12px] sm:grid-cols-2 sm:gap-[12px] sm:px-[28px] sm:pb-[27px]">
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