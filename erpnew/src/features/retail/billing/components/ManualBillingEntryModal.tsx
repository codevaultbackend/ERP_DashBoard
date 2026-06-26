"use client";

import {
  Calculator,
  Loader2,
  Receipt,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  createBillingInvoice,
  scanBillingItemByCode,
} from "@/features/retail/billing/billing-api";

type ManualBillingEntry = {
  id: string;

  item_id?: number | string;

  product_code: string;

  item_name: string;

  purity: string;

  gross_weight: number;

  net_weight: number;

  rate: number;

  making_charge_percent: number;

  making_charge_value: number;

  total_amount: number;

  unit?: string;

  batch_id?: number | null;
};

type CustomerForm = {
  name: string;

  phone: string;

  pan_card_number: string;

  pincode: string;

  address: string;
};

type Props = {
  open: boolean;

  onClose: () => void;

  onCreate?: (
    item: ManualBillingEntry
  ) => void;

  onBillCreated?: (
    response: any
  ) => void;
};

const emptyCustomer: CustomerForm = {
  name: "",

  phone: "",

  pan_card_number: "",

  pincode: "",

  address: "",
};

const emptyForm = {
  item_id: "",

  batch_id: "",

  product_code: "",

  item_name: "",

  purity: "18 KT",

  gross_weight: "",

  net_weight: "",

  rate: "",

  making_charge_percent: "",

  making_charge_value: "",

  total_amount: "",

  unit: "g",
};

export default function ManualBillingEntryModal({
  open,
  onClose,
  onCreate,
  onBillCreated,
}: Props) {

  const [loading, setLoading] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showCustomerModal, setShowCustomerModal] =
    useState(false);

  const [form, setForm] =
    useState<any>(emptyForm);

  const [customerForm, setCustomerForm] =
    useState<CustomerForm>(emptyCustomer);

  useEffect(() => {

    if (!open) {

      setForm(emptyForm);

      setCustomerForm(
        emptyCustomer
      );

      setError("");

      setSuccess("");

      setLoading(false);

      setSearching(false);

      setShowCustomerModal(false);
    }

  }, [open]);

  const computedTotal = useMemo(() => {
    return Number(form.total_amount || 0);
  }, [form.total_amount]);

  async function handleSearchProduct() {

    try {

      setSearching(true);

      setError("");

      setSuccess("");

      if (
        !form.product_code?.trim()
      ) {
        throw new Error(
          "Enter product code"
        );
      }

      const response =
        await scanBillingItemByCode(
          form.product_code.trim()
        );

      if (!response?.item_id) {
        throw new Error(
          "Product not found"
        );
      }

      setForm({
        item_id:
          response.item_id || "",

        batch_id:
          response.batch_id || "",

        product_code:
          response.product_code ||
          response.article_code ||
          "",

        item_name:
          response.item_name ||
          response.description ||
          "",

        purity:
          response.purity ||
          "18 KT",

        gross_weight:
          response.gross_weight ||
          "",

        net_weight:
          response.net_weight ||
          "",

        rate:
          response.rate || "",

        making_charge_percent:
          response.making_charge_percent ||
          "",

        making_charge_value:
          response.making_charge_value ||
          "",

        total_amount:
          response.total_amount ||
          "",

        unit:
          response.unit || "g",
      });

      setSuccess(
        "Product loaded successfully"
      );

    } catch (error: any) {

      setError(
        error?.message ||
        "Failed to fetch product"
      );

    } finally {

      setSearching(false);
    }
  }

  function handleOpenCustomerPopup() {

    setError("");

    if (
      !form.item_name?.trim()
    ) {
      setError(
        "Product name required"
      );

      return;
    }

    if (!form.item_id) {

      setError(
        "Please search valid product"
      );

      return;
    }

    setShowCustomerModal(true);
  }

  async function handleCreateInvoice() {

    if (loading) return;

    try {

      setLoading(true);

      setError("");

      setSuccess("");

      const parsedRate =
        parseFloat(
          form.rate || 0
        );

      const parsedWeight =
        parseFloat(
          form.net_weight || 0
        );

      const parsedMaking =
        parseFloat(
          form.making_charge_value || 0
        );

      if (parsedRate <= 0) {
        throw new Error(
          "Invalid product rate"
        );
      }

      if (parsedWeight <= 0) {
        throw new Error(
          "Invalid product weight"
        );
      }

      const payload = {

        customer:
          customerForm.name ||
            customerForm.phone ||
            customerForm.pan_card_number
            ? {
              name:
                customerForm.name?.trim() ||
                null,

              phone:
                customerForm.phone?.trim() ||
                null,

              pan_card_number:
                customerForm.pan_card_number
                  ?.trim()
                  ?.toUpperCase() ||
                null,

              pincode:
                customerForm.pincode?.trim() ||
                null,

              address:
                customerForm.address?.trim() ||
                null,
            }
            : null,

        paid_amount: 0,

        notes:
          "Created from manual billing modal",

        items: [
          {
            item_id:
              Number(
                form.item_id
              ),

            batch_id:
              form.batch_id &&
                !isNaN(
                  Number(
                    form.batch_id
                  )
                )
                ? Number(
                  form.batch_id
                )
                : null,

            product_code:
              String(
                form.product_code ||
                ""
              ).trim(),

            description:
              String(
                form.item_name ||
                ""
              ).trim(),

            qty: 1,

            net_weight:
              parsedWeight,

            rate:
              parsedRate,

            making_charge_percent:
              Number(
                form.making_charge_percent || 0
              ),

            making_charge_value:
              parsedMaking,

            unit:
              form.unit || "g",
          },
        ],
      };

      console.log(
        "CREATE BILL PAYLOAD =>",
        payload
      );

      const response =
        await createBillingInvoice(
          payload
        );

      console.log(
        "CREATE BILL RESPONSE =>",
        response
      );

      const createdItem: ManualBillingEntry =
      {
        id: crypto.randomUUID(),

        item_id:
          Number(
            form.item_id
          ),

        product_code:
          form.product_code,

        item_name:
          form.item_name,

        purity:
          form.purity,

        gross_weight:
          Number(
            form.gross_weight ||
            0
          ),

        net_weight:
          parsedWeight,

        rate:
          parsedRate,

        making_charge_percent:
          parsedMaking,

        making_charge_value:
          Number(
            form.making_charge_value ||
            0
          ),

        total_amount:
          Number(
            form.total_amount ||
            0
          ) || computedTotal,

        unit:
          form.unit || "g",

        batch_id:
          form.batch_id ||
          null,
      };


      onBillCreated?.(
        response
      );

      setSuccess(
        `Invoice created successfully • Bill No: ${response?.data
          ?.bill_number || ""
        }`
      );

      setForm(
        emptyForm
      );

      setCustomerForm(
        emptyCustomer
      );

      setShowCustomerModal(
        false
      );

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (error: any) {

      console.error(
        "CREATE BILL ERROR =>",
        error
      );

      let message =
        error?.message ||
        "Failed to create invoice";

      if (
        message
          ?.toLowerCase()
          ?.includes(
            "insufficient stock"
          )
      ) {

        message =
          "This item is out of stock or already sold.";

      } else if (
        message
          ?.toLowerCase()
          ?.includes(
            "already sold"
          )
      ) {

        message =
          "This product has already been sold.";

      } else if (
        message
          ?.toLowerCase()
          ?.includes(
            "item not found"
          )
      ) {

        message =
          "This product is no longer available.";

      } else if (
        message
          ?.toLowerCase()
          ?.includes(
            "duplicate item"
          )
      ) {

        message =
          "Duplicate product detected.";

      } else if (
        message
          ?.toLowerCase()
          ?.includes(
            "token"
          )
      ) {

        message =
          "Session expired. Please login again.";

      } else if (
        message
          ?.toLowerCase()
          ?.includes(
            "network"
          )
      ) {

        message =
          "Network issue. Please check internet connection.";
      }

      setError(
        message
      );

    } finally {

      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-5 backdrop-blur-[3px]">

        <div className="relative flex max-h-[95vh] w-full max-w-[512px] flex-col overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-white shadow-[0px_30px_80px_rgba(15,23,42,0.18)]">

          {/* HEADER */}
          <div className="flex items-start justify-between border-b border-[#EEF2F6] px-5 py-5 sm:px-7">

            <div>

              <h2 className="mt-0 text-[18px] font-[600] tracking-[-0.44px] text-[#0A0A0A]">
                Create New Bill Entry
              </h2>

              <p className="mt-1 text-[14px] font-[400] text-[#0A0A0A]">
                Scan or manually add billing item
              </p>

            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FAFC]"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">

            {error ? (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                {success}
              </div>
            ) : null}

            {/* SEARCH */}
            <div className="mb-6">

              <label className="mb-2 block text-sm font-bold text-[#111827]">
                Product Code
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="relative flex-1">

                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />

                  <input
                    value={
                      form.product_code
                    }
                    onChange={(e) =>
                      setForm(
                        (
                          prev: any
                        ) => ({
                          ...prev,
                          product_code:
                            e.target.value,
                        })
                      )
                    }
                    placeholder="Enter or scan product code"
                    className="h-[39px] w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] pl-11 pr-4 text-sm font-semibold outline-none transition-all focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#F4EBFF]"
                  />

                </div>

                <button
                  onClick={
                    handleSearchProduct
                  }
                  disabled={
                    searching
                  }
                  className="flex h-[39px] min-w-[130px] items-center justify-center gap-2 rounded-2xl bg-[#050816] px-5 text-sm font-bold text-white disabled:opacity-60"
                >

                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}

                  Search

                </button>

              </div>

            </div>

            {/* FIELDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <Field
                label="Product Name"
                readOnly
                value={
                  form.item_name
                }
                onChange={(
                  value: string
                ) =>
                  setForm(
                    (
                      prev: any
                    ) => ({
                      ...prev,
                      item_name:
                        value,
                    })
                  )
                }
              />

              <Field
                readOnly
                label="Purity"
                value={
                  form.purity
                }
                onChange={(
                  value: string
                ) =>
                  setForm(
                    (
                      prev: any
                    ) => ({
                      ...prev,
                      purity:
                        value,
                    })
                  )
                }
              />

              <Field
                readOnly
                type="number"
                label="Gross Weight"
                value={
                  form.gross_weight
                }
                onChange={(
                  value: string
                ) =>
                  setForm(
                    (
                      prev: any
                    ) => ({
                      ...prev,
                      gross_weight:
                        value,
                    })
                  )
                }
              />

              <Field
                readOnly
                type="number"
                label="Net Weight"
                value={
                  form.net_weight
                }
                onChange={(
                  value: string
                ) =>
                  setForm(
                    (
                      prev: any
                    ) => ({
                      ...prev,
                      net_weight:
                        value,
                    })
                  )
                }
              />

              <Field
                readOnly
                type="number"
                label="Rate"
                value={
                  form.rate
                }
                onChange={(
                  value: string
                ) =>
                  setForm(
                    (
                      prev: any
                    ) => ({
                      ...prev,
                      rate:
                        value,
                    })
                  )
                }
              />

              <Field
                type="number"
                label="Making Charges"
                value={form.making_charge_value}
                onChange={(value: string) =>
                  setForm((prev: any) => ({
                    ...prev,
                    making_charge_value: value,
                  }))
                }
              />

            </div>

            {/* TOTAL */}
            <div className="mt-6 rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5]">
                    <Calculator className="h-5 w-5" />
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#98A2B3]">
                      Estimated Total
                    </p>

                    <p className="mt-1 text-[20px] font-bold text-[#111827]">
                      ₹
                      {formatNumber(
                        computedTotal
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}
          <div className="border-t border-[#EEF2F6] px-5 py-5 sm:px-7">

            <div className="flex flex-col-reverse gap-3 sm:flex-row">

              <button
                onClick={onClose}
                className="flex h-14 w-full items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-sm font-bold"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleOpenCustomerPopup
                }
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#050816] text-sm font-bold text-white"
              >

                <Receipt className="h-4 w-4" />

                Create Bill

              </button>

            </div>

          </div>

        </div>

      </div>

      {/* CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-[560px] rounded-[28px] bg-white p-5 shadow-2xl sm:p-7">

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5]">
                  <User className="h-5 w-5" />
                </div>

                <div>

                  <h3 className="text-[24px] font-bold text-[#111827]">
                    Customer Details
                  </h3>

                  <p className="text-sm text-[#667085]">
                    Fill customer information
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setShowCustomerModal(
                    false
                  )
                }
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <Field
                label="Name"
                value={
                  customerForm.name
                }
                onChange={(
                  value: string
                ) =>
                  setCustomerForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      name:
                        value,
                    })
                  )
                }
              />

              <Field
                label="Phone"
                value={
                  customerForm.phone
                }
                onChange={(
                  value: string
                ) =>
                  setCustomerForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      phone:
                        value,
                    })
                  )
                }
              />

              <Field
                label="Pan Card"
                value={
                  customerForm.pan_card_number
                }
                onChange={(
                  value: string
                ) =>
                  setCustomerForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      pan_card_number:
                        value,
                    })
                  )
                }
              />

              <Field
                label="Pincode"
                value={
                  customerForm.pincode
                }
                onChange={(
                  value: string
                ) =>
                  setCustomerForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      pincode:
                        value,
                    })
                  )
                }
              />

              <div className="sm:col-span-2">

                <label className="mb-2 block text-sm font-bold text-[#111827]">
                  Address
                </label>

                <textarea
                  rows={4}
                  value={
                    customerForm.address
                  }
                  onChange={(e) =>
                    setCustomerForm(
                      (
                        prev
                      ) => ({
                        ...prev,
                        address:
                          e.target.value,
                      })
                    )
                  }
                  className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm font-semibold outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#F4EBFF]"
                />

              </div>

            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">

              <button
                onClick={() =>
                  setShowCustomerModal(
                    false
                  )
                }
                className="h-14 w-full rounded-2xl border border-[#E5E7EB] bg-white text-sm font-bold"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleCreateInvoice
                }
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#050816] text-sm font-bold text-white disabled:opacity-60"
              >

                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Receipt className="h-4 w-4" />
                )}

                Create Invoice

              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
}: any) {

  return (
    <div>

      <label className="mb-2 block text-sm font-[500] text-[#111827]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-[39px] w-full rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 text-sm font-semibold text-[#111827] outline-none transition-all focus:border-[#7C3AED] focus:bg-white focus:ring-4 focus:ring-[#F4EBFF]"
      />

    </div>
  );
}

function formatNumber(
  value: unknown,
  digits = 2
) {

  const n = Number(value || 0);

  return n.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits:
        digits,

      maximumFractionDigits:
        digits,
    }
  );
}