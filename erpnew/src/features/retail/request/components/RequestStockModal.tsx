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

type RequestCategoryOption = {
  label: string;
  value: string;
  quantity: number;
};

type RequestableProduct = {
  item_id: number;
  name: string;
  stock: number;
  article_code?: string;
  qty: string;
  tone: "critical" | "medium" | "optimum";
};

function mapCategoryRowToOption(row: CategoryRowApi): RequestCategoryOption {
  return {
    label: row.category,
    value: row.category,
    quantity: Number(row.quantity || 0),
  };
}

function getToneFromStock(quantity: number): "critical" | "medium" | "optimum" {
  if (quantity <= 5) return "critical";
  if (quantity <= 15) return "medium";
  return "optimum";
}

function mapCategoryItemToRequestProduct(row: CategoryItemApi): RequestableProduct {
  const stock = Number(row.available_qty ?? row.quantity ?? 0);

  return {
    item_id: row.id,
    name: row.item_name,
    stock,
    article_code: row.article_code,
    qty: "",
    tone: getToneFromStock(stock),
  };
}

function ToneBadge({ tone }: { tone: string }) {
  const cls =
    tone === "critical"
      ? "border-[#FCA5A5] bg-[#FFF1F1] text-[#EF4444]"
      : tone === "optimum"
      ? "border-[#86EFAC] bg-[#ECFDF3] text-[#16A34A]"
      : "border-[#F7C97B] bg-[#FFF5E8] text-[#F59E0B]";

  return (
    <span
      className={cn(
        "inline-flex h-[30px] items-center rounded-full border px-3 text-[14px] font-medium capitalize",
        cls
      )}
    >
      {tone}
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
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<RequestCategoryOption[]>([]);
  const [products, setProducts] = useState<RequestableProduct[]>([]);

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
        setError(
          err?.response?.data?.message || err?.message || "Failed to fetch categories"
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

    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        setError("");

        const res = await getStockItemsByCategory(selectedCategory);
        const rows: CategoryItemApi[] = Array.isArray(res?.data) ? res.data : [];
        setProducts(rows.map(mapCategoryItemToRequestProduct));
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || "Failed to fetch category items"
        );
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [open, selectedCategory]);

  const selectedCount = useMemo(
    () => products.filter((item) => Number(item.qty) > 0).length,
    [products]
  );

  if (!open) return null;

  const resetModal = () => {
    setPriority("medium");
    setSelectedCategory("");
    setNotes("");
    setProducts([]);
    setError("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      const payloadItems = products
        .filter((item) => Number(item.qty) > 0)
        .map((item) => ({
          item_id: item.item_id,
          request_qty: Number(item.qty),
        }));

      if (!storeId) {
        setError("store_id not found");
        return;
      }

      if (!selectedCategory) {
        setError("Please select a category");
        return;
      }

      if (payloadItems.length === 0) {
        setError("Please select at least one item and enter quantity");
        return;
      }

      await createStockRequest({
        store_id: storeId,
        priority,
        category: selectedCategory,
        notes,
        items: payloadItems,
      });

      resetModal();
      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to create request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(17,24,39,0.26)] p-3 sm:p-4">
      <div className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-[34px] bg-white p-6 shadow-[0px_18px_48px_rgba(0,0,0,0.18)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[18px] font-semibold tracking-[-0.04em] text-[#0A0A0A] sm:text-[19px]">
            Request Stock from District Manager
          </h3>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-[#555] transition hover:bg-[#F5F5F7]"
          >
            <X className="h-[20px] w-[20px]" />
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-[1fr_180px]">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111111]">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-[48px] w-full rounded-[14px] border border-[#D8DEE7] bg-white px-4 text-[15px] text-[#111111] outline-none"
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111111]">
              Category
            </label>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-[48px] w-full appearance-none rounded-full border border-[#ECECEC] bg-white px-6 pr-12 text-[16px] font-medium text-[#111111] shadow-[0px_2px_8px_rgba(0,0,0,0.04)] outline-none"
              >
                <option value="">
                  {loadingCategories ? "Loading..." : "Category"}
                </option>
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#111111]" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[14px] font-medium text-[#0A0A0A]">
            Select Products{selectedCount > 0 ? ` (${selectedCount} selected)` : ""}
          </p>

          {!selectedCategory ? (
            <div className="rounded-[18px] border border-dashed border-[#D0D5DD] bg-[#FAFAFA] px-4 py-8 text-center text-[15px] text-[#667085]">
              Please select a category first
            </div>
          ) : loadingItems ? (
            <div className="rounded-[18px] border border-dashed border-[#D0D5DD] bg-[#FAFAFA] px-4 py-8 text-center text-[15px] text-[#667085]">
              Loading items...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[#D0D5DD] bg-[#FAFAFA] px-4 py-8 text-center text-[15px] text-[#667085]">
              No items found in this category
            </div>
          ) : (
            <div className="max-h-[330px] space-y-3 overflow-y-auto pr-1">
              {products.map((item) => (
                <div
                  key={item.item_id}
                  className="grid grid-cols-1 gap-4 rounded-[18px] border border-[#E4E7EC] bg-white px-4 py-4 md:grid-cols-[1fr_106px]"
                >
                  <div>
                    <p className="text-[16px] font-medium leading-[1.2] text-[#0A0A0A]">
                      {item.name}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-[14px] leading-[20px] text-[#6A7282]">
                        Current Stock: {item.stock}
                      </p>
                      <ToneBadge tone={item.tone} />
                    </div>
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={item.qty}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.item_id === item.item_id ? { ...p, qty: e.target.value } : p
                        )
                      )
                    }
                    placeholder="Qty"
                    className="h-[54px] rounded-[12px] bg-[#F5F5F7] px-4 text-[16px] text-[#111827] outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-[16px] font-medium text-[#111111]">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional information..."
            className="min-h-[100px] w-full resize-none rounded-[16px] bg-[#F5F5F7] px-4 py-4 text-[16px] text-[#667085] outline-none"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleClose}
            className="h-[56px] rounded-[16px] border border-[#D9DCE3] bg-white text-[16px] font-medium text-[#111111]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-[56px] rounded-[16px] bg-[#02051B] text-[16px] font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}