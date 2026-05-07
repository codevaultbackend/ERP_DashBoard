"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

export type InvoiceCustomerForm = {
  name: string;
  phone: string;
  pan_card_number: string;
  pincode: string;
  address: string;
};

type Props = {
  open: boolean;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (form: InvoiceCustomerForm) => void;
};

const initialForm: InvoiceCustomerForm = {
  name: "",
  phone: "",
  pan_card_number: "",
  pincode: "",
  address: "",
};

export default function CreateInvoiceModal({
  open,
  loading,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<InvoiceCustomerForm>(initialForm);

  useEffect(() => {
    if (!open) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, loading, onClose]);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
    }
  }, [open]);

  if (!open) return null;

  function updateField(key: keyof InvoiceCustomerForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-[1px]">
      <form
        onSubmit={submitForm}
        className="relative w-full max-w-[548px] rounded-[28px] border border-[#E5E7EB] bg-white px-[26px] pb-[28px] pt-[24px] shadow-[0px_24px_70px_rgba(15,23,42,0.25)]"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-[22px] top-[20px] flex h-8 w-8 items-center justify-center rounded-full text-[#111827] transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <h2 className="pr-10 text-[20px] font-semibold leading-[26px] tracking-[-0.02em] text-[#111827]">
          Customer Details
        </h2>

        {error ? (
          <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-[24px] grid grid-cols-1 gap-x-[24px] gap-y-[20px] sm:grid-cols-2">
          <Field
            label="Name"
            value={form.name}
            onChange={(value) => updateField("name", value)}
            disabled={loading}
          />

          <Field
            label="Phone"
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
            disabled={loading}
            inputMode="tel"
          />

          <Field
            label="PanCard Number"
            value={form.pan_card_number}
            onChange={(value) =>
              updateField("pan_card_number", value.toUpperCase())
            }
            disabled={loading}
          />

          <Field
            label="Pincode"
            value={form.pincode}
            onChange={(value) => updateField("pincode", value)}
            disabled={loading}
            inputMode="numeric"
          />

          <div className="sm:col-span-2">
            <label className="mb-[8px] block text-[15px] font-medium leading-[20px] text-[#111827]">
              Address
            </label>

            <textarea
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              disabled={loading}
              className="h-[96px] w-full resize-none rounded-[10px] border border-transparent bg-[#F1F1F2] px-[14px] py-[12px] text-[15px] font-medium text-[#111827] outline-none transition placeholder:text-[#8A8F98] focus:border-[#D8DEE8] focus:bg-white focus:ring-2 focus:ring-[#EEF2FF] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        <div className="mt-[22px] grid grid-cols-2 gap-[14px]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-[42px] rounded-[8px] border border-[#E5E7EB] bg-white text-[15px] font-medium text-[#111827] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex h-[42px] items-center justify-center gap-2 rounded-[8px] bg-[#050313] text-[15px] font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="mb-[8px] block text-[15px] font-medium leading-[20px] text-[#111827]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        inputMode={inputMode}
        className="h-[40px] w-full rounded-[10px] border border-transparent bg-[#F1F1F2] px-[14px] text-[15px] font-medium text-[#111827] outline-none transition placeholder:text-[#8A8F98] focus:border-[#D8DEE8] focus:bg-white focus:ring-2 focus:ring-[#EEF2FF] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}