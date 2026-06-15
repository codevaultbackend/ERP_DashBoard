"use client";

import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, Loader2, Play, Square, Wifi } from "lucide-react";
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

  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLockRef = useRef(false);
  const sentCodesRef = useRef<Set<string>>(new Set());

  const addLog = (msg: string) => {
    const log = `${new Date().toLocaleTimeString()} - ${msg}`;
    console.log(log);
    setDebugLogs((prev) => [log, ...prev.slice(0, 30)]);
  };

  /* =========================================================
     SOCKET SETUP (BACKEND ALIGNED)
  ========================================================= */
  useEffect(() => {
    addLog("🔌 Connecting socket...");

    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setSocketConnected(true);
      addLog(`✅ Socket connected: ${socket.id}`);

      /**
       * IMPORTANT: backend expects OBJECT payload
       */
      if (sessionId) {
        socket.emit("join-billing-session", {
          session_id: sessionId,
          store_code: storeCode,
          organization_id: organizationId,
        });

        addLog(`🚪 Joined session: ${sessionId}`);
      }

      if (storeCode) {
        socket.emit("join-billing-store", {
          store_code: storeCode,
        });
      }

      if (organizationId) {
        socket.emit("join-billing-org", {
          organization_id: organizationId,
        });
      }
    };

    const onDisconnect = (reason: string) => {
      setSocketConnected(false);
      addLog(`❌ Socket disconnected: ${reason}`);
    };

    const onBillingItemScanned = (payload: any) => {
      addLog("📡 Live item received via socket");

      const itemName =
        payload?.item?.item_name ||
        payload?.item?.product_code ||
        "Unknown";

      setSuccess(`Added: ${itemName}`);
      navigator.vibrate?.(120);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    /**
     * MUST MATCH BACKEND EMIT EVENT
     */
    socket.on("billing-item-scanned", onBillingItemScanned);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("billing-item-scanned", onBillingItemScanned);
    };
  }, [sessionId, storeCode, organizationId]);

  /* =========================================================
     AUTO START CAMERA
  ========================================================= */
  useEffect(() => {
    if (socketConnected && sessionId) {
      startScanner();
    }
  }, [socketConnected, sessionId]);

  /* =========================================================
     START CAMERA
  ========================================================= */
  const startScanner = async () => {
    try {
      setError("");
      addLog("📷 Starting camera...");

      if (!sessionId) throw new Error("Missing session_id");

      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess
      );

      setCameraStarted(true);
      addLog("✅ Camera started");
    } catch (err: any) {
      setError(err.message || "Camera failed");
      addLog(`❌ Camera error: ${err.message}`);
    }
  };

  /* =========================================================
     STOP CAMERA
  ========================================================= */
  const stopScanner = async () => {
    try {
      if (!scannerRef.current) return;

      await scannerRef.current.stop().catch(() => {});
      await scannerRef.current.clear().catch(() => {});

      scannerRef.current = null;
      setCameraStarted(false);

      addLog("⛔ Camera stopped");
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================================================
     SCAN HANDLER (FIXED + SAFE)
  ========================================================= */
  const onScanSuccess = async (qrCode: string) => {
    if (scanLockRef.current) return;

    try {
      scanLockRef.current = true;
      setLoading(true);

      let code = qrCode;

      /**
       * Safe JSON parsing
       */
      try {
        const parsed = JSON.parse(qrCode);
        code =
          parsed?.payload?.code ||
          parsed?.code ||
          parsed?.sku_code ||
          parsed?.article_code ||
          qrCode;
      } catch {
        // raw QR
      }

      /**
       * FIXED: use parsed code for dedup
       */
      if (sentCodesRef.current.has(code)) {
        setSuccess("Already scanned");
        return;
      }

      addLog(`🔍 Scanned code: ${code}`);

      await scanBillingItemByCode(code, sessionId);

      sentCodesRef.current.add(code);

      setSuccess("Item scanned successfully");
      navigator.vibrate?.(100);
    } catch (err: any) {
      const msg = err?.message || "Scan failed";
      setError(msg);
      addLog(`❌ ${msg}`);
    } finally {
      setLoading(false);
      scanLockRef.current = false;
    }
  };

  /* =========================================================
     UI
  ========================================================= */
  return (
    <main className="min-h-screen bg-[#F4F6FA] pb-20">
      <div className="mx-auto max-w-[480px]">

        {/* HEADER */}
        <header className="sticky top-0 bg-white p-4 flex justify-between items-center">
          <button onClick={() => history.back()}>
            <ArrowLeft />
          </button>

          <div className="text-center">
            <h1 className="font-semibold">Live Scanner</h1>
            <p className="text-xs text-gray-500">Billing session</p>
          </div>

          <div className={socketConnected ? "text-green-500" : "text-red-500"}>
            <Wifi />
          </div>
        </header>

        {/* STATUS */}
        <div className="p-4">

          {error && (
            <div className="bg-red-100 p-2 mb-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 p-2 mb-2 rounded">
              {success}
            </div>
          )}

          {/* CAMERA */}
          <div className="bg-black rounded-lg overflow-hidden">
            <div id="reader" className="h-[400px]" />
          </div>

          {/* CONTROLS */}
          <div className="flex gap-2 mt-4">
            <button onClick={startScanner} disabled={cameraStarted}>
              <Play /> Start
            </button>

            <button onClick={stopScanner} disabled={!cameraStarted}>
              <Square /> Stop
            </button>
          </div>

          {/* LOADER */}
          {loading && (
            <div className="flex items-center gap-2 mt-3">
              <Loader2 className="animate-spin" />
              Processing...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}