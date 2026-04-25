"use client";

import { ClientInvoiceRow } from "./types";

type Props = {
  invoice: ClientInvoiceRow;
};

export default function InvoiceDocument({ invoice }: Props) {
  const isPaid =
    invoice.pendingAmount === "₹0" ||
    invoice.pendingAmount === "₹0.00" ||
    invoice.pendingAmount === "₹0.0";

  return (
    <div className="mx-auto w-full max-w-[980px] bg-white px-8 py-10 text-[#1C1D21] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-[#232323]">
            MODEL TOWN STORE
          </h1>
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#9A7A19]">
            The Vault Editorial Group
          </p>

          <div className="mt-6 space-y-1 text-[13px] leading-[1.7] text-[#666]">
            <p>442, Model Town Store,</p>
            <p>Karnal, Haryana, 132001</p>
            <p>T: +91 184 220 9000</p>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#777]">
            Transaction Document
          </p>
          <h2 className="mt-2 text-[42px] font-semibold tracking-[-0.04em] text-[#202226]">
            #{invoice.invoiceNumber}
          </h2>

          <div className="mt-5 space-y-1 text-[14px] text-[#666]">
            <p>
              Date:
              <span className="ml-3 font-semibold text-[#232323]">
                {invoice.date}
              </span>
            </p>
            <p>
              Due Date:
              <span className="ml-3 font-semibold text-[#9A7A19]">
                {isPaid ? "Paid in Full" : "Pending"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#777]">
            Billed To
          </p>
          <h3 className="mt-4 text-[24px] font-semibold text-[#232323]">
            {invoice.customerName || "Customer"}
          </h3>

          <div className="mt-3 space-y-1 text-[14px] leading-[1.7] text-[#666]">
            <p>{invoice.customerAddress || "Customer address not available"}</p>
            <p>{invoice.customerPhone || "Phone not available"}</p>
            <p>{invoice.storeCode || "Store code unavailable"}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#777]">
            Payment Method
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-[15px] font-semibold text-[#232323]">
              Ledger Invoice Overview
            </p>
            <p className="text-[13px] text-[#666]">Ref: {invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div className="mt-14 overflow-x-auto">
        <table className="min-w-[760px] w-full border-separate border-spacing-0">
          <thead>
            <tr>
              {[
                "Asset Description",
                "Code",
                "Purity",
                "Weight",
                "Unit Rate",
                "Value (₹)",
              ].map((header) => (
                <th
                  key={header}
                  className="border-b border-[#ECECEC] px-3 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7B7B7B]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-[#F1F1F1] px-3 py-5 text-[15px] font-semibold text-[#262626]">
                Ledger Invoice Entry
              </td>
              <td className="border-b border-[#F1F1F1] px-3 py-5 text-[14px] text-[#666]">
                {invoice.billId || invoice.invoiceNumber}
              </td>
              <td className="border-b border-[#F1F1F1] px-3 py-5 text-[14px] text-[#666]">
                —
              </td>
              <td className="border-b border-[#F1F1F1] px-3 py-5 text-[14px] text-[#666]">
                —
              </td>
              <td className="border-b border-[#F1F1F1] px-3 py-5 text-[14px] text-[#666]">
                —
              </td>
              <td className="border-b border-[#F1F1F1] px-3 py-5 text-right text-[15px] font-semibold text-[#232323]">
                {invoice.totalAmount}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12 flex justify-end">
        <div className="w-full max-w-[320px] space-y-4">
          <div className="flex items-center justify-between text-[14px] text-[#666]">
            <span>Subtotal</span>
            <span className="font-medium">{invoice.totalAmount}</span>
          </div>
          <div className="flex items-center justify-between text-[14px] text-[#666]">
            <span>Received Amount</span>
            <span className="font-medium">{invoice.receivedAmount}</span>
          </div>
          <div className="flex items-center justify-between text-[14px] text-[#666]">
            <span>Pending Amount</span>
            <span className="font-medium">{invoice.pendingAmount}</span>
          </div>

          <div className="pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9A7A19]">
              Total Payable
            </p>
            <p className="mt-2 text-[36px] font-semibold tracking-[-0.04em] text-[#232323]">
              {invoice.totalAmount}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-[#ECECEC] pt-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-[84px] w-[84px] items-center justify-center bg-[#F3E4D9]">
              <div className="flex h-[64px] w-[44px] items-center justify-center rounded-[6px] bg-white text-[11px] font-semibold">
                QR
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9A7A19]">
                Digital Asset Fingerprint
              </p>
              <div className="mt-2 text-[12px] leading-[1.6] text-[#666]">
                <p>This document is digitally verified.</p>
                <p>Hash: 0XF...4FA2B</p>
                <p>Recorded on the Aureum Ledger.</p>
              </div>
            </div>
          </div>

          <div className="min-w-[240px] text-center">
            <div className="ml-auto flex h-[60px] w-[60px] items-center justify-center bg-[#F3E4D9] text-[12px] italic text-[#777]">
              Sign
            </div>
            <div className="mt-2 border-t border-[#1F1F1F] pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#444]">
                Authorized Signature
              </p>
              <p className="mt-1 text-[12px] text-[#666]">
                Audit Controller: V. Sharma
              </p>
            </div>
          </div>
        </div>

        <p className="mt-12 text-[11px] leading-[1.7] text-[#8A8A8A]">
          Legal Disclaimer: This document serves as a final certificate of ownership
          transfer for the digital and physical assets listed. All items are
          authenticated via the Vault Editorial Security Protocol. Asset transfer is
          governed by the Digital Atelier Terms &amp; Conditions.
        </p>
      </div>
    </div>
  );
}