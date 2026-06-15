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
    setDebugLogs((prev) => [log, ...prev.slice(0, 40)]);
  };

  /* =========================================================
     SOCKET INIT (CLEAN + SAFE)
  ========================================================= */
  useEffect(() => {
    addLog("MOBILE SCANNER INIT");

    if (!sessionId) {
      setError("Missing session_id");
      return;
    }

    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setSocketConnected(true);

      addLog(`SOCKET CONNECTED: ${socket.id}`);

      socket.emit("join-billing-session", {
        session_id: sessionId,
        store_code: storeCode,
        organization_id: organizationId,
      });
    };

    const onDisconnect = () => {
      setSocketConnected(false);
      addLog("SOCKET DISCONNECTED");
    };

    const onItem = (payload: any) => {
      addLog("SOCKET ITEM RECEIVED");
      setSuccess(payload?.item?.item_name || "Item received");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // IMPORTANT: backend event name must match EXACTLY
    socket.on("billing:item_scanned", onItem);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("billing:item_scanned", onItem);
    };
  }, [sessionId, storeCode, organizationId]);

  /* =========================================================
     CAMERA START
  ========================================================= */
  const startScanner = async () => {
    try {
      setError("");

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
        { fps: 10, qrbox: 250 },
        onScanSuccess
      );

      setCameraStarted(true);
      addLog("CAMERA STARTED");
    } catch (err: any) {
      setError(err.message);
      addLog(`CAMERA ERROR: ${err.message}`);
    }
  };

  const stopScanner = async () => {
    try {
      if (!scannerRef.current) return;

      await scannerRef.current.stop().catch(() => {});
      await scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;

      setCameraStarted(false);
      addLog("CAMERA STOPPED");
    } catch {}
  };

  /* =========================================================
     SCAN HANDLER (FIXED CORE LOGIC)
  ========================================================= */
  const onScanSuccess = async (qrCode: string) => {
    if (scanLockRef.current) return;

    scanLockRef.current = true;
    setLoading(true);

    try {
      addLog(`QR RAW: ${qrCode}`);

      let code = qrCode;

      try {
        const parsed = JSON.parse(qrCode);
        code =
          parsed?.payload?.code ||
          parsed?.code ||
          parsed?.sku_code ||
          parsed?.article_code ||
          qrCode;
      } catch {}

      code = String(code).trim();

      if (!code) throw new Error("Invalid QR code");

      // prevent duplicates (VERY IMPORTANT FIX)
      if (sentCodesRef.current.has(code)) {
        addLog("DUPLICATE BLOCKED");
        return;
      }

      sentCodesRef.current.add(code);

      addLog(`FINAL CODE: ${code}`);

      // CALL API ONLY ONCE
      const item = await scanBillingItemByCode(code, sessionId);

      addLog("SCAN SUCCESS API OK");

      setSuccess(item?.item_name || "Item scanned");

      /**
       * IMPORTANT:
       * Backend already emits socket in scanBillingItem
       * So NO need to emit again from frontend
       */

    } catch (err: any) {
      addLog(`SCAN ERROR: ${err.message}`);
      setError(err.message || "Scan failed");
    } finally {
      scanLockRef.current = false;
      setLoading(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */
  return (
    <main className="min-h-screen bg-[#F4F6FA] pb-20">
      <div className="mx-auto max-w-[480px]">

        <header className="p-4 flex justify-between">
          <ArrowLeft onClick={() => history.back()} />
          <div>
            <h1>Live Scanner</h1>
            <p>{sessionId}</p>
          </div>
          <Wifi color={socketConnected ? "green" : "red"} />
        </header>

        {error && <div className="bg-red-200 p-2">{error}</div>}
        {success && <div className="bg-green-200 p-2">{success}</div>}

        <div id="reader" className="h-[400px] bg-black" />

        <div className="flex gap-2 mt-4">
          <button onClick={startScanner} disabled={cameraStarted}>
            <Play /> Start
          </button>

          <button onClick={stopScanner} disabled={!cameraStarted}>
            <Square /> Stop
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="animate-spin" />
            Processing...
          </div>
        )}
      </div>
    </main>
  );
}