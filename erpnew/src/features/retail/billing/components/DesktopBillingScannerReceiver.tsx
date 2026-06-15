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
    let billingSessionId =
      localStorage.getItem("billing_session_id");

    if (!billingSessionId) {
      billingSessionId = crypto.randomUUID();

      localStorage.setItem(
        "billing_session_id",
        billingSessionId
      );
    }

    sessionRef.current = billingSessionId;

    const roomName = `billing_session_${billingSessionId}`;

    if (!socket.connected) {
      socket.connect();
    }

    console.log(
      "[BILLING] Joining Room:",
      roomName
    );

    /**
     * BACKEND EXPECTS STRING
     */
    socket.emit(
      "join-billing-session",
      roomName
    );

    const normalize = (rawItem: any) => ({
      id: rawItem?.id,
      item_id: rawItem?.item_id || rawItem?.id,

      sku_code: rawItem?.sku_code,
      article_code: rawItem?.article_code,

      product_code:
        rawItem?.product_code ||
        rawItem?.article_code ||
        rawItem?.sku_code,

      code:
        rawItem?.product_code ||
        rawItem?.article_code ||
        rawItem?.sku_code,

      item_name:
        rawItem?.item_name ||
        rawItem?.name,

      name:
        rawItem?.item_name ||
        rawItem?.name,

      description:
        rawItem?.description,

      category:
        rawItem?.category,

      purity:
        rawItem?.purity,

      metal_type:
        rawItem?.metal_type,

      qty: Number(
        rawItem?.qty || 1
      ),

      rate: Number(
        rawItem?.rate || 0
      ),

      sale_rate: Number(
        rawItem?.sale_rate || 0
      ),

      purchase_rate: Number(
        rawItem?.purchase_rate || 0
      ),

      net_weight: Number(
        rawItem?.net_weight || 0
      ),

      gross_weight: Number(
        rawItem?.gross_weight || 0
      ),

      stone_weight: Number(
        rawItem?.stone_weight || 0
      ),

      stone_amount: Number(
        rawItem?.stone_amount || 0
      ),

      making_charge_percent: Number(
        rawItem?.making_charge_percent || 0
      ),

      making_charge_value: Number(
        rawItem?.making_charge_value || 0
      ),

      total_amount: Number(
        rawItem?.total_amount || 0
      ),

      available_qty: Number(
        rawItem?.available_qty || 0
      ),

      available_weight: Number(
        rawItem?.available_weight || 0
      ),

      unit:
        rawItem?.unit || "gm",

      current_status:
        rawItem?.current_status,

      qr_type:
        rawItem?.qr_type,

      qr_code_url:
        rawItem?.qr_code_url,

      scanned_at:
        rawItem?.scanned_at ||
        new Date().toISOString(),
    });

    const handleBillingScan = (
      payload: any
    ) => {
      try {
        console.log(
          "[SOCKET RECEIVED]",
          payload
        );

        if (!payload) return;

        const item = payload?.item;

        const sessionId =
          payload?.session_id;

        if (
          sessionId &&
          sessionId !== sessionRef.current
        ) {
          console.log(
            "[BILLING] Ignored different session:",
            sessionId
          );
          return;
        }

        if (!item) {
          console.log(
            "[BILLING] No item in payload"
          );
          return;
        }

        const normalized =
          normalize(item);

        console.log(
          "[BILLING ITEM RECEIVED]",
          normalized
        );

        onItemReceived(normalized);
      } catch (error) {
        console.error(
          "handleBillingScan error",
          error
        );
      }
    };

    const handleBillingPreview = (
      payload: any
    ) => {
      try {
        const item =
          payload?.item || payload;

        if (!item) return;

        const normalized =
          normalize(item);

        onPreview?.(normalized);
      } catch (error) {
        console.error(
          "handleBillingPreview error",
          error
        );
      }
    };

    /**
     * MUST MATCH BACKEND
     */
    socket.on(
      "billing-item-scanned",
      handleBillingScan
    );

    socket.on(
      "billing-item-preview",
      handleBillingPreview
    );

    socket.on(
      "billing-session-joined",
      (data) => {
        console.log(
          "[ROOM JOINED]",
          data
        );
      }
    );

    return () => {
      socket.off(
        "billing-item-scanned",
        handleBillingScan
      );

      socket.off(
        "billing-item-preview",
        handleBillingPreview
      );

      socket.off(
        "billing-session-joined"
      );
    };
  }, [onItemReceived, onPreview]);

  return null;
}