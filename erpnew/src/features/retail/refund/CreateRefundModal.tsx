"use client";

import { Box, Loader2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  createExchange,
  getInvoiceForExchange,
} from "./api/exchange-api";
import { scanBillingItemByCode } from "@/features/retail/refund/api/exchange-api";

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
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invoiceLoaded, setInvoiceLoaded] = useState(false);
  const [loadingNewProduct, setLoadingNewProduct] =
    useState(false);

  if (!open) return null;

  function updateField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  async function handleFetchNewProduct() {
    try {
      if (!form.new_product_code.trim()) {
        setError("Please enter product code");
        return;
      }

      setLoadingNewProduct(true);
      setError("");

      const product =
        await scanBillingItemByCode(
          form.new_product_code.trim()
        );

      setForm((prev) => ({
        ...prev,

        new_item_id: String(
          product.item_id ||
          product.id ||
          ""
        ),

        new_product_code:
          product.product_code ||
          product.article_code ||
          product.sku_code ||
          "",

        new_product_name:
          product.item_name ||
          product.name ||
          "",

        new_metal:
          product.metal_type ||
          product.category ||
          "",

        new_purity:
          product.purity || "",

        new_gross_weight: String(
          product.gross_weight ?? ""
        ),

        new_net_weight: String(
          product.net_weight ?? ""
        ),

        new_stone_weight: String(
          product.stone_weight ?? ""
        ),

        new_value: String(
          product.total_amount ??
          product.metal_value ??
          0
        ),
      }));

    } catch (error: any) {

      setError(
        error?.message ||
        "Failed to fetch product"
      );

    } finally {

      setLoadingNewProduct(false);
    }
  }
  async function handleFetchInvoice() {
    try {
      if (!form.invoice_number.trim()) {
        setError("Please enter invoice number");
        return;
      }

      setLoadingInvoice(true);
      setError("");

      const response = await getInvoiceForExchange(
        form.invoice_number.trim()
      );

      const invoiceData = response.data;

      const oldProduct =
        invoiceData.latest_exchange_product ||
        invoiceData.items?.[0];

      if (!oldProduct) {
        throw new Error("No product found");
      }

      setForm((prev) => ({
        ...prev,

        old_product_code: oldProduct.product_code || "",
        old_product_name: oldProduct.product_name || "",
        old_purity: oldProduct.purity || "",

        old_gross_weight: String(
          oldProduct.gross_weight ?? ""
        ),

        old_net_weight: String(
          oldProduct.net_weight ?? ""
        ),

        old_stone_weight: String(
          oldProduct.stone_weight ?? ""
        ),

        old_value: String(
          oldProduct.value ?? ""
        ),
      }));

      setInvoiceLoaded(true);
    } catch (error: any) {
      setInvoiceLoaded(false);

      setError(
        error?.message ||
        "Failed to fetch invoice"
      );
    } finally {
      setLoadingInvoice(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      if (!invoiceLoaded) {
        setError(
          "Please fetch invoice first"
        );
        return;
      }
      setSubmitting(true);
      setError("");

      await createExchange({
        invoice_number:
          form.invoice_number,

        original_products: [
          {
            product_code:
              form.old_product_code,

            product_name:
              form.old_product_name,

            value:
              Number(
                form.old_value || 0
              ),
          },
        ],

        new_products: [
          {
            product_code:
              form.new_product_code,

            product_name:
              form.new_product_name,

            purity:
              form.new_purity,

            gross_weight:
              Number(
                form.new_gross_weight || 0
              ),

            net_weight:
              Number(
                form.new_net_weight || 0
              ),

            stone_weight:
              Number(
                form.new_stone_weight || 0
              ),

            value:
              Number(
                form.new_value || 0
              ),
          },
        ],

        making_charge:
          Number(
            form.making_charge || 0
          ),

        stone_amount:
          Number(
            form.stone_amount || 0
          ),
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
    <div className="fixed inset-0 z-[9999]  flex items-center justify-center bg-black/40 p-3 sm:p-5 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="
      relative
      flex
      h-[95vh]
      w-full
      max-w-[691px]
      flex-col
      overflow-hidden
      rounded-2xl
      sm:rounded-3xl
      bg-white
      shadow-erp-sm
    "
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[22px] top-[18px] z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#111827] transition hover:bg-[#F3F4F6]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="shrink-0 border-b border-slate-100 px-4 py-4 sm:px-6">
          <h2 className="pr-10 text-lg font-semibold text-[#020617] sm:text-2xl">
            Enter Exchange Details
          </h2>
        </div>

        <div className="dashboard-hidden-scroll flex-1 overflow-y-auto px-[26px] pb-[20px] pt-[22px] max-[768px]:px-[10px]">
          <ProductSection
            variant="old"
            title="Original Product"
            borderClass="border-[#FF2020]"
            bgClass="bg-[#FFF5F5]"
          >
            <div
              className="
    grid
    grid-cols-1
    gap-4
    md:grid-cols-12
  "
            >
              <div className="col-span-12">
                <label className="flex flex-col">
                  <span className="mb-[8px] block text-[15px]">
                    Invoice Number
                  </span>

                  <div className="lg:flex gap-3 ">
                    <input
                      value={form.invoice_number}
                      onChange={(e) =>
                        updateField(
                          "invoice_number",
                          e.target.value
                        )
                      }
                      className="h-[45px] flex-1 rounded-[10px] max-[768px]:w-full border border-gray-300 px-3"
                    />

                    <button
                      type="button"
                      onClick={handleFetchInvoice}
                      disabled={loadingInvoice}
                      className="
h-[39px]
min-w-[100px]
rounded-[10px]
bg-black
px-4
text-white
font-medium
hover:bg-[#111827]
transition
max-[768px]:mt-[12px]
max-[768px]:w-full
"
                    >
                      {loadingInvoice
                        ? "..."
                        : "Fetch"}
                    </button>
                  </div>
                </label>
              </div>
              <Field
                className="col-span-12 md:col-span-4"
                label="Product Code"
                value={form.old_product_code}
                readOnly
                onChange={() => { }}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Product Name"
                readOnly
                value={form.old_product_name}
                onChange={(v) => updateField("old_product_name", v)}
              />

              <Field
                className="col-span-12 md:col-span-4"
                label="Metal"
                readOnly
                value={form.old_metal}
                onChange={(v) => updateField("old_metal", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Purity"
                readOnly
                value={form.old_purity}
                onChange={(v) => updateField("old_purity", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Stone Wt."
                readOnly
                value={form.old_stone_weight}
                onChange={(v) => updateField("old_stone_weight", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Net Wt."
                readOnly
                value={form.old_net_weight}
                onChange={(v) => updateField("old_net_weight", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Gross Wt."
                readOnly
                value={form.old_gross_weight}
                onChange={(v) => updateField("old_gross_weight", v)}
              />

              <Field
                className="col-span-12 md:col-span-4"
                label="Condition"
                readOnly
                value={form.old_condition}
                onChange={(v) => updateField("old_condition", v)}
              />
              <Field
                className="col-span-12 md:col-span-4"
                label="Value"
                readOnly
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
            <>
              {/* Product Code + Fetch */}
              <div className="mb-5">
                <label className="flex flex-col">
                  <span className="mb-[8px] block text-[15px]">
                    Product Code
                  </span>

                  <div className="flex gap-3 max-[768px]:flex-col">
                    <input
                      value={form.new_product_code}
                      onChange={(e) =>
                        updateField(
                          "new_product_code",
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleFetchNewProduct();
                        }
                      }}
                      className="
            h-[45px]
            flex-1
            rounded-[10px]
            border
            border-gray-300
            bg-white
            px-3
          "
                    />

                    <button
                      type="button"
                      onClick={handleFetchNewProduct}
                      disabled={loadingNewProduct}
                      className="
            h-[45px]
            min-w-[120px]
            rounded-[10px]
            bg-black
            px-4
            text-white
            font-medium
            transition
            hover:bg-[#111827]
            disabled:opacity-50
            max-[768px]:w-full
          "
                    >
                      {loadingNewProduct
                        ? "Loading..."
                        : "Fetch"}
                    </button>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-12 gap-x-5 gap-y-5">

                <Field
                  className="col-span-12 md:col-span-4"
                  label="Item ID"
                  readOnly
                  value={form.new_item_id}
                  onChange={() => { }}
                />

                <Field
                  className="col-span-12 md:col-span-4"
                  label="Product Name"
                  readOnly
                  value={form.new_product_name}
                  onChange={() => { }}
                />

                <Field
                  className="col-span-12 md:col-span-4"
                  label="Metal"
                  readOnly
                  value={form.new_metal}
                  onChange={() => { }}
                />

                <Field
                  className="col-span-12 md:col-span-4"
                  label="Purity"
                  readOnly
                  value={form.new_purity}
                  onChange={() => { }}
                />

                <Field
                  className="col-span-12 md:col-span-4"
                  label="Stone Wt."
                  readOnly
                  value={form.new_stone_weight}
                  onChange={() => { }}
                />

                <Field
                  className="col-span-12 md:col-span-4"
                  label="Net Wt."
                  readOnly
                  value={form.new_net_weight}
                  onChange={() => { }}
                />

                <Field
                  className="col-span-12 md:col-span-4"
                  label="Gross Wt."
                  readOnly
                  value={form.new_gross_weight}
                  onChange={() => { }}
                />

                <Field
                  className="col-span-12 md:col-span-4"
                  label="Condition"
                  value={form.new_condition}
                  onChange={(v) =>
                    updateField(
                      "new_condition",
                      v
                    )
                  }
                />

                <Field
                  className="col-span-12 md:col-span-4"
                  label="Value"
                  readOnly
                  value={form.new_value}
                  onChange={() => { }}
                />

                <Field
                  className="col-span-12 md:col-span-6"
                  label="Making Charge"
                  value={form.making_charge}
                  onChange={(v) =>
                    updateField(
                      "making_charge",
                      v
                    )
                  }
                />

                <Field
                  className="col-span-12 md:col-span-6"
                  label="Stone Amount"
                  value={form.stone_amount}
                  onChange={(v) =>
                    updateField(
                      "stone_amount",
                      v
                    )
                  }
                />
              </div>
            </>


          </ProductSection>

          {error ? (
            <div className="mt-[20px] rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
              {error}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-[#F1F5F9] bg-white px-[26px] py-[18px] sm:px-[30px]">
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-[250px_1fr]">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] rounded-[10px] border border-[#E5E7EB] bg-white text-[15px] font-medium text-[#020617] shadow-erp-sm transition hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#02031A] text-[15px] font-medium text-white shadow-erp-sm transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
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
      className={`
    rounded-2xl
    border
    p-6
    max-[768px]:p-3
    shadow-erp-sm
    ${isOld ? "mb-6" : ""}
    ${borderClass}
    ${bgClass}
  `}
    >
      <div
        className={`mb-[18px] flex items-center gap-[10px] text-[20px] font-semibold leading-[26px] tracking-[-0.035em] ${isOld ? "text-[#8C1014]" : "text-[#08751F]"
          }`}
      >
        <Box
          className={`h-5 w-5 ${isOld ? "text-[#FF1F1F]" : "text-[#16B833]"
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
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  readOnly?: boolean;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm sm:text-[15px] font-normal leading-5 whitespace-nowrap text-[#020617]">
        {label}
      </span>

      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`
  h-11
  w-full
  rounded-xl
  border
  px-4
  text-sm
  font-medium
  outline-none
  transition-all
  ${readOnly
            ? "border-slate-200 bg-slate-50 text-slate-500"
            : "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          }
`}
      />
    </label>
  );
}