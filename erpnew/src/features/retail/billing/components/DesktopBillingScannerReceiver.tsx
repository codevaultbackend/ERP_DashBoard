"use client";

import { useEffect } from "react";
import { socket } from "../socket";

type Props = {
  onItemReceived: (item: any) => void;
  onPreview?: (item: any) => void;
};

export default function DesktopBillingScannerReceiver({
  onItemReceived,
  onPreview,
}: Props) {
  useEffect(() => {
    let billingSessionId =
      localStorage.getItem("billing_session_id");

    if (!billingSessionId) {
      billingSessionId = crypto.randomUUID();
      localStorage.setItem("billing_session_id", billingSessionId);
    }

    const roomName = `billing_session_${billingSessionId}`;

    if (!socket.connected) socket.connect();

    socket.emit("join-billing-session", roomName);

    const handlePreview = (payload: any) => {
      const rawItem = payload?.data?.item || payload?.data;

      if (!rawItem) return;

      const normalized = normalize(rawItem);

      console.log("PREVIEW RECEIVED:", normalized);

      onPreview?.(normalized);
    };

    const handleFinal = (payload: any) => {
      const rawItem = payload?.data?.item || payload?.data;

      if (!rawItem) return;

      const normalized = normalize(rawItem);

      console.log("FINAL RECEIVED:", normalized);

      onItemReceived(normalized);
    };

    const normalize = (rawItem: any) => ({
      id: rawItem?.id,
      item_id: rawItem?.item_id || rawItem?.id,
      code:
        rawItem?.product_code ||
        rawItem?.item_code ||
        rawItem?.code ||
        rawItem?.qr_code ||
        "",
      name:
        rawItem?.product_name ||
        rawItem?.item_name ||
        rawItem?.name ||
        "Unknown Product",
      qty: Number(rawItem?.qty || 1),
      scanned_at: new Date().toISOString(),
    });

    socket.on("billing:item_preview", handlePreview);
    socket.on("billing:item_scanned", handleFinal);

    return () => {
      socket.off("billing:item_preview", handlePreview);
      socket.off("billing:item_scanned", handleFinal);
    };
  }, [onItemReceived, onPreview]);

  return null;
}