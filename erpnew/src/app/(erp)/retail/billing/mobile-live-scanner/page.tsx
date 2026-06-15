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
  const sentCodesRef = useRef(new Set<string>());

  function addLog(message: string) {
    const log = `${new Date().toLocaleTimeString()} - ${message}`;
    console.log(log);

    setDebugLogs((prev) => [log, ...prev.slice(0, 30)]);
  }

  /**
   * SOCKET HANDLERS
   */
  useEffect(() => {
    addLog("🔌 Initializing Socket");

    if (!socket.connected) socket.connect();

    const onConnect = () => {
      setSocketConnected(true);
      addLog(`✅ Socket Connected (${socket.id})`);

      if (sessionId) {
        const room = `billing_session_${sessionId}`;
        socket.emit("join-billing-session", room);
        addLog(`🚪 Joining Session Room: ${room}`);
      }

      if (storeCode) {
        socket.emit("join-billing-store", storeCode);
        addLog(`🚪 Joining Store Room: ${storeCode}`);
      }

      if (organizationId) {
        socket.emit("join-billing-org", organizationId);
        addLog(`🚪 Joining Org Room: ${organizationId}`);
      }
    };

    const onDisconnect = (reason: string) => {
      setSocketConnected(false);
      addLog(`❌ Socket Disconnected (${reason})`);
    };

    const onSessionJoined = (data: any) => {
      addLog(`✅ Joined Session Room: ${data.room}`);
    };

    const onStoreJoined = (data: any) => {
      addLog(`✅ Joined Store Room: ${data.room}`);
    };

    const onOrgJoined = (data: any) => {
      addLog(`✅ Joined Org Room: ${data.room}`);
    };

    const onBillingItemScanned = (payload: any) => {
      addLog(`📡 billing-item-scanned received`);
      addLog(
        `📦 Item: ${
          payload?.item?.item_name ||
          payload?.item?.product_code ||
          "Unknown"
        }`
      );
    };

    const onError = (err: any) => {
      addLog(`❌ Socket Error: ${err?.message || "Unknown"}`);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);

    socket.on("billing-session-joined", onSessionJoined);
    socket.on("billing-store-joined", onStoreJoined);
    socket.on("billing-org-joined", onOrgJoined);
    socket.on("billing-item-scanned", onBillingItemScanned);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
      socket.off("billing-session-joined", onSessionJoined);
      socket.off("billing-store-joined", onStoreJoined);
      socket.off("billing-org-joined", onOrgJoined);
      socket.off("billing-item-scanned", onBillingItemScanned);
    };
  }, [sessionId, storeCode, organizationId]);

  /**
   * AUTO START SCANNER ON SOCKET READY
   */
  useEffect(() => {
    if (sessionId && socketConnected) {
      startScanner();
    }
  }, [sessionId, socketConnected]);

  /**
   * START SCANNER
   */
  async function startScanner() {
    try {
      addLog("📷 Starting Camera");
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
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => onScanSuccess(decodedText),
        () => {}
      );

      setCameraStarted(true);
      addLog("✅ Camera Started");
    } catch (err: any) {
      addLog(`❌ Camera Failed: ${err?.message}`);
      setError(err?.message || "Camera start failed");
    }
  }

  /**
   * STOP SCANNER
   */
  async function stopScanner() {
    try {
      if (!scannerRef.current) return;

      await scannerRef.current.stop().catch(() => {});
      await scannerRef.current.clear().catch(() => {});

      scannerRef.current = null;
      setCameraStarted(false);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * SCAN HANDLER
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

      try {
        const parsed = JSON.parse(qrCode);
        scanCode =
          parsed?.payload?.code ||
          parsed?.code ||
          parsed?.product_code ||
          qrCode;
      } catch {}

      addLog(`🔍 Parsed Code: ${scanCode}`);

      const item = await scanBillingItemByCode(scanCode, sessionId);

      addLog(`📦 Item: ${item?.item_name || item?.product_code || "Unknown"}`);

      sentCodesRef.current.add(qrCode);

      setSuccess("Scan successful");
      navigator.vibrate?.(120);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Scan failed";

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
        <header className="sticky top-0 z-40 bg-white px-4 py-4 border-b flex justify-between items-center">
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
        </header>

        <div className="p-4">
          {error && <div className="bg-red-100 p-3 rounded mb-3">{error}</div>}
          {success && (
            <div className="bg-green-100 p-3 rounded mb-3">{success}</div>
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

          {loading && (
            <div className="mt-4 flex justify-center items-center gap-2">
              <Loader2 className="animate-spin" />
              Fetching item...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}