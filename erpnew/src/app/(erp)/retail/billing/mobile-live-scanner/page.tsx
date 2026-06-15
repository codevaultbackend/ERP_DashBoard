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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLockRef = useRef(false);
  const sentCodesRef = useRef(new Set<string>());

  const [socketConnected, setSocketConnected] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function addLog(message: string) {
    const log = `${new Date().toLocaleTimeString()} - ${message}`;

    console.log(log);

    setDebugLogs((prev) => [
      log,
      ...prev.slice(0, 30),
    ]);
  }

  /**
   * SOCKET STATUS ONLY
   */

  useEffect(() => {
    if (sessionId) {
      startScanner();
    }
  }, [sessionId]);

  useEffect(() => {
    addLog("🔌 Initializing Socket");

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      setSocketConnected(true);

      addLog(
        `✅ Socket Connected (${socket.id})`
      );
    };

    const onDisconnect = (
      reason: string
    ) => {
      setSocketConnected(false);

      addLog(
        `❌ Socket Disconnected (${reason})`
      );
    };

    const onError = (err: any) => {
      addLog(
        `❌ Socket Error: ${err?.message || "Unknown"
        }`
      );
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(
      "connect_error",
      onError
    );

    return () => {
      socket.off("connect", onConnect);
      socket.off(
        "disconnect",
        onDisconnect
      );
      socket.off(
        "connect_error",
        onError
      );
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
      addLog("📷 Starting Camera");

      setError("");

      if (!sessionId) {
        throw new Error("Missing session_id in URL");
      }

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
        () => { }
      );

      setCameraStarted(true);

      addLog("✅ Camera Started");
      addLog(`🆔 Session: ${sessionId}`);
      addLog(`🏪 Store: ${storeCode}`);
      addLog(`🏢 Organization: ${organizationId}`);
    } catch (err: any) {
      addLog(
        `❌ Camera Failed: ${err?.message || "Unknown"
        }`
      );

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

    addLog("📦 QR Detected");

    if (sentCodesRef.current.has(qrCode)) {
      addLog("⚠ Duplicate Scan Blocked");

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

      try {
        const parsed = JSON.parse(qrCode);

        scanCode =
          parsed?.payload?.code ||
          parsed?.code ||
          parsed?.product_code ||
          qrCode;
      } catch { }

      addLog(`🔍 Parsed Code: ${scanCode}`);

      addLog(
        `📡 Sending API Request`
      );

      const item =
        await scanBillingItemByCode(
          scanCode,
          sessionId
        );

      addLog(
        "✅ Backend Returned Item"
      );

      addLog(
        `📦 Item: ${item?.item_name ||
        item?.product_code ||
        item?.name ||
        "Unknown"
        }`
      );

      addLog(
        `🆔 Session Used: ${sessionId}`
      );

      sentCodesRef.current.add(qrCode);

      setSuccess(
        "Backend received scan successfully"
      );

      addLog(
        "⏳ Waiting For Desktop To Receive Event"
      );

      navigator.vibrate?.(120);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Scan failed";

      addLog(`❌ ${message}`);

      setError(message);
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
          <div className="mb-4 rounded-xl border bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">
                Debug Logs
              </h3>

              <button
                className="text-xs text-red-500"
                onClick={() =>
                  setDebugLogs([])
                }
              >
                Clear
              </button>
            </div>

            <div className="max-h-64 overflow-auto space-y-1 text-xs">
              {debugLogs.map(
                (log, index) => (
                  <div
                    key={index}
                    className="break-all"
                  >
                    {log}
                  </div>
                )
              )}
            </div>
          </div>

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