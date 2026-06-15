"use client";

import { useEffect, useRef } from "react";
import { socket } from "../socket";

type Props = {
  onItemReceived: (item: any) => void;
  onPreview?: (item: any) => void;
};

export default function DesktopBillingScannerReceiver({
  onItemReceived,
  onPreview,
}: Props) {
  const sessionRef = useRef<string>("");

  useEffect(() => {
    let billingSessionId = localStorage.getItem("billing_session_id");

    if (!billingSessionId) {
      billingSessionId = crypto.randomUUID();
      localStorage.setItem("billing_session_id", billingSessionId);
    }

    sessionRef.current = billingSessionId;

    const roomName = `billing_session_${billingSessionId}`;

    if (!socket.connected) {
      socket.connect();
    }

    // IMPORTANT: join room (backend must support this)
    socket.emit("join-billing-session", {
      session_id: billingSessionId,
      room: roomName,
    });

    /**
     * Backend emits:
     * emitBillingScan({ session_id, item })
     */
    const handleBillingScan = (payload: any) => {
      if (!payload) return;

      // strict backend contract
      const item = payload?.item;
      const session_id = payload?.session_id;

      // ignore wrong session (VERY IMPORTANT)
      if (session_id && session_id !== sessionRef.current) return;

      if (!item) return;

      const normalized = normalize(item);

      console.log("[BILLING SCAN RECEIVED]", normalized);

      onItemReceived(normalized);
    };

    /**
     * OPTIONAL: if backend later adds preview support
     */
    const handleBillingPreview = (payload: any) => {
      const item = payload?.item || payload;

      if (!item) return;

      const normalized = normalize(item);

      console.log("[BILLING PREVIEW RECEIVED]", normalized);

      onPreview?.(normalized);
    };

    const normalize = (rawItem: any) => ({
      id: rawItem?.id,
      item_id: rawItem?.item_id || rawItem?.id,

      code:
        rawItem?.product_code ||
        rawItem?.sku_code ||
        rawItem?.article_code ||
        rawItem?.code ||
        "",

      name:
        rawItem?.item_name ||
        rawItem?.product_name ||
        rawItem?.name ||
        "Unknown Product",

      qty: Number(rawItem?.qty || 1),

      rate: Number(rawItem?.rate || 0),
      total_amount: Number(rawItem?.total_amount || 0),

      net_weight: Number(rawItem?.net_weight || 0),

      scanned_at: rawItem?.scanned_at || new Date().toISOString(),
    });

    /**
     * ⚠️ IMPORTANT:
     * These MUST match backend emitBillingScan OR socket gateway mapping
     */
    socket.on("billing:item_scanned", handleBillingScan);
    socket.on("billing:item_preview", handleBillingPreview);

    return () => {
      socket.off("billing:item_scanned", handleBillingScan);
      socket.off("billing:item_preview", handleBillingPreview);

      socket.emit("leave-billing-session", {
        session_id: billingSessionId,
      });
    };
  }, [onItemReceived, onPreview]);

  return null;
}