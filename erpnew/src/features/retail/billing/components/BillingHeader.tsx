"use client";

import { QrCode, Wifi } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function BillingHeader() {
  const [billingSessionId, setBillingSessionId] = useState<string>("");
  const [storeCode, setStoreCode] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");

  /**
   * SAFE INIT (runs once)
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      /**
       * SESSION (single source of truth)
       */
      let sessionId = localStorage.getItem("billing_session_id");

      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("billing_session_id", sessionId);
      }

      setBillingSessionId(sessionId);

      /**
       * USER DATA
       */
      const userRaw = localStorage.getItem("user");

      if (!userRaw) return;

      const user = JSON.parse(userRaw);

      const resolvedStoreCode =
        user?.store_code ||
        user?.storeCode ||
        user?.store?.store_code ||
        "";

      const resolvedOrgId = String(
        user?.organization_id ||
          user?.organizationId ||
          user?.organization?.id ||
          user?.store?.organization_id ||
          ""
      );

      setStoreCode(resolvedStoreCode);
      setOrganizationId(resolvedOrgId);

      console.log("[BILLING HEADER INIT]", {
        sessionId,
        storeCode: resolvedStoreCode,
        organizationId: resolvedOrgId,
      });
    } catch (err) {
      console.error("Billing header init failed:", err);
    }
  }, []);

  /**
   * SCANNER URL (stable + safe)
   */
  const scannerUrl = useMemo(() => {
    if (!billingSessionId) return "#";

    const params = new URLSearchParams();

    params.set("session_id", billingSessionId);

    if (storeCode) {
      params.set("store_code", storeCode);
    }

    if (organizationId) {
      params.set("organization_id", organizationId);
    }

    return `/retail/billing/mobile-live-scanner?${params.toString()}`;
  }, [billingSessionId, storeCode, organizationId]);

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* LEFT */}
      <div className="min-w-0">
        <h1 className="text-[28px] font-bold text-[#111827] sm:text-[32px]">
          Active Billing
        </h1>

        <p className="mt-2 text-[14px] text-[#6B7280]">
          Scan items instantly from mobile scanner
        </p>

        {billingSessionId && (
          <p className="mt-2 break-all text-[11px] text-[#9CA3AF]">
            Session: {billingSessionId}
          </p>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={scannerUrl}
          target="_blank"
          className={`flex h-[44px] items-center gap-2 rounded-full px-4 text-white shadow transition ${
            billingSessionId
              ? "bg-[#111827] hover:opacity-95"
              : "pointer-events-none bg-gray-400"
          }`}
        >
          <QrCode className="h-4 w-4" />

          <span className="text-[13px] font-semibold">
            Open Scanner
          </span>
        </Link>

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