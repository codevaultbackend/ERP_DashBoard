"use client";

import {
  QrCode,
  Wifi,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

export default function BillingHeader() {

  const [
    billingSessionId,
    setBillingSessionId,
  ] = useState("");

  /**
   * IMPORTANT
   * replace with actual values
   * from auth/store context/api
   */
  const storeCode =
    "STR001";

  const organizationId =
    "568";

  useEffect(() => {

    /**
     * persistent session
     */
    let sessionId =
      localStorage.getItem(
        "billing_session_id"
      );

    if (
      !sessionId
    ) {

      sessionId =
        crypto.randomUUID();

      localStorage.setItem(
        "billing_session_id",
        sessionId
      );
    }

    setBillingSessionId(
      sessionId
    );

  }, []);

  /**
   * scanner url
   */
  const scannerUrl =
    useMemo(() => {

      if (
        !billingSessionId
      ) {
        return "#";
      }

      return `/retail/billing/mobile-live-scanner?session_id=${billingSessionId}&store_code=${storeCode}&organization_id=${organizationId}`;

    }, [
      billingSessionId,
    ]);

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div className="min-w-0">

        <h1 className="text-[28px] font-bold leading-tight text-[#111827] sm:text-[32px]">
          Active Billing
        </h1>

        <p className="mt-2 text-[14px] text-[#6B7280] sm:text-[15px]">
          Scan items instantly from mobile scanner
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">

        {/* OPEN SCANNER */}
        {billingSessionId ? (
          <Link
            href={scannerUrl}
            target="_blank"
            className="flex h-[44px] items-center gap-2 rounded-full bg-[#111827] px-4 text-white shadow-[0px_8px_20px_rgba(2,6,23,0.12)] transition-all hover:opacity-95"
          >

            <QrCode className="h-4 w-4" />

            <span className="text-[13px] font-semibold">
              Open Scanner
            </span>
          </Link>
        ) : null}

        {/* LIVE */}
        <div className="flex h-[44px] items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4">

          <Wifi className="h-4 w-4 text-green-600" />

          <span className="text-[13px] font-semibold text-green-700">
            Scanner Live
          </span>
        </div>
      </div>
    </div>
  );
}