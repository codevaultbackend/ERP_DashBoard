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

    const joinRoom = () => {
      console.log(
        "[ROOM JOIN REQUEST]",
        {
          room: roomName,
          session: billingSessionId,
        }
      );

      socket.emit(
        "join-billing-session",
        roomName
      );

      console.log(
        "[ROOM JOIN SENT]"
      );
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", () => {
      console.log(
        "[SOCKET CONNECTED]",
        socket.id
      );

      joinRoom();
    });

    socket.on("connect", () => {
      console.log(
        "[SOCKET CONNECTED]",
        socket.id
      );
    });

    socket.on(
      "connect_error",
      (err) => {
        console.error(
          "[SOCKET ERROR]",
          err
        );
      }
    );

    socket.on(
      "disconnect",
      (reason) => {
        console.warn(
          "[SOCKET DISCONNECTED]",
          reason
        );
      }
    );

    console.log(
      "[ROOM JOIN REQUEST]",
      {
        room: roomName,
        session:
          billingSessionId,
      }
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
        console.log(
          "[SCAN PAYLOAD]",
          payload
        );

        console.log(
          "[CURRENT SESSION]",
          sessionRef.current
        );

        if (!payload) return;

        const item = payload?.item;

        const sessionId =
          payload?.session_id;

        if (
          sessionId &&
          sessionId !== sessionRef.current
        ) {
          console.error(
            "[SESSION MISMATCH]",
            {
              received: sessionId,
              current:
                sessionRef.current,
            }
          );
          return;
        }

        if (!item) {
          console.error(
            "[INVALID PAYLOAD]",
            payload
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
        console.log(
          "[ADDING ITEM TO CART]",
          normalized
        );
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
    socket.onAny(
      (event, ...args) => {
        console.log(
          "[SOCKET EVENT]",
          event,
          args
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