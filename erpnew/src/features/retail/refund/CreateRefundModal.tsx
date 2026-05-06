"use client";

import { Box, Loader2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { createExchange } from "./api/exchange-api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

type FormState = {
  invoice_number: string;

  old_item_id: string;
  old_product_code: string;
  old_product_name: string;
  old_metal: string;
  old_purity: string;
  old_gross_weight: string;
  old_net_weight: string;
  old_stone_weight: string;
  old_condition: string;
  old_value: string;

  new_item_id: string;
  new_product_code: string;
  new_product_name: string;
  new_metal: string;
  new_purity: string;
  new_gross_weight: string;
  new_net_weight: string;
  new_stone_weight: string;
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
  old_gross_weight: "",
  old_net_weight: "",
  old_stone_weight: "",
  old_condition: "OLD",
  old_value: "",

  new_item_id: "",
  new_product_code: "",
  new_product_name: "",
  new_metal: "",
  new_purity: "",
  new_gross_weight: "",
  new_net_weight: "",
  new_stone_weight: "",
  new_condition: "NEW",
  new_value: "",

  making_charge: "",
  stone_amount: "",
};

export default function CreateRefundModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function updateField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await createExchange({
        invoice_number: form.invoice_number,
        original_product: {
          item_id: Number(form.old_item_id || 0),
          product_code: form.old_product_code,
          product_name: form.old_product_name,
          metal: form.old_metal,
          purity: form.old_purity,
          gross_weight: Number(form.old_gross_weight || 0),
          net_weight: Number(form.old_net_weight || 0),
          stone_weight: Number(form.old_stone_weight || 0),
          condition: form.old_condition,
          value: Number(form.old_value || 0),
        },
        new_product: {
          item_id: Number(form.new_item_id || 0),
          product_code: form.new_product_code,
          product_name: form.new_product_name,
          metal: form.new_metal,
          purity: form.new_purity,
          gross_weight: Number(form.new_gross_weight || 0),
          net_weight: Number(form.new_net_weight || 0),
          stone_weight: Number(form.new_stone_weight || 0),
          condition: form.new_condition,
          value: Number(form.new_value || 0),
        },
        making_charge: Number(form.making_charge || 0),
        stone_amount: Number(form.stone_amount || 0),
      });

      setForm(initialForm);
      await onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create exchange"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[1.5px]">
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0px_24px_80px_rgba(15,23,42,0.30)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[22px] top-[18px] z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#111827] transition hover:bg-[#F3F4F6]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="shrink-0 px-[26px] pt-[24px] sm:px-[30px]">
          <h2 className="text-[22px] font-semibold leading-[28px] tracking-[-0.035em] text-[#020617]">
            Enter Exchange Details
          </h2>
        </div>

        <div className="dashboard-hidden-scroll flex-1 overflow-y-auto px-[26px] pb-[20px] pt-[22px] sm:px-[30px]">
          <ProductSection
            variant="old"
            title="Original Product"
            borderClass="border-[#FF2020]"
            bgClass="bg-[#FFF5F5]"
          >
            <div className="grid grid-cols-12 gap-x-[18px] gap-y-[18px]">
              <Field
                className="col-span-12 md:col-span-4"
                label="Invoice Number"
                value={form.invoice_number}
                onChange={(v) => updateField("invoice_number", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Product Code"
                value={form.old_product_code}
                onChange={(v) => updateField("old_product_code", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Product Name"
                value={form.old_product_name}
                onChange={(v) => updateField("old_product_name", v)}
              />

              <Field
                className="col-span-6 md:col-span-3"
                label="Metal"
                value={form.old_metal}
                onChange={(v) => updateField("old_metal", v)}
              />
              <Field
                className="col-span-6 md:col-span-3"
                label="Purity"
                value={form.old_purity}
                onChange={(v) => updateField("old_purity", v)}
              />
              <Field
                className="col-span-6 md:col-span-2"
                label="Stone Wt."
                value={form.old_stone_weight}
                onChange={(v) => updateField("old_stone_weight", v)}
              />
              <Field
                className="col-span-6 md:col-span-2"
                label="Net Wt."
                value={form.old_net_weight}
                onChange={(v) => updateField("old_net_weight", v)}
              />
              <Field
                className="col-span-12 md:col-span-2"
                label="Gross Wt."
                value={form.old_gross_weight}
                onChange={(v) => updateField("old_gross_weight", v)}
              />

              <Field
                className="col-span-12 md:col-span-8"
                label="Condition"
                value={form.old_condition}
                onChange={(v) => updateField("old_condition", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Value"
                value={form.old_value}
                onChange={(v) => updateField("old_value", v)}
              />
            </div>
          </ProductSection>

          <ProductSection
            variant="new"
            title="New Product"
            borderClass="border-[#16B833]"
            bgClass="bg-[#F0FFF5]"
          >
            <div className="grid grid-cols-12 gap-x-[18px] gap-y-[18px]">
              <Field
                className="col-span-4 md:col-span-2"
                label="Item ID"
                value={form.new_item_id}
                onChange={(v) => updateField("new_item_id", v)}
              />
              <Field
                className="col-span-8 md:col-span-4"
                label="Product Code"
                value={form.new_product_code}
                onChange={(v) => updateField("new_product_code", v)}
              />
              <Field
                className="col-span-12 md:col-span-6"
                label="Product Name"
                value={form.new_product_name}
                onChange={(v) => updateField("new_product_name", v)}
              />

              <Field
                className="col-span-12 md:col-span-4"
                label="Metal"
                value={form.new_metal}
                onChange={(v) => updateField("new_metal", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Purity"
                value={form.new_purity}
                onChange={(v) => updateField("new_purity", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Stone Wt."
                value={form.new_stone_weight}
                onChange={(v) => updateField("new_stone_weight", v)}
              />

              <Field
                className="col-span-12 md:col-span-4"
                label="Net Wt."
                value={form.new_net_weight}
                onChange={(v) => updateField("new_net_weight", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Gross Wt."
                value={form.new_gross_weight}
                onChange={(v) => updateField("new_gross_weight", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Value"
                value={form.new_value}
                onChange={(v) => updateField("new_value", v)}
              />

              <Field
                className="col-span-12 md:col-span-6"
                label="Condition"
                value={form.new_condition}
                onChange={(v) => updateField("new_condition", v)}
              />
              <Field
                className="col-span-8 md:col-span-4"
                label="Making Charge"
                value={form.making_charge}
                onChange={(v) => updateField("making_charge", v)}
              />
              <Field
                className="col-span-4 md:col-span-2"
                label="Stone Amount"
                value={form.stone_amount}
                onChange={(v) => updateField("stone_amount", v)}
              />
            </div>
          </ProductSection>

          {error ? (
            <div className="mt-[16px] rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
              {error}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-[#F1F5F9] bg-white px-[26px] py-[18px] sm:px-[30px]">
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-[250px_1fr]">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] rounded-[10px] border border-[#E5E7EB] bg-white text-[15px] font-medium text-[#020617] shadow-[0px_1px_2px_rgba(15,23,42,0.04)] transition hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#02031A] text-[15px] font-medium text-white shadow-[0px_10px_24px_rgba(2,3,26,0.18)] transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Invoice
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ProductSection({
  title,
  variant,
  borderClass,
  bgClass,
  children,
}: {
  title: string;
  variant: "old" | "new";
  borderClass: string;
  bgClass: string;
  children: React.ReactNode;
}) {
  const isOld = variant === "old";

  return (
    <section
      className={`rounded-[20px] border px-[16px] py-[18px] sm:px-[18px] ${
        isOld ? "mb-[22px]" : ""
      } ${borderClass} ${bgClass}`}
    >
      <div
        className={`mb-[18px] flex items-center gap-[10px] text-[20px] font-semibold leading-[26px] tracking-[-0.035em] ${
          isOld ? "text-[#8C1014]" : "text-[#08751F]"
        }`}
      >
        <Box
          className={`h-5 w-5 ${
            isOld ? "text-[#FF1F1F]" : "text-[#16B833]"
          }`}
        />
        {title}
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-[8px] block text-[15px] font-normal leading-[20px] whitespace-nowrap text-[#020617]">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[39px] w-full rounded-[10px] border border-transparent bg-white px-3 text-[14px] font-medium text-[#111827] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
      />
    </label>
  );
}