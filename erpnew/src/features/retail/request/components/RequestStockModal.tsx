"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
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

const safeText = (val: any) => {
  if (val === null || val === undefined || val === "") return "Not found";
  return String(val);
};

const safeNumber = (val: any) => {
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
    name: safeText(row?.item_name),
    stock,
    article_code: safeText(row?.article_code),
    qty: selectedQty,
    tone: getToneFromStock(stock),
  };
}

function ToneBadge({ tone }: { tone: string }) {
  const cls =
    tone === "critical"
      ? "border-[#FF9B8F] bg-[#FFF1F0] text-[#F04438]"
      : tone === "optimum"
      ? "border-[#86EFAC] bg-[#F0FDF4] text-[#16A34A]"
      : "border-[#F5C27B] bg-[#FFF3E2] text-[#F59E0B]";

  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center rounded-erp-full border px-[10px] text-[12px] font-normal leading-none capitalize",
        cls
      )}
    >
      {safeText(tone)}
    </span>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  storeId: number | string;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => Promise<void> | void;
};

export default function RequestStockModal({
  open,
  onClose,
  storeId,
  submitting,
  setSubmitting,
  onSuccess,
}: Props) {
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

  /*
    ✅ IMPORTANT FIX:
    This stores selected quantities globally.
    So switching category will NOT clear old selected products.
  */
  const [selectedItems, setSelectedItems] = useState<
    Record<number, SelectedRequestItem>
  >({});

  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        const res = await getStockCategories();
        const rows: CategoryRowApi[] = Array.isArray(res?.data) ? res.data : [];

        setCategoryOptions(rows.map(mapCategoryRowToOption));
      } catch (err: any) {
        setError(safeText(err?.response?.data?.message || err?.message));
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

    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        setError("");

        const res = await getStockItemsByCategory(selectedCategory);
        const rows: CategoryItemApi[] = Array.isArray(res?.data) ? res.data : [];

        setProducts(
          rows.map((row) =>
            mapCategoryItemToRequestProduct(
              row,
              selectedCategory,
              selectedItems[safeNumber(row?.id)]?.request_qty
                ? String(selectedItems[safeNumber(row?.id)]?.request_qty)
                : ""
            )
          )
        );
      } catch (err: any) {
        setError(safeText(err?.response?.data?.message || err?.message));
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [open, selectedCategory, selectedItems]);

  const selectedCount = useMemo(
    () => Object.keys(selectedItems).length,
    [selectedItems]
  );

  const selectedCategoryCount = useMemo(() => {
    return new Set(Object.values(selectedItems).map((item) => item.category))
      .size;
  }, [selectedItems]);

  if (!open) return null;

  const resetModal = () => {
    setPriority("medium");
    setSelectedCategory("");
    setCategoryOpen(false);
    setNotes("");
    setProducts([]);
    setSelectedItems({});
    setError("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleQtyChange = (product: RequestableProduct, value: string) => {
    const qty = safeNumber(value);

    setProducts((prev) =>
      prev.map((p) =>
        p.item_id === product.item_id ? { ...p, qty: value } : p
      )
    );

    setSelectedItems((prev) => {
      const next = { ...prev };

      if (qty <= 0) {
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
      setSubmitting(true);
      setError("");

      const payloadItems = Object.values(selectedItems).map((item) => ({
        item_id: item.item_id,
        request_qty: item.request_qty,
      }));

      if (!storeId) {
        setError("Store not found");
        return;
      }

      if (payloadItems.length === 0) {
        setError("Please select at least one item and enter quantity");
        return;
      }

      const selectedCategories = Array.from(
        new Set(Object.values(selectedItems).map((item) => item.category))
      );

      await createStockRequest({
        store_id: storeId,
        priority,
        category: selectedCategories.join(", "),
        notes: notes || "Not found",
        items: payloadItems,
      });

      resetModal();
      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(safeText(err?.response?.data?.message || err?.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onMouseDown={() => setCategoryOpen(false)}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4 py-5 font-erp backdrop-blur-[1px]"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-[600px] flex-col overflow-hidden rounded-erp-2xl bg-erp-card shadow-[0_18px_45px_rgba(15,23,42,0.22)]"
      >
        <div className="flex shrink-0 items-center justify-between px-[28px] pb-[18px] pt-[24px]">
          <h3 className="text-[20px] font-semibold leading-[26px] tracking-[-0.035em] text-[#0A0A0A]">
            Request Stock from District Manager
          </h3>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-erp-full text-[#3F3F46] transition hover:bg-erp-border-soft"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="dashboard-hidden-scroll flex-1 overflow-y-auto px-[28px] pb-[18px]">
          {error ? (
            <div className="mb-4 rounded-erp-xs border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-[1fr_150px] items-end gap-[100px] max-sm:grid-cols-1 max-sm:gap-4">
            <div>
              <label className="mb-[7px] block text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-[#0A0A0A]">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="h-[44px] w-full rounded-[9px] border border-[#D6DDE7] bg-white px-3 text-[15px] font-medium text-erp-text outline-none transition focus:border-erp-primary focus:ring-2 focus:ring-erp-primary/10"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>

            <div className="relative">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex h-[44px] w-full items-center justify-between rounded-erp-full border border-erp-border-soft bg-erp-card px-[22px] text-left text-[16px] font-medium leading-[22px] tracking-[-0.02em] text-[#111111] shadow-erp-card outline-none transition hover:bg-[#FAFAFB]"
              >
                <span className="truncate">
                  {selectedCategory ||
                    (loadingCategories ? "Loading..." : "Category")}
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
                  className="absolute right-0 top-[52px] z-[160] w-full overflow-hidden rounded-erp-sm border border-erp-border bg-erp-card shadow-[0_14px_34px_rgba(15,23,42,0.14)]"
                >
                  <div className="dashboard-hidden-scroll max-h-[220px] overflow-y-auto p-2">
                    {loadingCategories ? (
                      <div className="px-4 py-3 text-[14px] font-medium text-erp-muted">
                        Loading...
                      </div>
                    ) : categoryOptions.length === 0 ? (
                      <div className="px-4 py-3 text-[14px] font-medium text-erp-muted">
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
                              "flex h-[42px] w-full items-center justify-between rounded-erp-xs px-4 text-left text-[15px] font-medium leading-[20px] tracking-[-0.02em] transition",
                              active
                                ? "bg-erp-primary-soft text-erp-primary"
                                : "text-erp-heading hover:bg-erp-card-soft"
                            )}
                          >
                            <span className="truncate">
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
              <div className="mb-3 flex flex-wrap gap-2 rounded-[12px] border border-[#E1E4EA] bg-[#FAFBFC] p-3">
                {Object.values(selectedItems).map((item) => (
                  <button
                    key={item.item_id}
                    type="button"
                    onClick={() => removeSelectedItem(item.item_id)}
                    className="inline-flex max-w-full items-center gap-2 rounded-erp-full border border-erp-border bg-white px-3 py-1.5 text-[12px] font-medium text-erp-heading shadow-sm"
                  >
                    <span className="truncate">
                      {item.name} · Qty {item.request_qty}
                    </span>
                    <X className="h-3.5 w-3.5 shrink-0 text-erp-muted" />
                  </button>
                ))}
              </div>
            ) : null}

            {!selectedCategory ? (
              <EmptyState text="Please select a category first" />
            ) : loadingItems ? (
              <EmptyState text="Loading items..." />
            ) : products.length === 0 ? (
              <EmptyState text="Not found" />
            ) : (
              <div className="dashboard-hidden-scroll max-h-[352px] space-y-[10px] overflow-y-auto pr-[2px]">
                {products.map((item) => {
                  const isSelected = safeNumber(item.qty) > 0;

                  return (
                    <div
                      key={item.item_id}
                      className={cn(
                        "grid min-h-[77px] grid-cols-[1fr_106px] items-center gap-4 rounded-[13px] border bg-white px-[14px] py-[10px] transition max-sm:grid-cols-1",
                        isSelected
                          ? "border-erp-primary bg-erp-primary-soft/40"
                          : "border-[#E1E4EA]"
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[18px] font-medium leading-[24px] tracking-[-0.03em] text-[#101010]">
                          {safeText(item.name)}
                        </p>

                        <div className="mt-[4px] flex flex-wrap items-center gap-[7px]">
                          <p className="text-[16px] font-normal leading-[20px] tracking-[-0.02em] text-erp-muted">
                            Current Stock: {safeNumber(item.stock)}
                          </p>
                          <ToneBadge tone={item.tone} />
                        </div>
                      </div>

                      <input
                        type="number"
                        min="0"
                        value={item.qty}
                        onChange={(e) => handleQtyChange(item, e.target.value)}
                        placeholder="Qty"
                        className="h-[40px] w-[106px] rounded-[9px] border-0 bg-[#F4F4F6] px-[14px] text-[15px] font-medium text-erp-text outline-none placeholder:text-[#6B7280] focus:ring-2 focus:ring-erp-border max-sm:w-full"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-[17px]">
            <label className="mb-[4px] block text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-[#0A0A0A]">
              Additional Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information..."
              className="h-[70px] w-full resize-none rounded-[10px] border-0 bg-[#F4F4F6] px-[14px] py-[13px] text-[15px] font-normal leading-[20px] text-erp-text outline-none placeholder:text-[#747489] focus:ring-2 focus:ring-erp-border"
            />
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-[12px] px-[28px] pb-[27px] max-sm:grid-cols-1">
          <button
            type="button"
            onClick={handleClose}
            className="h-[40px] rounded-[9px] border border-erp-border bg-white text-[16px] font-normal tracking-[-0.02em] text-[#111111] transition hover:bg-erp-card-soft"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-[40px] rounded-[9px] bg-erp-dark text-[16px] font-normal tracking-[-0.02em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[76px] items-center justify-center rounded-[13px] border border-dashed border-[#D7DCE5] px-4 text-center text-[14px] font-medium text-erp-muted">
      {text}
    </div>
  );
}