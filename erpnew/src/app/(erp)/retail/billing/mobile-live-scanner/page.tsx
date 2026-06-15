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
   SOCKET DEBUG MODE
========================================================= */
  useEffect(() => {
    addLog("====================================");
    addLog("MOBILE SCANNER INITIALIZING");
    addLog("====================================");

    addLog(`SESSION_ID = ${sessionId}`);
    addLog(`STORE_CODE = ${storeCode}`);
    addLog(`ORG_ID = ${organizationId}`);

    if (!socket.connected) {
      addLog("Calling socket.connect()");
      socket.connect();
    }

    const onConnect = () => {
      setSocketConnected(true);

      addLog("====================================");
      addLog("SOCKET CONNECTED");
      addLog(`SOCKET ID: ${socket.id}`);
      addLog(`TRANSPORT: ${socket.io.engine.transport.name}`);
      addLog("====================================");

      if (sessionId) {
        const payload = {
          session_id: sessionId,
          store_code: storeCode,
          organization_id: organizationId,
        };

        addLog(
          `EMIT join-billing-session => ${JSON.stringify(
            payload,
            null,
            2
          )}`
        );

        socket.emit(
          "join-billing-session",
          payload
        );
      }

      if (storeCode) {
        addLog(
          `EMIT join-billing-store => ${storeCode}`
        );

        socket.emit(
          "join-billing-store",
          {
            store_code: storeCode,
          }
        );
      }

      if (organizationId) {
        addLog(
          `EMIT join-billing-org => ${organizationId}`
        );

        socket.emit(
          "join-billing-org",
          {
            organization_id:
              organizationId,
          }
        );
      }
    };

    const onDisconnect = (
      reason: string
    ) => {
      addLog(
        `SOCKET DISCONNECTED => ${reason}`
      );

      setSocketConnected(false);
    };

    const onConnectError = (
      err: any
    ) => {
      addLog(
        `CONNECT ERROR => ${err?.message || "unknown"
        }`
      );

      console.error(
        "CONNECT ERROR",
        err
      );
    };

    const onSessionJoined = (
      data: any
    ) => {
      addLog(
        `SESSION JOIN ACK => ${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    };

    const onStoreJoined = (
      data: any
    ) => {
      addLog(
        `STORE JOIN ACK => ${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    };

    const onOrgJoined = (
      data: any
    ) => {
      addLog(
        `ORG JOIN ACK => ${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    };

    const onBillingItemScanned = (
      payload: any
    ) => {
      addLog(
        "===================================="
      );
      addLog(
        "EVENT RECEIVED: billing-item-scanned"
      );
      addLog(
        JSON.stringify(
          payload,
          null,
          2
        )
      );
      addLog(
        "===================================="
      );

      setSuccess(
        `Received ${payload?.item?.item_name ||
        payload?.item?.product_code ||
        "item"
        }`
      );
    };

    socket.on(
      "connect",
      onConnect
    );

    socket.on(
      "disconnect",
      onDisconnect
    );

    socket.on(
      "connect_error",
      onConnectError
    );

    socket.on(
      "billing-session-joined",
      onSessionJoined
    );

    socket.on(
      "billing-store-joined",
      onStoreJoined
    );

    socket.on(
      "billing-org-joined",
      onOrgJoined
    );

    socket.on(
      "billing-item-scanned",
      onBillingItemScanned
    );

    socket.onAny(
      (
        event,
        ...args
      ) => {
        addLog(
          `[SOCKET EVENT] ${event}`
        );

        console.log(
          "[SOCKET EVENT]",
          event,
          args
        );
      }
    );

    return () => {
      socket.off(
        "connect",
        onConnect
      );

      socket.off(
        "disconnect",
        onDisconnect
      );

      socket.off(
        "connect_error",
        onConnectError
      );

      socket.off(
        "billing-session-joined",
        onSessionJoined
      );

      socket.off(
        "billing-store-joined",
        onStoreJoined
      );

      socket.off(
        "billing-org-joined",
        onOrgJoined
      );

      socket.off(
        "billing-item-scanned",
        onBillingItemScanned
      );
    };
  }, [
    sessionId,
    storeCode,
    organizationId,
  ]);

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
        await scannerRef.current.stop().catch(() => { });
        await scannerRef.current.clear().catch(() => { });
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

      await scannerRef.current.stop().catch(() => { });
      await scannerRef.current.clear().catch(() => { });

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
  const onScanSuccess = async (
    qrCode: string
  ) => {
    if (scanLockRef.current) {
      addLog(
        "SCAN BLOCKED: LOCK ACTIVE"
      );
      return;
    }

    try {
      scanLockRef.current = true;
      setLoading(true);

      addLog(
        "===================================="
      );
      addLog(
        `RAW QR => ${qrCode}`
      );

      let code = qrCode;

      try {
        const parsed =
          JSON.parse(qrCode);

        addLog(
          `PARSED QR => ${JSON.stringify(
            parsed,
            null,
            2
          )}`
        );

        code =
          parsed?.payload?.code ||
          parsed?.code ||
          parsed?.sku_code ||
          parsed?.article_code ||
          qrCode;
      } catch {
        addLog(
          "QR IS PLAIN STRING"
        );
      }

      addLog(
        `FINAL CODE => ${code}`
      );

      if (
        sentCodesRef.current.has(code)
      ) {
        addLog(
          `DUPLICATE CODE => ${code}`
        );

        return;
      }

      addLog(
        `API REQUEST START => ${code}`
      );

      const item =
        await scanBillingItemByCode(
          code,
          sessionId
        );

      addLog(
        "API RESPONSE SUCCESS"
      );

      addLog(
        JSON.stringify(
          item,
          null,
          2
        )
      );

      sentCodesRef.current.add(code);

      setSuccess(
        "Item scanned successfully"
      );
    } catch (err: any) {
      addLog(
        "API REQUEST FAILED"
      );

      addLog(
        JSON.stringify(
          {
            message:
              err?.message,
            status:
              err?.response?.status,
            data:
              err?.response?.data,
          },
          null,
          2
        )
      );

      setError(
        err?.message ||
        "Scan failed"
      );
    } finally {
      scanLockRef.current =
        false;

      setLoading(false);

      addLog(
        "SCAN FLOW COMPLETE"
      );
      addLog(
        "===================================="
      );
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
          <div className="mt-6">
            <h3 className="font-bold mb-2">
              Debug Logs
            </h3>

            <div className="bg-black text-green-400 p-3 rounded text-xs h-80 overflow-auto">
              {debugLogs.map(
                (log, index) => (
                  <div key={index}>
                    {log}
                  </div>
                )
              )}
            </div>
          </div>

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