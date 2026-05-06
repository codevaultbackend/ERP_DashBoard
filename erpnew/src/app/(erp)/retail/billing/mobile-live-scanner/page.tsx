"use client";

import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  CheckCircle2,
  Loader2,
  Play,
  Send,
  Square,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { supabaseRealtime } from "@/lib/supabase-realtime";
import {
  getBillingScannerChannelName,
  sendScannedItemToDesktop,
} from "@/features/retail/billing/billing-realtime";
import { parseExistingQrValue } from "@/features/retail/billing/parse-existing-qr";
import type { LiveScannedBillingItem } from "@/features/retail/billing/live-scanner-types";

export default function MobileLiveScannerPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading scanner...</div>}>
      <MobileLiveScannerInner />
    </Suspense>
  );
}

function MobileLiveScannerInner() {
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session_id") || "";
  const readerId = "mobile-live-billing-scanner-reader";

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanValueRef = useRef("");
  const lastScanAtRef = useRef(0);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  const [lastQrValue, setLastQrValue] = useState("");
  const [previewItem, setPreviewItem] = useState<LiveScannedBillingItem | null>(
    null
  );

  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    try {
      setCameraLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      if (!sessionId) {
        throw new Error(
          "session_id missing. Desktop billing page se scanner link copy karke open karo."
        );
      }

      if (scannerRef.current) return;

      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.72);

            return {
              width: size,
              height: size,
            };
          },
          aspectRatio: 1.777778,
          disableFlip: false,
        },
        async (decodedText) => {
          await handleDecodedQr(decodedText);
        },
        () => {}
      );

      setCameraStarted(true);
    } catch (error: any) {
      scannerRef.current = null;
      setCameraStarted(false);
      setErrorMessage(
        error?.message ||
          "Camera open nahi ho paya. Browser camera permission allow karo."
      );
    } finally {
      setCameraLoading(false);
    }
  }

  async function stopCamera() {
    try {
      if (!scannerRef.current) return;

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      await scannerRef.current.clear();
    } catch {
      // ignore cleanup error
    } finally {
      scannerRef.current = null;
      setCameraStarted(false);
    }
  }

  async function handleDecodedQr(decodedText: string) {
    const cleanQr = String(decodedText || "").trim();

    if (!cleanQr || scanLoading) return;

    const now = Date.now();

    if (
      lastScanValueRef.current === cleanQr &&
      now - lastScanAtRef.current < 2200
    ) {
      return;
    }

    lastScanValueRef.current = cleanQr;
    lastScanAtRef.current = now;

    try {
      setScanLoading(true);
      setErrorMessage("");
      setStatusMessage("");
      setPreviewItem(null);
      setLastQrValue(cleanQr);

      const item = parseExistingQrValue(cleanQr);

      setPreviewItem(item);
      setStatusMessage("Preview ready. Send to desktop billing page.");
    } catch (error: any) {
      setErrorMessage(error?.message || "QR scan failed.");
    } finally {
      setScanLoading(false);
    }
  }

  async function sendPreviewToDesktop() {
    try {
      setSendLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      if (!sessionId) {
        throw new Error("session_id missing.");
      }

      if (!previewItem) {
        throw new Error("No scanned item preview found.");
      }

      const channel = supabaseRealtime.channel(
        getBillingScannerChannelName(sessionId),
        {
          config: {
            broadcast: {
              self: false,
            },
          },
        }
      );

      await new Promise<void>((resolve, reject) => {
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") resolve();
          if (status === "CHANNEL_ERROR") reject(new Error("Realtime failed"));
        });
      });

      await sendScannedItemToDesktop({
        sessionId,
        item: {
          ...previewItem,
          scanned_at: new Date().toISOString(),
        },
        channel,
      });

      await supabaseRealtime.removeChannel(channel);

      setStatusMessage("Item sent to desktop billing page.");
      setPreviewItem(null);
      setLastQrValue("");
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to send item to desktop.");
    } finally {
      setSendLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <div className="mx-auto max-w-[480px] pb-8">
        <div className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/95 px-4 py-4 backdrop-blur">
          <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-[#111827]">
            Mobile Billing Scanner
          </h1>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Existing QR scan karo, preview dekho, desktop pe send karo.
          </p>
        </div>

        <div className="space-y-4 p-4">
          {!sessionId ? (
            <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
              Session missing. Desktop billing page se mobile scanner link copy
              karke open karo.
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {statusMessage ? (
            <div className="flex items-start gap-2 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">
              <CheckCircle2 className="mt-[1px] h-4 w-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[30px] border border-[#E5E7EB] bg-[#111827] shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <Camera className="h-4 w-4" />
                <span className="text-[14px] font-semibold">
                  Camera Scanner
                </span>
              </div>

              {scanLoading ? (
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12px] text-white">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Reading
                </div>
              ) : null}
            </div>

            <div className="relative aspect-[9/14] w-full overflow-hidden bg-black">
              <div id={readerId} className="h-full w-full" />

              {!cameraStarted ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-center text-white">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                    <Camera className="h-8 w-8" />
                  </div>

                  <p className="text-[15px] font-semibold">
                    Camera not started
                  </p>

                  <p className="mt-1 max-w-[260px] text-[12px] text-white/70">
                    Start dabao, camera permission allow karo, existing product
                    QR scan karo.
                  </p>
                </div>
              ) : null}

              {cameraStarted ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-[245px] w-[245px] rounded-[30px] border-2 border-white shadow-[0_0_0_999px_rgba(0,0,0,0.40)]">
                    <div className="h-full w-full rounded-[28px] border border-emerald-400" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                type="button"
                onClick={startCamera}
                disabled={cameraStarted || cameraLoading || !sessionId}
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-white text-[14px] font-semibold text-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
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
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Square className="h-4 w-4" />
                Stop
              </button>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className="text-[12px] text-[#6B7280]">Last scanned QR value</p>
            <p className="mt-1 break-all text-[13px] font-semibold text-[#111827]">
              {lastQrValue || "No QR scanned yet"}
            </p>
          </div>

          {previewItem ? (
            <div className="rounded-[26px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#7C3AED]">
                Preview
              </p>

              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-[#111827]">
                {previewItem.description ||
                  previewItem.item_name ||
                  previewItem.name ||
                  previewItem.product_code ||
                  previewItem.article_code ||
                  previewItem.raw_qr_value ||
                  "Scanned Item"}
              </h2>

              <p className="mt-1 break-all text-[13px] text-[#6B7280]">
                {previewItem.product_code ||
                  previewItem.article_code ||
                  previewItem.sku_code ||
                  previewItem.code ||
                  previewItem.raw_qr_value ||
                  "-"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <PreviewBox label="Item ID" value={previewItem.item_id || "-"} />
                <PreviewBox
                  label="Category"
                  value={previewItem.category || "-"}
                />
                <PreviewBox label="Metal" value={previewItem.metal_type || "-"} />
                <PreviewBox label="Purity" value={previewItem.purity || "-"} />
                <PreviewBox label="Unit" value={previewItem.unit || "pcs"} />
                <PreviewBox label="Qty" value={previewItem.qty || 1} />
                <PreviewBox
                  label="Net Weight"
                  value={`${Number(previewItem.net_weight || 0)} g`}
                />
                <PreviewBox
                  label="Rate"
                  value={`₹${Number(previewItem.rate || 0)}`}
                />
              </div>

              <button
                type="button"
                onClick={sendPreviewToDesktop}
                disabled={sendLoading}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#111827] text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send to Desktop Billing
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PreviewBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[16px] bg-[#F9FAFB] p-3">
      <p className="text-[11px] font-medium text-[#6B7280]">{label}</p>
      <p className="mt-1 break-words text-[13px] font-semibold text-[#111827]">
        {value || "-"}
      </p>
    </div>
  );
}