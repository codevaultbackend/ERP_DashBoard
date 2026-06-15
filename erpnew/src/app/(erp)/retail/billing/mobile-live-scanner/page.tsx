"use client";

import { Html5Qrcode } from "html5-qrcode";
import {
  ArrowLeft,
  Loader2,
  Play,
  Square,
  Wifi,
} from "lucide-react";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { scanBillingItemByCode } from "@/features/retail/billing/billing-api";
import { socket } from "../../../../../features/retail/billing/socket";

export default function MobileLiveScannerPage() {
  return (
    <Suspense fallback={null}>
      <MobileScannerInner />
    </Suspense>
  );
}

function MobileScannerInner() {
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("session_id") || "";
  const storeCode = searchParams.get("store_code") || "";
  const organizationId = searchParams.get("organization_id") || "";

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLockRef = useRef(false);
  const sentCodesRef = useRef(new Set<string>());

  const [socketConnected, setSocketConnected] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * SOCKET STATUS ONLY
   */

  useEffect(() => {
    if (sessionId) {
      startScanner();
    }
  }, [sessionId]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  /**
   * CLEANUP ON UNMOUNT
   */
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  /**
   * START SCANNER (FIXED SAFE VERSION)
   */
  async function startScanner() {
    try {
      setError("");

      if (!sessionId) {
        throw new Error("Missing session_id in URL");
      }

      // IMPORTANT: stop previous instance if exists
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => { });
        await scannerRef.current.clear().catch(() => { });
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // ignore scan noise
        }
      );

      setCameraStarted(true);
    } catch (err: any) {
      console.error("Scanner start error:", err);
      setError(err?.message || "Camera start failed");
    }
  }

  /**
   * STOP SCANNER (FIXED)
   */
  async function stopScanner() {
    try {
      const scanner = scannerRef.current;
      if (!scanner) return;

      await scanner.stop().catch(() => { });
      await scanner.clear().catch(() => { });

      scannerRef.current = null;
      setCameraStarted(false);
    } catch (err) {
      console.error("Stop scanner error:", err);
    }
  }

  /**
   * SCAN HANDLER (ROBUST + SAFE)
   */

  async function onScanSuccess(qrCode: string) {
    if (scanLockRef.current) return;

    if (sentCodesRef.current.has(qrCode)) {
      setSuccess("Already scanned");
      navigator.vibrate?.(100);
      return;
    }

    try {
      scanLockRef.current = true;
      setLoading(true);
      setError("");
      setSuccess("");

      let scanCode = qrCode;

      // QR parsing safety
      try {
        const parsed = JSON.parse(qrCode);
        scanCode =
          parsed?.payload?.code ||
          parsed?.code ||
          parsed?.product_code ||
          qrCode;
      } catch { }

      console.log("Scanning code:", scanCode);

      /**
       * CALL BACKEND (ONLY SOURCE OF TRUTH)
       */
      const item = await scanBillingItemByCode(
        scanCode,
        sessionId
      );

      console.log("[SCAN RESPONSE]", {
        item,
        sessionId,
      });

      sentCodesRef.current.add(qrCode);

      setSuccess("Item sent successfully");
      navigator.vibrate?.(120);

      console.log("SCANNED ITEM RESPONSE:", item);
    } catch (err: any) {
      console.error("SCAN ERROR:", err);
      setError(err?.response?.data?.message || err?.message || "Scan failed");
    } finally {
      setLoading(false);
      scanLockRef.current = false;
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F6FA] pb-20">
      <div className="mx-auto max-w-[480px]">

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white px-4 py-4 border-b">
          <div className="flex justify-between items-center">

            <button onClick={() => history.back()}>
              <ArrowLeft />
            </button>

            <div className="text-center">
              <h1 className="font-bold">Mobile Scanner</h1>
              <p className="text-xs text-gray-500">Live billing scan</p>
            </div>

            <div
              className={`p-2 rounded-full ${socketConnected ? "bg-green-200" : "bg-red-200"
                }`}
            >
              <Wifi />
            </div>

          </div>
        </header>

        {/* BODY */}
        <div className="p-4">

          {error && (
            <div className="bg-red-100 p-3 rounded mb-3">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 p-3 rounded mb-3">
              {success}
            </div>
          )}

          {/* CAMERA */}
          <div className="bg-black rounded-xl overflow-hidden">
            <div id="reader" className="w-full h-[400px]" />
          </div>

          {/* CONTROLS */}
          <div className="grid grid-cols-2 gap-3 mt-4">

            <button onClick={startScanner} disabled={cameraStarted}>
              <Play /> Start
            </button>

            <button onClick={stopScanner} disabled={!cameraStarted}>
              <Square /> Stop
            </button>

          </div>

          {/* LOADING */}
          {loading && (
            <div className="mt-4 text-center flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" />
              Fetching item...
            </div>
          )}

        </div>
      </div>
    </main>
  );
}