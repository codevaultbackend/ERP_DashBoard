"use client";

import { Box, Loader2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ExchangeInvoiceItem } from "./api/exchange-api";
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
  const [invoiceItems, setInvoiceItems] = useState<ExchangeInvoiceItem[]>([]);
  const [selectedOldItem, setSelectedOldItem] =
    useState<string>("");
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

      const items = response.data.items || [];

      if (!items.length) {
        throw new Error("No products found in invoice");
      }


      // show all products
      setInvoiceItems(items);

      // do not auto select
      setForm((prev) => ({
        ...prev,

        old_product_code: "",
        old_product_name: "",
        old_metal: "",
        old_purity: "",
        old_gross_weight: "",
        old_net_weight: "",
        old_stone_weight: "",
        old_value: "",
        old_item_id: "",
      }));

      setInvoiceLoaded(true);

    } catch (error: any) {

      setInvoiceLoaded(false);
      setInvoiceItems([]);

      setError(
        error?.message ||
        "Failed to fetch invoice"
      );

    } finally {
      setLoadingInvoice(false);
    }
  }
  function selectOldProduct(item: ExchangeInvoiceItem) {
    setSelectedOldItem(String(item.invoice_id));

    setForm((prev) => ({
      ...prev,

      old_item_id: String(item.invoice_id),

      old_product_code: item.product_code || "",

      old_product_name: item.product_name || "",

      old_metal: item.metal_type || "",

      old_purity: item.purity || "",

      old_gross_weight: String(
        item.gross_weight ?? ""
      ),

      old_net_weight: String(
        item.net_weight ?? ""
      ),

      old_stone_weight: String(
        item.stone_weight ?? ""
      ),

      old_value: String(
        item.value ?? ""
      ),

      old_condition: "OLD",
    }));
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="
      relative
      flex
      h-[92vh]
      w-full
      border-[1px]
      border-[#0000001A]
      max-w-[661px]
      flex-col
      shadow-[0px_4px_6px_-4px_#0000001A]
      overflow-hidden
      rounded-[32px]
      bg-white
      shadow-2xl
      "
      >

        {/* HEADER */}
        <div className="
      flex
      items-center
      justify-between
      px-6
      py-5
      "
        >

          <div>
            <h2 className="text-[18px] leading-[18px] font-[600] text-[#0A0A0A]
          ">
              Enter Exchange Details
            </h2>
          </div>


          <button
            type="button"
            onClick={onClose}
            className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          hover:bg-slate-100
          "
          >
            <X size={20} />
          </button>

        </div>



        {/* BODY */}

        <div
          className="
      flex-1
      overflow-y-auto
      space-y-6
      p-6
      py-0
      "
        >


          {/* OLD PRODUCT */}

          <ProductSection
            variant="old"
            title="Original Product"
            subtitle="Select product from invoice"
          >


            <div
              className="
    flex
    flex-col
    sm:flex-row
    gap-3
    w-full
  "
            >


              <input
                value={form.invoice_number}
                onChange={(e) =>
                  updateField(
                    "invoice_number",
                    e.target.value
                  )
                }

                placeholder="Enter invoice number"

                className="
h-12
w-full
min-w-0
rounded-xl
border
px-4
"
              />


              <button
                type="button"
                onClick={handleFetchInvoice}
                disabled={loadingInvoice}

                className="
h-12
w-full
sm:w-auto
rounded-xl
bg-black
px-6
text-white
font-medium
"
              >
                {
                  loadingInvoice
                    ?
                    "Fetching..."
                    :
                    "Fetch"
                }
              </button>


            </div>



            {
              invoiceItems.length > 0 &&
              (

                <div className="mt-6">


                  <div className="
              mb-3
              flex
              justify-between
              "
                  >

                    <h3 className="font-semibold">
                      Choose item
                    </h3>


                    <span className="
                text-xs
                text-slate-500
                ">
                      {invoiceItems.length} products
                    </span>

                  </div>



                  <div className="
              grid
grid-cols-1
lg:grid-cols-2
gap-3
              "
                  >

                    {
                      invoiceItems.map((item) => (

                        <button
                          key={item.invoice_id}
                          type="button"
                          onClick={() => selectOldProduct(item)}

                          className={`
              rounded-2xl
              border
              p-4
              text-left
              transition

              ${selectedOldItem === String(item.invoice_id)
                              ?
                              "border-[#FF0000] bg-blue-50"
                              :
                              "border-slate-200 hover:border-blue-300"
                            }
              `}
                        >

                          <div className="flex justify-between">

                            <span className="font-semibold">
                              {item.product_code}
                            </span>


                            {
                              selectedOldItem === String(item.invoice_id)
                              &&
                              <span className="
                  rounded-full
                  bg-[#FF0000]
                  px-2
                  text-xs
                  text-white
                  p-2
                  ">
                                Selected
                              </span>
                            }

                          </div>


                          <p className="mt-2 text-sm">
                            {item.product_name}
                          </p>


                          <p className="
                mt-2
                text-xs
                text-slate-500
                ">
                            {item.metal_type}
                            {" • "}
                            {item.purity}
                          </p>


                          <div className="
                mt-3
                flex
                justify-between
                text-xs
                text-slate-600
                ">

                            <span>
                              Gross {item.gross_weight}g
                            </span>

                            <span>
                              ₹{item.value}
                            </span>

                          </div>


                        </button>

                      ))
                    }


                  </div>

                </div>

              )
            }




            <div className="
          mt-6
          grid
          grid-cols-1
          gap-4
          md:grid-cols-3
          ">

              <Field
                label="Product Code"
                value={form.old_product_code}
                readOnly
                onChange={() => { }}
              />

              <Field
                label="Product Name"
                value={form.old_product_name}
                readOnly
                onChange={() => { }}
              />

              <Field
                label="Metal"
                value={form.old_metal}
                readOnly
                onChange={() => { }}
              />

              <Field
                label="Purity"
                value={form.old_purity}
                readOnly
                onChange={() => { }}
              />

              <Field
                label="Gross Weight"
                value={form.old_gross_weight}
                readOnly
                onChange={() => { }}
              />

              <Field
                label="Net Weight"
                value={form.old_net_weight}
                readOnly
                onChange={() => { }}
              />

              <Field
                label="Stone Weight"
                value={form.old_stone_weight}
                readOnly
                onChange={() => { }}
              />

              <Field
                label="Value"
                value={form.old_value}
                readOnly
                onChange={() => { }}
              />

            </div>


          </ProductSection>





          {/* NEW PRODUCT */}

          <ProductSection
            variant="new"
            title="New Product"
            subtitle="Scan replacement item"
          >


            <div
              className="
flex
flex-col
sm:flex-row
gap-3
"
            >


              <input
                value={form.new_product_code}

                onChange={(e) =>
                  updateField(
                    "new_product_code",
                    e.target.value
                  )
                }

                placeholder="Enter product code"

                className="
h-12
w-full
min-w-0
rounded-xl
border
px-4
"
              />


              <button
                type="button"
                onClick={handleFetchNewProduct}
                disabled={loadingNewProduct}

                className="
            rounded-xl
            bg-black
            px-6
            text-white
            "
              >

                {
                  loadingNewProduct
                    ?
                    "Loading..."
                    :
                    "Fetch"
                }

              </button>


            </div>



            <div className="
          mt-6
          grid
          gap-4
          md:grid-cols-3
          ">


              <Field label="Item ID"
                value={form.new_item_id}
                readOnly
                onChange={() => { }}
              />


              <Field label="Product Name"
                value={form.new_product_name}
                readOnly
                onChange={() => { }}
              />


              <Field label="Metal"
                value={form.new_metal}
                readOnly
                onChange={() => { }}
              />


              <Field label="Purity"
                value={form.new_purity}
                readOnly
                onChange={() => { }}
              />


              <Field label="Gross Weight"
                value={form.new_gross_weight}
                readOnly
                onChange={() => { }}
              />


              <Field label="Net Weight"
                value={form.new_net_weight}
                readOnly
                onChange={() => { }}
              />


              <Field label="Stone Weight"
                value={form.new_stone_weight}
                readOnly
                onChange={() => { }}
              />


              <Field label="Value"
                value={form.new_value}
                readOnly
                onChange={() => { }}
              />


              <Field
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


          </ProductSection>




          {
            error &&
            <div className="
        rounded-xl
        border
        border-red-200
        bg-red-50
        p-4
        text-sm
        text-red-600
        ">
              {error}
            </div>
          }


        </div>





        <div className="
      flex
      gap-3
      bg-white
      p-5
      "
        >

          <button
            type="button"
            onClick={onClose}
            className="
        h-12
        flex-1
        rounded-xl
        border
        "
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={submitting}

            className="
        h-12
        flex-1
        rounded-xl
        bg-black
        text-white
        "
          >

            {
              submitting &&
              <Loader2 className="mr-2 inline animate-spin" />
            }

            Create Exchange

          </button>


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
    ${isOld ? "mb-6 border-[#FF0000] border-[1px] bg-[#FEF2F2]" : "border-[1px] border-[#00A63E] bg-[#F0FDF4]"}
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
      <span className="
mb-2
block
text-sm
font-medium
leading-5
text-[#020617]
break-words
">
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