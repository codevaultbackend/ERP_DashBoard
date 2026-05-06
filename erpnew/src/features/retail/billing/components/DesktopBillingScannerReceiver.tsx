"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  RefreshCcw,
  Smartphone,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  createBillingSessionId,
  removeBillingScannerChannel,
  subscribeBillingScannerSession,
} from "../billing-realtime";
import type { LiveScannedBillingItem } from "../live-scanner-types";

type Props = {
  onItemReceived: (item: LiveScannedBillingItem) => void;
};

export default function DesktopBillingScannerReceiver({
  onItemReceived,
}: Props) {
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("CREATED");
  const [lastItemText, setLastItemText] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let existing = localStorage.getItem("billing_live_scan_session_id");

    if (!existing) {
      existing = createBillingSessionId();
      localStorage.setItem("billing_live_scan_session_id", existing);
    }

    setSessionId(existing);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    setErrorMessage("");

    const channel = subscribeBillingScannerSession({
      sessionId,
      onStatus: setStatus,
      onError: setErrorMessage,
      onItemScanned: (item) => {
        onItemReceived(item);

        const text =
          item.product_code ||
          item.article_code ||
          item.sku_code ||
          item.code ||
          item.barcode ||
          item.item_name ||
          item.name ||
          item.description ||
          item.raw_qr_value ||
          "Scanned item";

        setLastItemText(String(text));
      },
    });

    return () => {
      removeBillingScannerChannel(channel);
    };
  }, [sessionId, onItemReceived]);

  const mobileUrl = useMemo(() => {
    if (typeof window === "undefined" || !sessionId) return "";

    /**
     * Your current Next.js route:
     * src/app/(erp)/retail/billing/mobile-live-scanner/page.tsx
     *
     * So URL must be:
     * /retail/billing/mobile-live-scanner
     */
    const origin =
      process.env.NEXT_PUBLIC_MOBILE_APP_ORIGIN || window.location.origin;

    return `${origin}/retail/billing/mobile-live-scanner?session_id=${encodeURIComponent(
      sessionId
    )}`;
  }, [sessionId]);

  async function copyMobileUrl() {
    if (!mobileUrl) return;

    try {
      await navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setErrorMessage("Clipboard copy failed. Please copy link manually.");
    }
  }

  function resetSession() {
    const next = createBillingSessionId();

    localStorage.setItem("billing_live_scan_session_id", next);
    setSessionId(next);
    setLastItemText("");
    setErrorMessage("");
    setStatus("CREATED");
  }

  const connected = status === "SUBSCRIBED";

  return (
    <div className="mx-auto mb-5 w-full max-w-[1600px] rounded-[24px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                connected
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {connected ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0">
              <h3 className="text-[16px] font-semibold text-[#111827]">
                Live Mobile Scanner
              </h3>
              <p className="text-[13px] text-[#667085]">
                Status: {connected ? "Connected" : status}
              </p>
            </div>
          </div>

          {lastItemText ? (
            <div className="mt-3 flex items-center gap-2 rounded-[14px] bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="break-all">Last received: {lastItemText}</span>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-3 rounded-[14px] bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={copyMobileUrl}
            disabled={!mobileUrl}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111827] px-4 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Smartphone className="h-4 w-4" />
            {copied ? "Copied" : "Copy Mobile Scanner Link"}
          </button>

          <button
            type="button"
            onClick={resetSession}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-4 text-[13px] font-semibold text-[#111827]"
          >
            <RefreshCcw className="h-4 w-4" />
            New Session
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-[14px] bg-[#F9FAFB] p-3">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-medium text-[#667085]">
          <Copy className="h-3.5 w-3.5" />
          Open this link on mobile
        </div>

        <p className="break-all text-[12px] font-semibold text-[#111827]">
          {mobileUrl || "Generating scanner link..."}
        </p>
      </div>
    </div>
  );
}