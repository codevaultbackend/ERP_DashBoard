"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type AddStockFormPayload = {
  item_name: string;
  metal_type: "Gold" | "Silver";
  category: string;
  purity: string;
  qty: number;
  net_weight: number;
};

type AddStockPopupProps = {
  open: boolean;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: AddStockFormPayload) => Promise<void> | void;
};

const initialForm = {
  item_name: "",
  metal_type: "Gold" as "Gold" | "Silver",
  category: "",
  purity: "",
  qty: "",
  net_weight: "",
};

const purityOptions = ["24KT", "22KT", "18KT", "14KT", "925"];
const metalOptions: Array<"Gold" | "Silver"> = ["Gold", "Silver"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-[10px] block text-[15px] font-normal leading-[18px] tracking-[-0.02em] text-[#151515]">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      type={type}
      min={type === "number" ? "0" : undefined}
      step={type === "number" ? "any" : undefined}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={[
        "h-[39px] w-full rounded-[10px] border border-transparent bg-[#F7F7F8]",
        "px-[14px] text-[14px] font-medium leading-[18px] text-[#111827]",
        "outline-none transition placeholder:text-[#A3A8B1]",
        "focus:border-[#D9DDE5] focus:bg-white focus:ring-4 focus:ring-black/[0.03]",
        "disabled:cursor-not-allowed disabled:opacity-60",
      ].join(" ")}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={[
        "h-[39px] w-full appearance-none rounded-[10px] border border-transparent bg-[#F7F7F8]",
        "px-[14px] text-[14px] font-medium leading-[18px] text-[#111827]",
        "outline-none transition",
        "focus:border-[#D9DDE5] focus:bg-white focus:ring-4 focus:ring-black/[0.03]",
        "disabled:cursor-not-allowed disabled:opacity-60",
      ].join(" ")}
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default function AddStockPopup({
  open,
  loading = false,
  error,
  onClose,
  onSubmit,
}: AddStockPopupProps) {
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm(initialForm);
    setTouched(false);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, loading, onClose]);

  const validationError = useMemo(() => {
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
  }, [form]);

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setTouched(true);

    if (validationError || loading) return;

    await onSubmit({
      item_name: form.item_name.trim(),
      metal_type: form.metal_type,
      category: form.category.trim(),
      purity: form.purity.trim(),
      qty: Number(form.qty),
      net_weight: Number(form.net_weight),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/25 px-4 py-6 backdrop-blur-[1px]">
      <div
        className={[
          "relative w-full max-w-[556px] overflow-hidden rounded-[24px] bg-white",
          "px-[28px] pb-[28px] pt-[25px]",
          "shadow-[0px_26px_80px_rgba(15,23,42,0.24)]",
          "sm:rounded-[26px] sm:px-[30px]",
        ].join(" ")}
      >
        <div className="mb-[18px] flex items-start justify-between gap-4">
          <h2 className="text-[20px] font-semibold leading-[24px] tracking-[-0.03em] text-[#111111]">
            Add New Item
          </h2>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#111111] transition hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close add stock popup"
          >
            <X className="h-[18px] w-[18px] stroke-[2.1]" />
          </button>
        </div>

        <div className="rounded-[20px] bg-[#FBFBFC] px-[18px] pb-[22px] pt-[18px] sm:px-[17px]">
          <h3 className="mb-[18px] text-[18px] font-semibold leading-[22px] tracking-[-0.03em] text-[#111111]">
            Item Details
          </h3>

          <div className="grid grid-cols-1 gap-x-[18px] gap-y-[18px] sm:grid-cols-2">
            <div>
              <FieldLabel>Item Name</FieldLabel>
              <Input
                value={form.item_name}
                disabled={loading}
                placeholder="Gold Ring"
                onChange={(value) => updateField("item_name", value)}
              />
            </div>

            <div>
              <FieldLabel>Metal Type</FieldLabel>
              <Select
                value={form.metal_type}
                disabled={loading}
                options={metalOptions}
                onChange={(value) =>
                  updateField("metal_type", value as "Gold" | "Silver")
                }
              />
            </div>

            <div>
              <FieldLabel>Category</FieldLabel>
              <Input
                value={form.category}
                disabled={loading}
                placeholder="Ring"
                onChange={(value) => updateField("category", value)}
              />
            </div>

            <div>
              <FieldLabel>Purity</FieldLabel>
              <Select
                value={form.purity}
                disabled={loading}
                options={purityOptions}
                onChange={(value) => updateField("purity", value)}
              />
            </div>

            <div>
              <FieldLabel>Quantity</FieldLabel>
              <Input
                type="number"
                value={form.qty}
                disabled={loading}
                placeholder="2"
                onChange={(value) => updateField("qty", value)}
              />
            </div>

            <div>
              <FieldLabel>Net Wt.</FieldLabel>
              <Input
                type="number"
                value={form.net_weight}
                disabled={loading}
                placeholder="15"
                onChange={(value) => updateField("net_weight", value)}
              />
            </div>
          </div>

          {(touched && validationError) || error ? (
            <p className="mt-[14px] rounded-[12px] border border-red-100 bg-red-50 px-3 py-2 text-[13px] font-medium leading-[18px] text-red-600">
              {error || validationError}
            </p>
          ) : null}
        </div>

        <div className="mt-[18px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className={[
              "flex h-[41px] items-center justify-center rounded-[9px] border border-[#E5E7EB] bg-white",
              "text-[16px] font-medium leading-[20px] tracking-[-0.02em] text-[#111111]",
              "transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60",
            ].join(" ")}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className={[
              "flex h-[41px] items-center justify-center rounded-[9px] bg-[#070313]",
              "text-[16px] font-semibold leading-[20px] tracking-[-0.02em] text-white",
              "transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70",
            ].join(" ")}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Add Stock"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}