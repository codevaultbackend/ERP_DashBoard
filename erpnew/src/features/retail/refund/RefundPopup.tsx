"use client";

import { Box, Loader2, Package, X } from "lucide-react";
import { useState } from "react";
import { createExchange } from "./exchange-api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
};

type FormState = {
  invoice_number: string;

  old_item_id: string;
  old_product_code: string;
  old_product_name: string;
  old_metal: string;
  old_purity: string;
  old_stone_weight: string;
  old_net_weight: string;
  old_gross_weight: string;
  old_condition: string;
  old_value: string;

  new_item_id: string;
  new_product_code: string;
  new_product_name: string;
  new_metal: string;
  new_purity: string;
  new_stone_weight: string;
  new_net_weight: string;
  new_gross_weight: string;
  new_condition: string;
  new_value: string;

  making_charge: string;
  stone_amount: string;
};

const initialForm: FormState = {
  invoice_number: "",

  old_item_id: "",
  old_product_code: "",
  old_product_name: "",
  old_metal: "",
  old_purity: "",
  old_stone_weight: "",
  old_net_weight: "",
  old_gross_weight: "",
  old_condition: "OLD",
  old_value: "",

  new_item_id: "",
  new_product_code: "",
  new_product_name: "",
  new_metal: "",
  new_purity: "",
  new_stone_weight: "",
  new_net_weight: "",
  new_gross_weight: "",
  new_condition: "NEW",
  new_value: "",

  making_charge: "",
  stone_amount: "",
};

function toNumber(value: string) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export default function RefundPopup({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleClose = () => {
    if (submitting) return;
    setForm(initialForm);
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (
      !form.invoice_number ||
      !form.old_item_id ||
      !form.old_product_code ||
      !form.old_product_name ||
      !form.new_item_id ||
      !form.new_product_code ||
      !form.new_product_name
    ) {
      setError("Please fill invoice number and required product details.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createExchange({
        invoice_number: form.invoice_number.trim(),

        original_product: {
          item_id: toNumber(form.old_item_id),
          product_code: form.old_product_code.trim(),
          product_name: form.old_product_name.trim(),
          metal: form.old_metal.trim(),
          purity: form.old_purity.trim(),
          gross_weight: toNumber(form.old_gross_weight),
          net_weight: toNumber(form.old_net_weight),
          stone_weight: toNumber(form.old_stone_weight),
          condition: form.old_condition.trim() || "OLD",
          value: toNumber(form.old_value),
        },

        new_product: {
          item_id: toNumber(form.new_item_id),
          product_code: form.new_product_code.trim(),
          product_name: form.new_product_name.trim(),
          metal: form.new_metal.trim(),
          purity: form.new_purity.trim(),
          gross_weight: toNumber(form.new_gross_weight),
          net_weight: toNumber(form.new_net_weight),
          stone_weight: toNumber(form.new_stone_weight),
          condition: form.new_condition.trim() || "NEW",
          value: toNumber(form.new_value),
        },

        making_charge: toNumber(form.making_charge),
        stone_amount: toNumber(form.stone_amount),
      });

      await onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create exchange."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black/35 px-4 py-10 font-erp backdrop-blur-[1px]">
      <div className="relative w-full max-w-[740px] rounded-erp-2xl bg-white px-7 pb-7 pt-7 shadow-[0px_18px_42px_rgba(15,23,42,0.25)]">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-erp-full text-erp-text transition hover:bg-erp-card-soft"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-10 text-[22px] font-semibold leading-[28px] tracking-[-0.04em] text-erp-heading">
          Enter Exchange Details
        </h2>

        {error ? (
          <div className="mt-4 rounded-erp-sm border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          <section className="rounded-erp-md border border-[#FF2D2D] bg-[#FFF1F1] px-4 py-4">
            <SectionTitle
              icon={<Package className="h-5 w-5" />}
              title="Original Product"
              color="text-[#991B1B]"
            />

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1.35fr_1fr_1fr]">
              <Field
                label="Invoice Number"
                value={form.invoice_number}
                onChange={(value) => update("invoice_number", value)}
              />
              <Field
                label="Product Code"
                value={form.old_product_code}
                onChange={(value) => update("old_product_code", value)}
              />
              <Field
                label="Product Name"
                value={form.old_product_name}
                onChange={(value) => update("old_product_name", value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
              <Field
                label="Item ID"
                value={form.old_item_id}
                onChange={(value) => update("old_item_id", value)}
              />
              <Field
                label="Metal"
                value={form.old_metal}
                onChange={(value) => update("old_metal", value)}
              />
              <Field
                label="Purity"
                value={form.old_purity}
                onChange={(value) => update("old_purity", value)}
              />
              <Field
                label="Stone Wt."
                value={form.old_stone_weight}
                onChange={(value) => update("old_stone_weight", value)}
              />
              <Field
                label="Net Wt."
                value={form.old_net_weight}
                onChange={(value) => update("old_net_weight", value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_2fr_1fr]">
              <Field
                label="Gross Wt."
                value={form.old_gross_weight}
                onChange={(value) => update("old_gross_weight", value)}
              />
              <Field
                label="Condition"
                value={form.old_condition}
                onChange={(value) => update("old_condition", value)}
              />
              <Field
                label="Value"
                value={form.old_value}
                onChange={(value) => update("old_value", value)}
              />
            </div>
          </section>

          <section className="rounded-erp-md border border-[#16B833] bg-[#ECFFF4] px-4 py-4">
            <SectionTitle
              icon={<Box className="h-5 w-5" />}
              title="New Product"
              color="text-[#047857]"
            />

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.35fr_1fr]">
              <Field
                label="Product Code"
                value={form.new_product_code}
                onChange={(value) => update("new_product_code", value)}
              />
              <Field
                label="Product Name"
                value={form.new_product_name}
                onChange={(value) => update("new_product_name", value)}
              />
              <Field
                label="Metal"
                value={form.new_metal}
                onChange={(value) => update("new_metal", value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
              <Field
                label="Item ID"
                value={form.new_item_id}
                onChange={(value) => update("new_item_id", value)}
              />
              <Field
                label="Purity"
                value={form.new_purity}
                onChange={(value) => update("new_purity", value)}
              />
              <Field
                label="Stone Wt."
                value={form.new_stone_weight}
                onChange={(value) => update("new_stone_weight", value)}
              />
              <Field
                label="Net Wt."
                value={form.new_net_weight}
                onChange={(value) => update("new_net_weight", value)}
              />
              <Field
                label="Gross Wt."
                value={form.new_gross_weight}
                onChange={(value) => update("new_gross_weight", value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
              <Field
                label="Condition"
                value={form.new_condition}
                onChange={(value) => update("new_condition", value)}
              />
              <Field
                label="Value"
                value={form.new_value}
                onChange={(value) => update("new_value", value)}
              />
              <Field
                label="Stone Amount"
                value={form.stone_amount}
                onChange={(value) => update("stone_amount", value)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Making Charge"
                value={form.making_charge}
                onChange={(value) => update("making_charge", value)}
              />
            </div>
          </section>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.6fr]">
          <button
            type="button"
            onClick={handleClose}
            className="h-[44px] rounded-erp-sm border border-erp-border bg-white text-[15px] font-medium text-black transition hover:bg-erp-card-soft"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex h-[44px] items-center justify-center gap-2 rounded-erp-sm bg-erp-dark text-[15px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${color}`}>
      {icon}
      <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.03em]">
        {title}
      </h3>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-black">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[40px] w-full rounded-[10px] border border-transparent bg-white px-3 text-[14px] font-medium text-erp-text outline-none transition focus:border-erp-primary focus:ring-2 focus:ring-erp-primary/10"
      />
    </label>
  );
}