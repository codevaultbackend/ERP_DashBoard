"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type DistrictAddStockFormPayload = {
  item_name: string;
  item_code: string;

  metal_type: "Gold" | "Silver";

  category: string;

  purity: string;

  qty: number;

  net_weight: number;

  stone_weight: number;

  making_charge: number;
  selling_price: number;

  image?: File | null;
};

type Props = {
  open: boolean;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (
    payload: DistrictAddStockFormPayload[]
  ) => Promise<void> | void;
};

const INITIAL_FORM = {
  item_name: "",
  item_code: "",

  metal_type: "Gold" as const,

  category: "",

  purity: "",

  qty: "",

  net_weight: "",

  stone_weight: "",

  making_charge: "",
  selling_price: "",

  image: null as File | null,
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function inputClass(hasValue: boolean) {
  return cn(
    "h-[40px] w-full rounded-[10px] border-0 bg-[#F4F4F6] px-[14px]",
    "text-[15px] font-medium leading-[20px] text-erp-text outline-none",
    "placeholder:text-[#7C8293] transition focus:ring-2 focus:ring-erp-primary/15",
    hasValue && "bg-white ring-1 ring-erp-primary/20"
  );
}

function normalizeDecimalInput(value: string) {
  const clean = value.replace(/[^\d.]/g, "");
  const parts = clean.split(".");

  if (parts.length <= 2) return clean;

  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export default function DistrictAddStockPopup({
  open,
  loading = false,
  error = "",
  onClose,
  onSubmit,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [localError, setLocalError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [products, setProducts] = useState<
    DistrictAddStockFormPayload[]
  >([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const buildProduct = (): DistrictAddStockFormPayload => ({
    item_name: form.item_name.trim(),
    item_code: form.item_code.trim(),
    metal_type: form.metal_type,
    category: form.category.trim(),
    purity: form.purity.trim(),
    qty: Number(form.qty),
    net_weight: Number(form.net_weight),
    stone_weight: Number(form.stone_weight || 0),
    making_charge: Number(form.making_charge || 0),
    selling_price: Number(form.selling_price || 0),
    image: form.image,
  });

  const stoneWeight = Number(form.stone_weight);
  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading]);

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setLocalError("");
  };

  const resetForm = () => {
    setImagePreview(null);
    setForm(INITIAL_FORM);
    setLocalError("");
  };

  function handleClose() {
    if (loading) return;
    resetForm();
    onClose();
  }

  const validate = () => {
    if (!form.item_name.trim()) return "Item name is required.";
    if (!form.metal_type) return "Metal type is required.";
    if (!form.category.trim()) return "Category is required.";
    if (!form.purity.trim()) return "Purity is required.";

    const qty = Number(form.qty);
    const netWeight = Number(form.net_weight);

    if (!Number.isFinite(qty) || qty <= 0) {
      return "Quantity must be greater than 0.";
    }

    if (!Number.isFinite(netWeight) || netWeight <= 0) {
      return "Net weight must be greater than 0.";
    }

    return "";
  };
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      updateField("image", null);
      setImagePreview(null);
      return;
    }

    updateField("image", file);
    setImagePreview(URL.createObjectURL(file));
  };
  const handleAddProduct = () => {
    const validationMessage = validate();

    if (validationMessage) {
      setLocalError(validationMessage);
      return;
    }

    setProducts((prev) => [...prev, buildProduct()]);

    setLocalError("");
    resetForm();
  };
  const removeProduct = (index: number) => {
    setProducts((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };
  const handleFinalSubmit = async () => {
    if (!products.length) {
      setLocalError("Add at least one product.");
      return;
    }

    try {
      setLocalError("");

      await onSubmit(products);

      setProducts([]);
      resetForm();
      onClose();
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Failed to submit products."
      );
    }
  };

  if (!open || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/35 px-4 py-6 font-erp backdrop-blur-[1px]"
      onMouseDown={handleClose}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="relative flex max-h-[calc(100svh-48px)] w-full max-w-[556px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0px_24px_70px_rgba(15,23,42,0.24)]"
      >
        <div className="flex shrink-0 items-center justify-between px-[28px] pb-[18px] pt-[24px] max-sm:px-[20px] max-sm:pt-[18px]">
          <h3 className="text-[20px] font-semibold leading-[25px] tracking-[-0.035em] text-[#0A0A0A] max-sm:text-[18px]">
            Add New Item
          </h3>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#222222] transition hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close add stock popup"
          >
            <X className="h-[18px] w-[18px] stroke-[2.1]" />
          </button>
        </div>

        <div className="dashboard-hidden-scroll flex-1 overflow-y-auto px-[28px] pb-[18px] max-sm:px-[20px]">
          {localError || error ? (
            <div className="mb-[14px] rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium leading-[18px] text-red-700">
              {localError || error}
            </div>
          ) : null}

          <div className="rounded-[20px] bg-[#FAFAFB] p-[18px]">
            <h4 className="mb-[16px] text-[18px] font-semibold leading-[24px] tracking-[-0.03em] text-[#111111]">
              Item Details
            </h4>

            <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#111111]">
                  Item Name
                </label>

                <input
                  value={form.item_name}
                  disabled={loading}
                  onChange={(e) => updateField("item_name", e.target.value)}
                  placeholder="Gold Ring"
                  className={inputClass(Boolean(form.item_name))}
                />
              </div>
              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px]">
                  Item Code
                </label>

                <input
                  value={form.item_code}
                  disabled={loading}
                  onChange={(e) =>
                    updateField("item_code", e.target.value)
                  }
                  placeholder="5704-1234"
                  className={inputClass(Boolean(form.item_code))}
                />
              </div>

              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#111111]">
                  Metal Type
                </label>

                <select
                  value={form.metal_type}
                  disabled={loading}
                  onChange={(e) =>
                    updateField(
                      "metal_type",
                      e.target.value as "Gold" | "Silver"
                    )
                  }
                  className={inputClass(Boolean(form.metal_type))}
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                </select>
              </div>

              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#111111]">
                  Category
                </label>

                <input
                  value={form.category}
                  disabled={loading}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="Ring"
                  className={inputClass(Boolean(form.category))}
                />
              </div>

              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#111111]">
                  Purity
                </label>

                <input
                  value={form.purity}
                  disabled={loading}
                  onChange={(e) => updateField("purity", e.target.value)}
                  placeholder="22K"
                  className={inputClass(Boolean(form.purity))}
                />
              </div>
              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px]">
                  Selling Price
                </label>

                <input
                  value={form.selling_price}
                  disabled={loading}
                  type="text"
                  inputMode="decimal"
                  onChange={(e) =>
                    updateField(
                      "selling_price",
                      normalizeDecimalInput(e.target.value)
                    )
                  }
                  placeholder="25000"
                  className={inputClass(Boolean(form.selling_price))}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#111111]">
                  Item Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={handleImageChange}
                  className="block w-full rounded-[10px] border border-dashed border-[#D1D5DB] bg-white px-3 py-3 text-sm"
                />

                {imagePreview && (
                  <div className="mt-3 overflow-hidden rounded-[12px] border border-[#E5E7EB]">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-[180px] w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#111111]">
                  Quantity
                </label>

                <input
                  value={form.qty}
                  disabled={loading}
                  type="text"
                  inputMode="numeric"
                  onChange={(e) =>
                    updateField("qty", e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="2"
                  className={inputClass(Boolean(form.qty))}
                />
              </div>
              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px]">
                  Making Charge
                </label>

                <input
                  value={form.making_charge}
                  disabled={loading}
                  type="text"
                  inputMode="decimal"
                  onChange={(e) =>
                    updateField(
                      "making_charge",
                      normalizeDecimalInput(e.target.value)
                    )
                  }
                  placeholder="500"
                  className={inputClass(Boolean(form.making_charge))}
                />
              </div>


              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#111111]">
                  Net Weight
                </label>

                <input
                  value={form.net_weight}
                  disabled={loading}
                  type="text"
                  inputMode="decimal"
                  onChange={(e) =>
                    updateField("net_weight", normalizeDecimalInput(e.target.value))
                  }
                  placeholder="15"
                  className={inputClass(Boolean(form.net_weight))}
                />
              </div>
              <div>
                <label className="mb-[7px] block text-[15px] font-normal leading-[20px]">
                  Stone Weight
                </label>

                <input
                  value={form.stone_weight}
                  disabled={loading}
                  type="text"
                  inputMode="decimal"
                  onChange={(e) =>
                    updateField(
                      "stone_weight",
                      normalizeDecimalInput(e.target.value)
                    )
                  }
                  placeholder="2"
                  className={inputClass(Boolean(form.stone_weight))}
                />
              </div>

            </div>

            {products.length > 0 && (
              <div className="mt-5 rounded-[20px] border border-[#ECEEF2] bg-white p-[18px]">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-[18px] font-semibold">
                    Added Products
                  </h4>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {products.length} Items
                  </span>
                </div>

                <div className="space-y-3">
                  {products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#FAFAFB] p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[#111111]">
                          {product.item_name}
                        </p>

                        <p className="text-sm text-[#6B7280]">
                          {product.category} • {product.purity}
                        </p>

                        <p className="text-sm text-[#6B7280]">
                          Qty {product.qty} • {product.net_weight}g
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="ml-4 rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        <div className="shrink-0 bg-white px-[28px] pb-[27px] pt-[12px]">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="
      h-[42px]
      rounded-[9px]
      border
      border-[#D1D5DB]
      bg-white
      text-[#374151]
      font-medium
      hover:bg-[#F9FAFB]
      disabled:opacity-50
      disabled:cursor-not-allowed
    "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddProduct}
              disabled={loading}
              className="
      h-[42px]
      rounded-[9px]
      bg-[#0a0a0a]
      text-white
      font-medium
      hover:bg-[#0a0a0a]
      disabled:opacity-50
      disabled:cursor-not-allowed
    "
            >
              Add Product
            </button>
          </div>

          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={loading || products.length === 0}
            className="mt-3 h-[42px] w-full rounded-[9px] bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
          >
            Submit All Products ({products.length})
          </button>
        </div>

      </div>

    </div>
  );

  return createPortal(modal, document.body);
}