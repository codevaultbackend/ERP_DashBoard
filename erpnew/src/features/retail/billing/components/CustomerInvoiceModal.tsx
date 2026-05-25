"use client";

import { Loader2, X } from "lucide-react";

export type CustomerInvoiceData = {
  name: string;
  phone: string;
  pan_card_number: string;
  pincode: string;
  address: string;
};

type Props = {
  open: boolean;
  loading?: boolean;
  form: CustomerInvoiceData;
  onClose: () => void;
  onChange: (
    field: keyof CustomerInvoiceData,
    value: string
  ) => void;
  onSubmit: () => void;
};

export default function CustomerInvoiceModal({
  open,
  loading = false,
  form,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-[32px] border border-[#EAECF0] bg-white shadow-[0px_30px_80px_rgba(15,23,42,0.18)]">
        
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-[#F2F4F7] px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <h2 className="text-[24px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[30px]">
              Customer Details
            </h2>

            <p className="mt-1 text-[13px] font-medium text-[#667085] sm:text-[14px]">
              Fill customer information before invoice generation
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FAFC] text-[#667085] transition-all hover:bg-[#EEF2F7]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-5 py-5 sm:px-7 sm:py-6">
          
          {/* TOP GRID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            <Field
              label="Name"
              placeholder="Enter customer name"
              value={form.name}
              onChange={(value) =>
                onChange("name", value)
              }
            />

            <Field
              label="Phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(value) =>
                onChange("phone", value)
              }
            />

            <Field
              label="PanCard Number"
              placeholder="Enter PAN number"
              value={form.pan_card_number}
              onChange={(value) =>
                onChange(
                  "pan_card_number",
                  value.toUpperCase()
                )
              }
            />

            <Field
              label="Pincode"
              placeholder="Enter pincode"
              value={form.pincode}
              onChange={(value) =>
                onChange("pincode", value)
              }
            />
          </div>

          {/* ADDRESS */}
          <div className="mt-4">
            <label className="mb-2 block text-[13px] font-bold text-[#111827]">
              Address
            </label>

            <textarea
              rows={4}
              value={form.address}
              onChange={(e) =>
                onChange(
                  "address",
                  e.target.value
                )
              }
              placeholder="Enter customer address"
              className="w-full rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-[14px] font-semibold text-[#111827] outline-none transition-all placeholder:text-[#98A2B3] focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#F4EBFF]"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-[#F2F4F7] bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            
            <button
              type="button"
              onClick={onClose}
              className="flex h-[52px] w-full items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white text-[14px] font-bold text-[#111827] transition-all hover:bg-[#F8FAFC] sm:text-[15px]"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onSubmit}
              className="flex h-[52px] w-full items-center justify-center rounded-[18px] bg-[#050816] text-[14px] font-bold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Create Invoice"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[13px] font-bold text-[#111827]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-[52px] w-full rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] px-4 text-[14px] font-semibold text-[#111827] outline-none transition-all placeholder:text-[#98A2B3] focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#F4EBFF]"
      />
    </div>
  );
}