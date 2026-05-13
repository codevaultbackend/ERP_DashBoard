"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { updateStockPricing } from "./stock-pricing-api";

export type EditableStockPricingItem = {
  id?: string | number;
  item_id?: string | number;
  itemId?: string | number;
  ItemId?: string | number;
  db_item_id?: string | number;
  stock_item_id?: string | number;
  product_id?: string | number;

  article?: string;
  item?: string;
  item_name?: string;
  name?: string;

  code?: string;
  article_code?: string;
  sku_code?: string | null;

  purchasePrice?: string | number | null;
  sellingPrice?: string | number | null;
  makingCharge?: string | number | null;

  purchase_price?: string | number | null;
  purchase_rate?: string | number | null;

  selling_price?: string | number | null;
  sale_rate?: string | number | null;

  making_charge?: string | number | null;

  raw?: any;
};

type Props = {
  open: boolean;
  item: EditableStockPricingItem | null;
  onClose: () => void;
  onUpdated?: () => void | Promise<void>;
};

function isValid(value: unknown) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "null" &&
    value !== "undefined"
  );
}

function pick(...values: unknown[]) {
  const value = values.find(isValid);
  return isValid(value) ? value : "";
}

function toStrictInteger(value: unknown) {
  if (!isValid(value)) return null;

  const raw = String(value).trim();

  /**
   * SKU-STR004-ITM-378951 is not DB item id.
   * Backend needs integer item_id.
   */
  if (!/^\d+$/.test(raw)) return null;

  const number = Number(raw);

  if (!Number.isSafeInteger(number) || number <= 0) return null;

  return number;
}

function getNumericItemId(item: EditableStockPricingItem | null) {
  const raw = item?.raw || {};

  const candidates = [
    item?.item_id,
    item?.itemId,
    item?.ItemId,
    item?.db_item_id,
    item?.stock_item_id,
    item?.product_id,

    raw?.item_id,
    raw?.itemId,
    raw?.ItemId,
    raw?.db_item_id,
    raw?.stock_item_id,
    raw?.product_id,

    raw?.Item?.id,
    raw?.item?.id,
    raw?.Product?.id,
    raw?.product?.id,

    raw?.original?.item_id,
    raw?.original?.id,
    raw?.original?.Item?.id,
    raw?.original?.item?.id,

    raw?.dataValues?.item_id,
    raw?.dataValues?.id,
    raw?.dataValues?.Item?.id,
    raw?.dataValues?.item?.id,

    raw?.id,

    /**
     * Keep item.id last because some rows use id as SKU/code.
     */
    item?.id,
  ];

  for (const value of candidates) {
    const id = toStrictInteger(value);
    if (id) return id;
  }

  return null;
}

function getItemCode(item: EditableStockPricingItem | null) {
  return String(
    pick(
      item?.sku_code,
      item?.article_code,
      item?.code,
      item?.raw?.sku_code,
      item?.raw?.article_code,
      item?.raw?.code,
      item?.raw?.original?.sku_code,
      item?.raw?.original?.article_code
    ) || "--"
  );
}

function getItemName(item: EditableStockPricingItem | null) {
  return String(
    pick(
      item?.item_name,
      item?.name,
      item?.article,
      item?.item,
      item?.raw?.item_name,
      item?.raw?.name,
      item?.raw?.Item?.item_name,
      item?.raw?.item?.item_name,
      item?.raw?.original?.item_name
    ) || "Item"
  );
}

function cleanAmount(value: unknown) {
  const raw = String(value ?? "")
    .replace(/[₹,\s]/g, "")
    .trim();

  if (!raw || raw.toLowerCase() === "mixed") return "";

  const number = Number(raw);

  if (!Number.isFinite(number) || number < 0) return "";

  return String(number);
}

function parseAmount(value: string) {
  const number = Number(String(value || "").replace(/[₹,\s]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

export default function EditStockPricingModal({
  open,
  item,
  onClose,
  onUpdated,
}: Props) {
  const [sellingPrice, setSellingPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [makingCharge, setMakingCharge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const numericItemId = useMemo(() => getNumericItemId(item), [item]);
  const itemCode = useMemo(() => getItemCode(item), [item]);
  const itemName = useMemo(() => getItemName(item), [item]);

  useEffect(() => {
    if (!open || !item) return;

    setError("");

    setSellingPrice(
      cleanAmount(
        pick(
          item.selling_price,
          item.sellingPrice,
          item.sale_rate,
          item.raw?.selling_price,
          item.raw?.sellingPrice,
          item.raw?.sale_rate,
          item.raw?.Item?.selling_price,
          item.raw?.item?.selling_price,
          item.raw?.original?.selling_price,
          item.raw?.original?.sale_rate
        )
      )
    );

    setPurchasePrice(
      cleanAmount(
        pick(
          item.purchase_price,
          item.purchasePrice,
          item.purchase_rate,
          item.raw?.purchase_price,
          item.raw?.purchasePrice,
          item.raw?.purchase_rate,
          item.raw?.Item?.purchase_price,
          item.raw?.item?.purchase_price,
          item.raw?.original?.purchase_price,
          item.raw?.original?.purchase_rate
        )
      )
    );

    setMakingCharge(
      cleanAmount(
        pick(
          item.making_charge,
          item.makingCharge,
          item.raw?.making_charge,
          item.raw?.makingCharge,
          item.raw?.Item?.making_charge,
          item.raw?.item?.making_charge,
          item.raw?.original?.making_charge
        )
      )
    );
  }, [open, item]);

  if (!open || !item) return null;

  function handleAmountChange(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    const clean = value.replace(/[^\d.]/g, "");

    if ((clean.match(/\./g) || []).length > 1) return;

    setter(clean);
    setError("");
  }

  async function handleSubmit() {
    try {
      setError("");

      if (!numericItemId) {
        throw new Error(
          `This row has no numeric database item id. Current code is ${itemCode}. Backend needs integer item_id. Pass backend item id as item_id/raw.id from table mapping.`
        );
      }

      const selling = parseAmount(sellingPrice);
      const purchase = parseAmount(purchasePrice);
      const making = parseAmount(makingCharge);

      if (!sellingPrice || selling <= 0) {
        throw new Error("Selling price is required.");
      }

      setSubmitting(true);

      const payload = {
        item_id: numericItemId,
        selling_price: selling,
        ...(purchasePrice && purchase > 0 ? { purchase_price: purchase } : {}),
        ...(makingCharge && making >= 0 ? { making_charge: making } : {}),
      };

      const response = await updateStockPricing(payload);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to update stock pricing.");
      }

      await onUpdated?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update stock pricing."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-black/35 px-4 py-8 font-erp backdrop-blur-[1px] sm:items-center">
      <div className="w-full max-w-[610px] rounded-[28px] border border-erp-border bg-erp-card shadow-[0px_18px_60px_rgba(15,23,42,0.24)]">
        <div className="flex items-center justify-between px-[28px] pb-[18px] pt-[26px] max-sm:px-[20px] max-sm:pt-[20px]">
          <div className="min-w-0">
            <h2 className="text-[22px] font-semibold leading-[28px] tracking-[-0.04em] text-erp-heading">
              Edit Stock Pricing
            </h2>

            <p className="mt-1 truncate text-[14px] font-medium text-erp-muted">
              {itemName} · {itemCode}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-erp-full text-erp-text-soft transition hover:bg-erp-card-soft hover:text-erp-heading disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-[28px] pb-[28px] max-sm:px-[20px]">
          <div className="rounded-[22px] bg-erp-card-soft px-[18px] pb-[20px] pt-[18px]">
            <h3 className="text-[20px] font-semibold leading-[26px] tracking-[-0.035em] text-erp-heading">
              Pricing Details
            </h3>

            {error ? (
              <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-[18px] grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-medium tracking-[-0.02em] text-erp-heading">
                  Selling Price
                </label>

                <input
                  value={sellingPrice}
                  disabled={submitting}
                  inputMode="decimal"
                  placeholder="85000"
                  onChange={(event) =>
                    handleAmountChange(event.target.value, setSellingPrice)
                  }
                  className="h-[42px] w-full rounded-[12px] border border-transparent bg-white px-4 text-[15px] font-medium text-erp-heading outline-none transition placeholder:text-erp-placeholder focus:border-erp-primary/25 focus:ring-2 focus:ring-erp-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium tracking-[-0.02em] text-erp-heading">
                  Purchase Price
                </label>

                <input
                  value={purchasePrice}
                  disabled={submitting}
                  inputMode="decimal"
                  placeholder="78000"
                  onChange={(event) =>
                    handleAmountChange(event.target.value, setPurchasePrice)
                  }
                  className="h-[42px] w-full rounded-[12px] border border-transparent bg-white px-4 text-[15px] font-medium text-erp-heading outline-none transition placeholder:text-erp-placeholder focus:border-erp-primary/25 focus:ring-2 focus:ring-erp-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-[14px] font-medium tracking-[-0.02em] text-erp-heading">
                  Making Charge
                </label>

                <input
                  value={makingCharge}
                  disabled={submitting}
                  inputMode="decimal"
                  placeholder="2500"
                  onChange={(event) =>
                    handleAmountChange(event.target.value, setMakingCharge)
                  }
                  className="h-[42px] w-full rounded-[12px] border border-transparent bg-white px-4 text-[15px] font-medium text-erp-heading outline-none transition placeholder:text-erp-placeholder focus:border-erp-primary/25 focus:ring-2 focus:ring-erp-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          <div className="mt-[18px] grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-[42px] rounded-[12px] border border-erp-border bg-white text-[15px] font-medium tracking-[-0.02em] text-erp-heading transition hover:bg-erp-card-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] bg-erp-dark text-[15px] font-medium tracking-[-0.02em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Pricing"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}