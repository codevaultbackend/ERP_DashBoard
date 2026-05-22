"use client";

import { Html5Qrcode } from "html5-qrcode";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  CircleDot,
  Gem,
  Loader2,
  Play,
  RefreshCcw,
  Send,
  Sparkles,
  Square,
  Wifi,
  XCircle,
} from "lucide-react";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import {
  sendScannedItemToDesktop,
} from "@/features/retail/billing/billing-realtime";

import { scanBillingItemByCode } from "@/features/retail/billing/billing-api";

import type { LiveScannedBillingItem } from "@/features/retail/billing/live-scanner-types";

export default function MobileLiveScannerPage() {
  return (
    <Suspense fallback={<ScannerPageLoading />}>
      <MobileLiveScannerInner />
    </Suspense>
  );
}

function MobileLiveScannerInner() {
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session_id") || "";

  const readerId = "mobile-live-billing-scanner-reader";

  const scannerRef = useRef<Html5Qrcode | null>(null);

  const summaryRef = useRef<HTMLDivElement | null>(null);

  const cameraSectionRef = useRef<HTMLDivElement | null>(null);

  const scanLockRef = useRef(false);

  const sendLockRef = useRef(false);

  const processedCodesRef = useRef(new Set<string>());

  const [cameraStarted, setCameraStarted] = useState(false);

  const [cameraLoading, setCameraLoading] = useState(false);

  const [scanLoading, setScanLoading] = useState(false);

  const [sendLoading, setSendLoading] = useState(false);

  const [lastQrValue, setLastQrValue] = useState("");

  const [previewItem, setPreviewItem] =
    useState<LiveScannedBillingItem | null>(null);

  const [statusMessage, setStatusMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  async function startCamera() {
    try {
      setCameraLoading(true);

      setErrorMessage("");

      setStatusMessage("");

      if (!sessionId) {
        throw new Error(
          "session_id missing. Desktop billing page se scanner link copy karo."
        );
      }

      if (scannerRef.current) {
        return;
      }

      const scanner = new Html5Qrcode(readerId);

      scannerRef.current = scanner;

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 18,

          aspectRatio: 1.7777778,

          disableFlip: false,

          qrbox: (width, height) => {
            const edge = Math.min(width, height);

            const size = Math.floor(edge * 0.72);

            return {
              width: size,
              height: size,
            };
          },
        },

        async (decodedText) => {
          await handleDecodedQr(decodedText);
        }
      );

      setCameraStarted(true);

    } catch (error: any) {

      scannerRef.current = null;

      setCameraStarted(false);

      setErrorMessage(
        error?.message ||
          "Camera permission allow karo."
      );

    } finally {

      setCameraLoading(false);
    }
  }

  async function stopCamera() {
    try {
      const scanner = scannerRef.current;

      if (!scanner) return;

      try {
        await scanner.stop();
      } catch {}

      try {
        await scanner.clear();
      } catch {}

      scannerRef.current = null;

    } finally {
      setCameraStarted(false);
    }
  }

  async function handleDecodedQr(decodedText: string) {
    const cleanQr = String(decodedText || "").trim();

    if (!cleanQr) return;

    if (scanLockRef.current) {
      return;
    }

    if (processedCodesRef.current.has(cleanQr)) {
      return;
    }

    scanLockRef.current = true;

    try {
      setScanLoading(true);

      setErrorMessage("");

      setStatusMessage("");

      setPreviewItem(null);

      setLastQrValue(cleanQr);

      const item = await scanBillingItemByCode(cleanQr);

      if (!item?.item_id) {
        throw new Error("Invalid item");
      }

      processedCodesRef.current.add(cleanQr);

      setPreviewItem(item);

      setStatusMessage(
        "Item scanned successfully."
      );

      navigator.vibrate?.([100]);

      window.setTimeout(() => {
        summaryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);

    } catch (error: any) {

      setPreviewItem(null);

      setErrorMessage(
        error?.message || "QR scan failed."
      );

    } finally {

      scanLockRef.current = false;

      setScanLoading(false);
    }
  }

  async function sendPreviewToDesktop() {

    if (sendLockRef.current) {
      return;
    }

    try {

      sendLockRef.current = true;

      setSendLoading(true);

      setErrorMessage("");

      setStatusMessage("");

      if (!previewItem) {
        throw new Error("No scanned item found.");
      }

      await sendScannedItemToDesktop({
        sessionId,

        item: {
          ...previewItem,
          scanned_at: new Date().toISOString(),
        },
      });

      setStatusMessage(
        "Item sent to desktop billing page."
      );

      setPreviewItem(null);

      setLastQrValue("");

      window.setTimeout(() => {
        cameraSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);

    } catch (error: any) {

      setErrorMessage(
        error?.message ||
          "Failed to send item."
      );

    } finally {

      sendLockRef.current = false;

      setSendLoading(false);
    }
  }

  function scanAnotherItem() {
    setPreviewItem(null);

    setStatusMessage("");

    setErrorMessage("");

    setLastQrValue("");

    scanLockRef.current = false;

    window.setTimeout(() => {
      cameraSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  const scannerStateText = scanLoading
    ? "Fetching item..."
    : cameraStarted
      ? "Ready to scan"
      : "Camera stopped";

  return (
    <main className="min-h-screen bg-[#F4F6FA] text-[#0F172A]">
      <div className="mx-auto max-w-[480px] pb-[120px]">

        <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 px-4 py-4 backdrop-blur-xl">

          <div className="flex items-center justify-between gap-3">

            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[#111827]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <h1 className="truncate text-[18px] font-bold text-[#111827]">
                Mobile Billing Scanner
              </h1>

              <p className="mt-[2px] truncate text-[12px] font-medium text-[#667085]">
                Scan item and send to desktop billing
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECFDF5] text-[#059669]">
              <Wifi className="h-5 w-5" />
            </div>
          </div>
        </header>

        <section className="px-4 pt-4">

          {!sessionId ? (
            <AlertCard
              tone="error"
              title="Session missing"
              message="Desktop billing page se scanner link open karo."
            />
          ) : null}

          {errorMessage ? (
            <AlertCard
              tone="error"
              title="Error"
              message={errorMessage}
            />
          ) : null}

          {statusMessage ? (
            <AlertCard
              tone="success"
              title="Success"
              message={statusMessage}
            />
          ) : null}
        </section>

        <section
          ref={cameraSectionRef}
          className="px-4 pt-4"
        >
          <div className="overflow-hidden rounded-[34px] border border-[#111827] bg-[#050816]">

            <div className="flex items-center justify-between px-4 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 text-white">
                  <Camera className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[15px] font-bold text-white">
                    Product Scanner
                  </p>

                  <p className="mt-[2px] text-[12px] font-medium text-white/60">
                    Place QR inside frame
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">

                {scanLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                ) : (
                  <CircleDot
                    className={`h-3.5 w-3.5 ${
                      cameraStarted
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  />
                )}

                <span className="text-[11px] font-semibold text-white">
                  {scannerStateText}
                </span>
              </div>
            </div>

            <div className="relative aspect-[9/13] w-full overflow-hidden bg-black">

              <div
                id={readerId}
                className="h-full w-full"
              />

              {!cameraStarted ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050816] px-8 text-center text-white">

                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                    <Camera className="h-10 w-10" />
                  </div>

                  <h2 className="text-[22px] font-bold">
                    Start scanning
                  </h2>

                  <p className="mt-2 max-w-[280px] text-[13px] font-medium leading-5 text-white/65">
                    Camera allow karo aur QR frame ke andar rakho.
                  </p>
                </div>
              ) : null}

              {scanLoading ? (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">

                  <div className="rounded-[22px] bg-white px-5 py-4 text-center">

                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#7C3AED]" />

                    <p className="mt-3 text-[14px] font-bold text-[#111827]">
                      Verifying item
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">

              <button
                type="button"
                onClick={startCamera}
                disabled={
                  cameraStarted ||
                  cameraLoading ||
                  !sessionId
                }
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-white text-[15px] font-bold text-[#111827]"
              >
                {cameraLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}

                Start
              </button>

              <button
                type="button"
                onClick={stopCamera}
                disabled={!cameraStarted}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 text-[15px] font-bold text-white"
              >
                <Square className="h-4 w-4" />

                Stop
              </button>
            </div>
          </div>
        </section>

        <section className="px-4 pt-4">

          <div className="rounded-[22px] border border-[#E5E7EB] bg-white p-4">

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
                  Last scanned code
                </p>

                <p className="mt-2 break-all text-[13px] font-bold leading-5 text-[#111827]">
                  {lastQrValue || "No QR scanned yet"}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#F5F3FF] text-[#7C3AED]">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        <section
          ref={summaryRef}
          className="px-4 pt-5"
        >
          {previewItem ? (
            <ScannedSummaryCard
              item={previewItem}
              sendLoading={sendLoading}
              onSend={sendPreviewToDesktop}
              onScanAnother={scanAnotherItem}
            />
          ) : (
            <EmptySummaryCard />
          )}
        </section>
      </div>
    </main>
  );
}

function ScannedSummaryCard({
  item,
  sendLoading,
  onSend,
  onScanAnother,
}: any) {

  const name =
    item.item_name ||
    item.description ||
    item.name ||
    "Scanned Item";

  const code =
    item.product_code ||
    item.article_code ||
    item.sku_code ||
    item.code ||
    "-";

  return (
    <div className="rounded-[34px] border border-[#BBF7D0] bg-white p-4">

      <div className="rounded-[28px] bg-gradient-to-br from-[#ECFDF5] to-[#F5F3FF] p-4">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12px] font-bold text-emerald-700">
              <BadgeCheck className="h-4 w-4" />
              Item Scanned Successfully
            </div>

            <h2 className="mt-4 text-[24px] font-bold text-[#111827]">
              {name}
            </h2>

            <p className="mt-2 break-all text-[13px] font-semibold text-[#667085]">
              {code}
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-white text-[#7C3AED]">
            <Gem className="h-7 w-7" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">

        <SummaryBox
          label="Purity"
          value={item.purity || "-"}
        />

        <SummaryBox
          label="Metal"
          value={item.metal_type || "-"}
        />

        <SummaryBox
          label="Gross Wt"
          value={`${formatNumber(item.gross_weight)} g`}
        />

        <SummaryBox
          label="Net Wt"
          value={`${formatNumber(item.net_weight)} g`}
        />

        <SummaryBox
          label="Rate"
          value={`₹${formatNumber(item.rate)}`}
        />

        <SummaryBox
          label="Making"
          value={`₹${formatNumber(item.making_charge_value)}`}
        />

        <SummaryBox
          label="Available"
          value={String(Number(item.available_qty || 0))}
        />

        <SummaryBox
          label="Total"
          value={`₹${formatNumber(item.total_amount)}`}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">

        <button
          type="button"
          onClick={onSend}
          disabled={sendLoading}
          className="flex h-13 min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#050816] text-[15px] font-bold text-white"
        >
          {sendLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}

          Send to Desktop Billing
        </button>

        <button
          type="button"
          onClick={onScanAnother}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#E5E7EB] bg-white text-[14px] font-bold text-[#111827]"
        >
          <RefreshCcw className="h-4 w-4" />
          Scan Another Item
        </button>
      </div>
    </div>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#EEF2F7] bg-[#F8FAFC] p-3">

      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
        {label}
      </p>

      <p className="mt-2 break-words text-[15px] font-bold text-[#111827]">
        {value || "-"}
      </p>
    </div>
  );
}

function EmptySummaryCard() {
  return (
    <div className="rounded-[30px] border border-dashed border-[#CBD5E1] bg-white p-6 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F3FF] text-[#7C3AED]">
        <Camera className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-[18px] font-bold text-[#111827]">
        No item scanned yet
      </h3>

      <p className="mt-2 text-[13px] font-medium leading-5 text-[#667085]">
        QR scan hone ke baad item summary yahan show hogi.
      </p>
    </div>
  );
}

function AlertCard({
  tone,
  title,
  message,
}: any) {

  const success = tone === "success";

  return (
    <div
      className={`mb-3 flex items-start gap-3 rounded-[20px] border px-4 py-3 ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-[1px] h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="mt-[1px] h-5 w-5 shrink-0" />
      )}

      <div className="min-w-0">
        <p className="text-[13px] font-bold">
          {title}
        </p>

        <p className="mt-[2px] text-[12px] font-medium leading-5">
          {message}
        </p>
      </div>
    </div>
  );
}

function ScannerPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F6FA]">

      <div className="rounded-[24px] bg-white px-6 py-5 text-center shadow-sm">

        <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#7C3AED]" />

        <p className="mt-3 text-[14px] font-bold text-[#111827]">
          Loading scanner...
        </p>
      </div>
    </div>
  );
}

function formatNumber(value: unknown, digits = 2) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return "0.00";
  }

  return n.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}