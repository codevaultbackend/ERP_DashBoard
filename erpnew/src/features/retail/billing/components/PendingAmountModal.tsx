"use client";

import {
  CalendarDays,
  Check,
  CreditCard,
  Loader2,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type PaymentMethod =
  | "UPI"
  | "BANK"
  | "CASH";

type Props = {
  open: boolean;

  client?: any;

  invoiceId?: number;

  pendingAmount?: number;

  onClose: () => void;

  onSuccess?: () => void;
};

const API_BASE_URL =
  "https://erp-backend-w3pb.onrender.com";

export default function PendingAmountModal({
  open,
  client,
  invoiceId,
  pendingAmount = 0,
  onClose,
  onSuccess,
}: Props) {
  const amountRef =
    useRef<HTMLInputElement>(null);

  const [amount, setAmount] =
    useState("");

  const [paymentDate, setPaymentDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("UPI");

  const [txnId, setTxnId] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow =
      "hidden";

    setTimeout(() => {
      amountRef.current?.focus();
    }, 100);

    return () => {
      document.body.style.overflow =
        "unset";
    };
  }, [open]);

  const handleSubmit =
    async () => {
      try {
        setError("");
        setSuccess("");

        if (!invoiceId) {
          setError(
            "Invoice ID missing"
          );
          return;
        }

        const parsedAmount =
          Number(amount);

        if (
          !parsedAmount ||
          parsedAmount <= 0
        ) {
          setError(
            "Please enter valid amount"
          );
          return;
        }

        if (
          parsedAmount >
          pendingAmount
        ) {
          setError(
            `Payment cannot exceed pending amount ₹${pendingAmount}`
          );
          return;
        }

        const token =
          localStorage.getItem(
            "token"
          ) ||
          localStorage.getItem(
            "accessToken"
          ) ||
          localStorage.getItem(
            "authToken"
          );

        if (!token) {
          setError(
            "Authentication required"
          );
          return;
        }

        setLoading(true);

        const payload = {
          invoice_id:
            Number(invoiceId),

          amount:
            Number(parsedAmount),

          payment_method:
            paymentMethod,

          financier:
            "Self",

          txn_id:
            txnId || null,

          payment_date:
            paymentDate,

          remarks:
            remarks || null,
        };

        console.log(
          "PAYMENT PAYLOAD:",
          payload
        );

        const response =
          await fetch(
            `${API_BASE_URL}/ladger/payment`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body: JSON.stringify(
                payload
              ),
            }
          );

        const data =
          await response.json();

        console.log(
          "PAYMENT RESPONSE:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Payment failed"
          );
        }

        setSuccess(
          "Payment updated successfully"
        );

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="relative w-full max-w-2xl rounded-[32px] bg-white shadow-2xl"
      >
        {/* HEADER */}
        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <h2 className="text-2xl font-bold text-gray-900 sm:text-4xl">
            Update Payment
          </h2>

          {client?.clientName ? (
            <p className="mt-2 text-sm text-gray-500">
              {client.clientName}
            </p>
          ) : null}
        </div>

        {/* BODY */}
        <div className="max-h-[85vh] overflow-y-auto px-6 py-6 sm:px-8">
          {/* ALERT */}
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

          {/* FORM */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* AMOUNT */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Amount
              </label>

              <input
                ref={amountRef}
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                placeholder="Enter amount"
                className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* DATE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Payment Date
              </label>

              <div className="relative">
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) =>
                    setPaymentDate(
                      e.target.value
                    )
                  }
                  className="hide-date-icon h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-12 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

                <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* METHODS */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MethodCard
              label="UPI"
              icon={
                <Smartphone className="h-5 w-5" />
              }
              active={
                paymentMethod ===
                "UPI"
              }
              onClick={() =>
                setPaymentMethod(
                  "UPI"
                )
              }
            />

            <MethodCard
              label="BANK"
              icon={
                <CreditCard className="h-5 w-5" />
              }
              active={
                paymentMethod ===
                "BANK"
              }
              onClick={() =>
                setPaymentMethod(
                  "BANK"
                )
              }
            />

            <MethodCard
              label="CASH"
              icon={
                <Wallet className="h-5 w-5" />
              }
              active={
                paymentMethod ===
                "CASH"
              }
              onClick={() =>
                setPaymentMethod(
                  "CASH"
                )
              }
            />
          </div>

          {/* TXN */}
          {(paymentMethod ===
            "UPI" ||
            paymentMethod ===
              "BANK") && (
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Transaction ID
              </label>

              <input
                type="text"
                value={txnId}
                onChange={(e) =>
                  setTxnId(
                    e.target.value
                  )
                }
                placeholder="Enter transaction ID"
                className="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          )}

          {/* REMARKS */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Remarks
            </label>

            <textarea
              rows={4}
              value={remarks}
              onChange={(e) =>
                setRemarks(
                  e.target.value
                )
              }
              placeholder="Optional remarks"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* FOOTER */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              onClick={onClose}
              className="h-14 w-full rounded-2xl border border-gray-200 bg-white font-semibold transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-black font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}

              Update Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodCard({
  label,
  active,
  onClick,
  icon,
}: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-16 items-center justify-between rounded-2xl border px-4 transition ${
        active
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            active
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {icon}
        </div>

        <span className="font-semibold">
          {label}
        </span>
      </div>

      {active ? (
        <Check className="h-5 w-5 text-emerald-600" />
      ) : null}
    </button>
  );
}