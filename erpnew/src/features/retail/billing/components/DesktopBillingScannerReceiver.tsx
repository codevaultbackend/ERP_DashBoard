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
    console.log("========================================");
    console.log("DESKTOP BILLING RECEIVER STARTED");
    console.log("========================================");

    const billingSessionId =
      localStorage.getItem("billing_session_id") || "";

    if (!billingSessionId) {
      console.error("❌ Missing billing_session_id");
      return;
    }

    sessionRef.current = billingSessionId;

    const room = `billing_session_${billingSessionId}`;

    console.log("📌 SESSION:", billingSessionId);
    console.log("📌 ROOM:", room);

    if (!socket.connected) {
      socket.connect();
    }

    const joinRoom = () => {
      console.log("📡 JOINING ROOM:", room);

      socket.emit("join-billing-session", {
        session_id: billingSessionId,
        room,
      });
    };

    const handleConnect = () => {
      console.log("🟢 SOCKET CONNECTED:", socket.id);
      joinRoom();
    };

    socket.on("connect", handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    /**
     * 🔥 UNIVERSAL PAYLOAD HANDLER
     * (works even if backend event names change)
     */
    const handleIncoming = (payload: any) => {
      console.log("📥 RAW PAYLOAD:", payload);

      const sessionId =
        payload?.session_id ||
        payload?.sessionId ||
        payload?.data?.session_id;

      // ⚠️ Only block if BOTH exist (safe check)
      if (
        sessionId &&
        sessionRef.current &&
        sessionId !== sessionRef.current
      ) {
        console.warn("⚠️ SESSION MISMATCH - IGNORED");
        return;
      }

      const item =
        payload?.item ||
        payload?.data?.item ||
        payload?.data ||
        payload;

      if (!item) {
        console.error("❌ No item in payload");
        return;
      }

      const normalized = normalize(item);

      // preview vs final detection
      const isPreview = payload?.type === "preview";

      if (isPreview) {
        console.log("👁 PREVIEW ITEM");
        onPreview?.(normalized);
      } else {
        console.log("✅ FINAL ITEM");
        onItemReceived(normalized);
      }
    };

    /**
     * 🔥 MULTI-EVENT SUPPORT (IMPORTANT FIX)
     * backend may emit ANY of these
     */
    socket.on("billing:item_scanned", handleIncoming);
    socket.on("billing:item_preview", handleIncoming);
    socket.on("billing-scan", handleIncoming);
    socket.on("billing-live", handleIncoming);
    socket.on("billing-session-data", handleIncoming);

    socket.on("billing-session-joined", (data) => {
      console.log("📡 ROOM JOINED:", data);
    });

    const normalize = (rawItem: any) => {
      if (!rawItem) return null;

      return {
        id: rawItem.id ?? rawItem.item_id,
        item_id: rawItem.item_id ?? rawItem.id,

        sku_code: rawItem.sku_code,
        article_code: rawItem.article_code,

        product_code:
          rawItem.product_code ||
          rawItem.article_code ||
          rawItem.sku_code,

        item_name: rawItem.item_name || rawItem.name,
        description: rawItem.description,

        category: rawItem.category,
        purity: rawItem.purity,
        metal_type: rawItem.metal_type,

        qty: Number(rawItem.qty || 1),

        rate: Number(rawItem.rate || 0),
        sale_rate: Number(rawItem.sale_rate || 0),

        net_weight: Number(rawItem.net_weight || 0),
        gross_weight: Number(rawItem.gross_weight || 0),

        stone_weight: Number(rawItem.stone_weight || 0),
        stone_amount: Number(rawItem.stone_amount || 0),

        making_charge_percent: Number(
          rawItem.making_charge_percent || 0
        ),

        making_charge_value: Number(
          rawItem.making_charge_value || 0
        ),

        total_amount: Number(rawItem.total_amount || 0),

        available_qty: Number(rawItem.available_qty || 0),
        available_weight: Number(rawItem.available_weight || 0),

        unit: rawItem.unit || "gm",
        current_status: rawItem.current_status,

        qr_type: rawItem.qr_type,
        qr_code_url: rawItem.qr_code_url,

        scanned_at:
          rawItem.scanned_at || new Date().toISOString(),
      };
    };

    return () => {
      socket.off("connect", handleConnect);

      socket.off("billing:item_scanned", handleIncoming);
      socket.off("billing:item_preview", handleIncoming);
      socket.off("billing-scan", handleIncoming);
      socket.off("billing-live", handleIncoming);
      socket.off("billing-session-data", handleIncoming);
    };
  }, [onItemReceived, onPreview]);

  return null;
}