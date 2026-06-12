"use client";

import { Html5Qrcode } from "html5-qrcode";

import {
  ArrowLeft,
  Loader2,
  Play,
  QrCode,
  Send,
  Square,
  Wifi,
} from "lucide-react";

import { useSearchParams } from "next/navigation";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

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

  const searchParams =
    useSearchParams();

  /**
   * URL PARAMS
   */
  const sessionId =
    searchParams.get(
      "session_id"
    ) || "";

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(
        "billing_session_id",
        sessionId
      );

      console.log(
        "MOBILE SESSION:",
        sessionId
      );
    }
  }, [sessionId]);

  const storeCode =
    searchParams.get(
      "store_code"
    ) || "";

  const organizationId =
    searchParams.get(
      "organization_id"
    ) || "";

  /**
   * refs
   */
  const scannerRef =
    useRef<Html5Qrcode | null>(
      null
    );

  const scanLockRef =
    useRef(false);

  const sentCodesRef =
    useRef(new Set<string>());

  /**
   * states
   */
  const [
    socketConnected,
    setSocketConnected,
  ] = useState(false);

  const [
    cameraStarted,
    setCameraStarted,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /**
   * socket setup
   */
  useEffect(() => {

    if (
      !socket.connected
    ) {
      socket.connect();
    }

    const onConnect =
      () => {

        console.log(
          "Mobile socket connected"
        );

        setSocketConnected(
          true
        );
      };

    const onDisconnect =
      () => {

        console.log(
          "Mobile socket disconnected"
        );

        setSocketConnected(
          false
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

    setSocketConnected(
      socket.connected
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
    };

  }, []);

  /**
   * cleanup
   */
  useEffect(() => {

    return () => {
      stopScanner();
    };

  }, []);

  /**
   * start scanner
   */
  async function startScanner() {

    try {

      setError("");

      if (
        !sessionId
      ) {

        throw new Error(
          "Missing billing session"
        );
      }

      const scanner =
        new Html5Qrcode(
          "reader"
        );

      scannerRef.current =
        scanner;

      await scanner.start(
        {
          facingMode:
            "environment",
        },
        {
          fps: 15,
          qrbox: 250,
        },

        async (
          decodedText
        ) => {

          await onScanSuccess(
            decodedText
          );
        }
      );

      setCameraStarted(
        true
      );

    } catch (error: any) {

      console.error(
        error
      );

      setError(
        error?.message ||
        "Camera failed"
      );
    }
  }

  /**
   * stop scanner
   */
  async function stopScanner() {

    try {

      const scanner =
        scannerRef.current;

      if (
        !scanner
      ) {
        return;
      }

      await scanner.stop();

      await scanner.clear();

      scannerRef.current =
        null;

      setCameraStarted(
        false
      );

    } catch { }
  }

  /**
   * scan success
   */
  async function onScanSuccess(
    qrCode: string
  ) {
    console.log(
      "QR DETECTED =>",
      qrCode
    );

    if (scanLockRef.current) {
      return;
    }

    if (
      sentCodesRef.current.has(
        qrCode
      )
    ) {
      setSuccess(
        "Item sent to desktop"
      );

      navigator.vibrate?.([120]);

      return;
    }

    try {
      scanLockRef.current = true;

      setLoading(true);

      setError("");

      setSuccess("");

      const item =
        await scanBillingItemByCode(
          qrCode,
          sessionId
        );

      console.log(
        "API RESPONSE =>",
        item
      );

      if (!item) {
        throw new Error(
          "Item not found"
        );
      }

      setSending(true);

      console.log(
        "ITEM FETCHED SUCCESSFULLY",
        {
          sessionId,
          storeCode,
          organizationId,
          item,
        }
      );

      sentCodesRef.current.add(
        qrCode
      );

      setSuccess(
        "Item sent to desktop"
      );

      navigator.vibrate?.([120]);

    } catch (error: any) {
      console.error(error);

      setError(
        error?.message ||
        "Scan failed"
      );
    } finally {
      setLoading(false);

      setSending(false);

      scanLockRef.current =
        false;
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F6FA] pb-20">

      <div className="mx-auto max-w-[480px]">

        <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 px-4 py-4 backdrop-blur-xl">

          <div className="flex items-center justify-between gap-3">

            <button
              type="button"
              onClick={() =>
                window.history.back()
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="text-center">

              <h1 className="text-[18px] font-bold">
                Mobile Scanner
              </h1>

              <p className="text-[12px] text-[#667085]">
                Live billing scan
              </p>
            </div>

            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${socketConnected
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
                }`}
            >
              <Wifi className="h-5 w-5" />
            </div>
          </div>
        </header>

        <div className="p-4">

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              {success}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[30px] border border-[#111827] bg-[#050816]">

            <div className="flex items-center justify-between px-4 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">

                  <QrCode className="h-5 w-5" />
                </div>

                <div>

                  <p className="text-sm font-bold text-white">
                    Product Scanner
                  </p>

                  <p className="text-xs text-white/60">
                    Scan QR
                  </p>
                </div>
              </div>

              <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">

                {loading
                  ? "Scanning..."
                  : "Ready"}
              </div>
            </div>

            <div className="aspect-[9/13] bg-black">

              <div
                id="reader"
                className="h-full w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 p-4">

              <button
                type="button"
                onClick={
                  startScanner
                }
                disabled={
                  cameraStarted
                }
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-white font-bold text-[#111827]"
              >

                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}

                Start
              </button>

              <button
                type="button"
                onClick={
                  stopScanner
                }
                disabled={
                  !cameraStarted
                }
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 font-bold text-white"
              >

                <Square className="h-4 w-4" />

                Stop
              </button>
            </div>
          </div>

          {(loading ||
            sending) && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white p-4 text-sm font-semibold">

                <Loader2 className="h-4 w-4 animate-spin" />

                {sending
                  ? "Sending to desktop..."
                  : "Fetching item..."}
              </div>
            )}
        </div>
      </div>
    </main>
  );
}