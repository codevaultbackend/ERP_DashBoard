"use client";

import { Box, Loader2, Package, X } from "lucide-react";
import { useState } from "react";
import { createExchange } from "./api/exchange-api";

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

export default function CreateRefundModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeModal = () => {
    if (submitting) return;
    setForm(initialForm);
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (
      !form.invoice_number.trim() ||
      !form.old_item_id.trim() ||
      !form.old_product_code.trim() ||
      !form.old_product_name.trim() ||
      !form.new_item_id.trim() ||
      !form.new_product_code.trim() ||
      !form.new_product_name.trim()
    ) {
      setError("Please fill required invoice and product details.");
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
      closeModal();
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
      <div className="relative w-full max-w-[740px] rounded-[32px] bg-white px-[28px] pb-[28px] pt-[26px] shadow-[0px_18px_42px_rgba(15,23,42,0.25)]">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#111827] transition hover:bg-[#F3F4F6]"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-10 text-[22px] font-semibold leading-[28px] tracking-[-0.04em] text-black">
          Enter Exchange Details
        </h2>

        {error ? (
          <div className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-[24px] space-y-[18px]">
          <section className="rounded-[20px] border border-[#FF2D2D] bg-[#FFF1F1] px-[18px] py-[18px]">
            <SectionTitle
              icon={<Package className="h-5 w-5" />}
              title="Original Product"
              color="text-[#991B1B]"
            />

            <div className="mt-[18px] grid grid-cols-1 gap-x-[18px] gap-y-[16px] md:grid-cols-[1.45fr_1.05fr_0.9fr]">
              <Field label="Invoice Number" value={form.invoice_number} onChange={(v) => update("invoice_number", v)} />
              <Field label="Product Code" value={form.old_product_code} onChange={(v) => update("old_product_code", v)} />
              <Field label="Product Name" value={form.old_product_name} onChange={(v) => update("old_product_name", v)} />
            </div>

            <div className="mt-[18px] grid grid-cols-2 gap-x-[18px] gap-y-[16px] md:grid-cols-5">
              <Field label="Metal" value={form.old_metal} onChange={(v) => update("old_metal", v)} />
              <Field label="Purity" value={form.old_purity} onChange={(v) => update("old_purity", v)} />
              <Field label="Stone Wt." value={form.old_stone_weight} onChange={(v) => update("old_stone_weight", v)} />
              <Field label="Net Wt." value={form.old_net_weight} onChange={(v) => update("old_net_weight", v)} />
              <Field label="Gross Wt." value={form.old_gross_weight} onChange={(v) => update("old_gross_weight", v)} />
            </div>

            <div className="mt-[18px] grid grid-cols-1 gap-x-[18px] gap-y-[16px] md:grid-cols-[2.4fr_1fr]">
              <Field label="Condition" value={form.old_condition} onChange={(v) => update("old_condition", v)} />
              <Field label="Value" value={form.old_value} onChange={(v) => update("old_value", v)} />
            </div>

            <input
              value={form.old_item_id}
              onChange={(e) => update("old_item_id", e.target.value)}
              placeholder="Original Item ID"
              className="mt-[18px] h-[40px] w-full rounded-[10px] border border-transparent bg-white px-3 text-[14px] font-medium text-erp-text outline-none transition placeholder:text-erp-placeholder focus:border-erp-primary focus:ring-2 focus:ring-erp-primary/10"
            />
          </section>

          <section className="rounded-[20px] border border-[#16B833] bg-[#ECFFF4] px-[18px] py-[18px]">
            <SectionTitle
              icon={<Box className="h-5 w-5" />}
              title="New Product"
              color="text-[#047857]"
            />

            <div className="mt-[18px] grid grid-cols-1 gap-x-[18px] gap-y-[16px] md:grid-cols-[1.25fr_1.5fr_0.95fr]">
              <Field label="Product Code" value={form.new_product_code} onChange={(v) => update("new_product_code", v)} />
              <Field label="Product Name" value={form.new_product_name} onChange={(v) => update("new_product_name", v)} />
              <Field label="Metal" value={form.new_metal} onChange={(v) => update("new_metal", v)} />
            </div>

            <div className="mt-[18px] grid grid-cols-2 gap-x-[18px] gap-y-[16px] md:grid-cols-4">
              <Field label="Purity" value={form.new_purity} onChange={(v) => update("new_purity", v)} />
              <Field label="Stone Wt." value={form.new_stone_weight} onChange={(v) => update("new_stone_weight", v)} />
              <Field label="Net Wt." value={form.new_net_weight} onChange={(v) => update("new_net_weight", v)} />
              <Field label="Gross Wt." value={form.new_gross_weight} onChange={(v) => update("new_gross_weight", v)} />
            </div>

            <div className="mt-[18px] grid grid-cols-1 gap-x-[18px] gap-y-[16px] md:grid-cols-[1.6fr_1fr]">
              <Field label="Condition" value={form.new_condition} onChange={(v) => update("new_condition", v)} />
              <Field label="Value" value={form.new_value} onChange={(v) => update("new_value", v)} />
            </div>

            <div className="mt-[18px] grid grid-cols-1 gap-x-[18px] gap-y-[16px] md:grid-cols-3">
              <Field label="New Item ID" value={form.new_item_id} onChange={(v) => update("new_item_id", v)} />
              <Field label="Making Charge" value={form.making_charge} onChange={(v) => update("making_charge", v)} />
              <Field label="Stone Amount" value={form.stone_amount} onChange={(v) => update("stone_amount", v)} />
            </div>
          </section>
        </div>

        <div className="mt-[26px] grid grid-cols-1 gap-[14px] sm:grid-cols-[250px_1fr]">
          <button
            type="button"
            onClick={closeModal}
            className="h-[44px] rounded-[10px] border border-[#E5E7EB] bg-white text-[15px] font-medium text-black transition hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#030314] text-[15px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
      <span className="mb-[8px] block text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-black">
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