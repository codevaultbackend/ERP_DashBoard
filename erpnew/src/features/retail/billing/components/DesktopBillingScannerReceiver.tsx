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
  const handledRef = useRef<Set<string>>(new Set());

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

        net_weight: Number(rawItem.net_weight || 0),
        gross_weight: Number(rawItem.gross_weight || 0),

        stone_weight: Number(rawItem.stone_weight || 0),
        stone_amount: Number(rawItem.stone_amount || 0),

        making_charge_percent: Number(rawItem.making_charge_percent || 0),
        making_charge_value: Number(rawItem.making_charge_value || 0),

        total_amount: Number(rawItem.total_amount || 0),

        available_qty: Number(rawItem.available_qty || 0),
        available_weight: Number(rawItem.available_weight || 0),

        unit: rawItem.unit || "gm",
        current_status: rawItem.current_status,

        qr_type: rawItem.qr_type,
        qr_code_url: rawItem.qr_code_url,

        scanned_at: rawItem.scanned_at || new Date().toISOString(),
      };
    };

    const extractItem = (payload: any) => {
      return payload?.item || payload?.data?.item || payload?.data || payload;
    };

    const extractSession = (payload: any) => {
      return payload?.session_id || payload?.sessionId || payload?.data?.session_id;
    };

    const handleIncoming = (payload: any) => {
      console.log("📥 RAW PAYLOAD:", payload);

      const sessionId = extractSession(payload);

      if (
        sessionId &&
        sessionRef.current &&
        sessionId !== sessionRef.current
      ) {
        console.warn("⚠️ SESSION MISMATCH IGNORED");
        return;
      }

      const item = extractItem(payload);
      const normalized = normalize(item);

      if (!normalized) {
        console.error("❌ Invalid item payload");
        return;
      }

      // prevent duplicates
      if (normalized.id && handledRef.current.has(String(normalized.id))) {
        console.warn("🔁 DUPLICATE IGNORED:", normalized.id);
        return;
      }

      if (normalized.id) {
        handledRef.current.add(String(normalized.id));
      }

      const isPreview = payload?.type === "preview";

      if (isPreview) {
        console.log("👁 PREVIEW ITEM");
        onPreview?.(normalized);
      } else {
        console.log("✅ FINAL ITEM");
        onItemReceived(normalized);
      }
    };

    const handleConnect = () => {
      console.log("🟢 SOCKET CONNECTED:", socket.id);

      socket.emit("join-billing-session", {
        session_id: billingSessionId,
        room,
      });
    };

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", handleConnect);

    // 🔥 IMPORTANT: unified events (covers backend inconsistency)
    const events = [
      "billing:item_scanned",
      "billing:item_preview",
      "billing-scan",
      "billing-live",
      "billing-session-data",
    ];

    events.forEach((event) => {
      socket.on(event, handleIncoming);
    });

    socket.on("billing-session-joined", (data) => {
      console.log("📡 ROOM JOINED:", data);
    });

    return () => {
      socket.off("connect", handleConnect);

      events.forEach((event) => {
        socket.off(event, handleIncoming);
      });
    };
  }, [onItemReceived, onPreview]);

  return null;
}