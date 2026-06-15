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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /**
   * SOCKET (ONLY FOR STATUS)
   */
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setSocketConnected(true);
      console.log("Mobile connected:", socket.id);
    };

    const onDisconnect = () => {
      setSocketConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  /**
   * CLEANUP
   */
  useEffect(() => {
    return () => stopScanner();
  }, []);

  /**
   * START SCANNER
   */
  async function startScanner() {
    try {
      setError("");

      if (!sessionId) throw new Error("Missing billing session");

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: 250 },
        (decodedText) => onScanSuccess(decodedText)
      );

      setCameraStarted(true);
    } catch (err: any) {
      setError(err?.message || "Camera failed");
    }
  }

  /**
   * STOP SCANNER
   */
  async function stopScanner() {
    try {
      const scanner = scannerRef.current;
      if (!scanner) return;

      await scanner.stop();
      await scanner.clear();
      scannerRef.current = null;

      setCameraStarted(false);
    } catch {}
  }

  /**
   * SCAN HANDLER (BACKEND FLOW ONLY)
   */
  async function onScanSuccess(qrCode: string) {
    if (scanLockRef.current) return;

    if (sentCodesRef.current.has(qrCode)) {
      setSuccess("Already scanned");
      navigator.vibrate?.(120);
      return;
    }

    try {
      scanLockRef.current = true;
      setLoading(true);
      setError("");
      setSuccess("");

      let scanCode = qrCode;

      try {
        const parsed = JSON.parse(qrCode);
        scanCode =
          parsed?.payload?.code ||
          parsed?.code ||
          parsed?.product_code ||
          qrCode;
      } catch {}

      /**
       * CALL BACKEND ONLY (IMPORTANT)
       */
      const item = await scanBillingItemByCode(scanCode, sessionId);

      if (!item) throw new Error("Item not found");

      sentCodesRef.current.add(qrCode);

      setSuccess("Item sent to desktop (via server)");
      navigator.vibrate?.(120);

      console.log("SCANNED ITEM:", item);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Scan failed");
    } finally {
      setLoading(false);
      setSending(false);
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
              className={`p-2 rounded-full ${
                socketConnected ? "bg-green-200" : "bg-red-200"
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
            <div className="mt-4 text-center">
              <Loader2 className="animate-spin inline" />
              Fetching item...
            </div>
          )}

        </div>
      </div>
    </main>
  );
}