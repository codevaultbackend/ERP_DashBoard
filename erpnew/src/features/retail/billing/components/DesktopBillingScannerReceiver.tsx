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
  const sessionRef = useRef("");

  useEffect(() => {
    console.log("========================================");
    console.log("DESKTOP RECEIVER START");
    console.log("========================================");

    let billingSessionId =
      localStorage.getItem("billing_session_id") || "";

    if (!billingSessionId) {
      console.error(
        "billing_session_id missing. Desktop and mobile must use same session."
      );
      return;
    }

    sessionRef.current = billingSessionId;

    const room =
      `billing_session_${billingSessionId}`;

    console.log("SESSION:", billingSessionId);
    console.log("ROOM:", room);

    if (!socket.connected) {
      socket.connect();
    }

    const joinRoom = () => {
      const payload = {
        session_id: billingSessionId,
        room,
      };

      console.log("JOINING ROOM:", payload);

      socket.emit(
        "join-billing-session",
        payload
      );
    };

    const handleConnect = () => {
      console.log(
        "SOCKET CONNECTED",
        socket.id
      );

      joinRoom();
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on(
      "connect",
      handleConnect
    );

    const normalize = (
      rawItem: any
    ) => {
      if (!rawItem) return null;

      return {
        id:
          rawItem.id ??
          rawItem.item_id,

        item_id:
          rawItem.item_id ??
          rawItem.id,

        sku_code:
          rawItem.sku_code,

        article_code:
          rawItem.article_code,

        product_code:
          rawItem.product_code ||
          rawItem.article_code ||
          rawItem.sku_code,

        code:
          rawItem.product_code ||
          rawItem.article_code ||
          rawItem.sku_code,

        item_name:
          rawItem.item_name ||
          rawItem.name,

        name:
          rawItem.item_name ||
          rawItem.name,

        description:
          rawItem.description,

        category:
          rawItem.category,

        purity:
          rawItem.purity,

        metal_type:
          rawItem.metal_type,

        qty: Number(
          rawItem.qty || 1
        ),

        rate: Number(
          rawItem.rate || 0
        ),

        sale_rate: Number(
          rawItem.sale_rate || 0
        ),

        purchase_rate: Number(
          rawItem.purchase_rate || 0
        ),

        net_weight: Number(
          rawItem.net_weight || 0
        ),

        gross_weight: Number(
          rawItem.gross_weight || 0
        ),

        stone_weight: Number(
          rawItem.stone_weight || 0
        ),

        stone_amount: Number(
          rawItem.stone_amount || 0
        ),

        making_charge_percent:
          Number(
            rawItem.making_charge_percent ||
              0
          ),

        making_charge_value:
          Number(
            rawItem.making_charge_value ||
              0
          ),

        total_amount: Number(
          rawItem.total_amount || 0
        ),

        available_qty: Number(
          rawItem.available_qty || 0
        ),

        available_weight:
          Number(
            rawItem.available_weight ||
              0
          ),

        unit:
          rawItem.unit || "gm",

        current_status:
          rawItem.current_status,

        qr_type:
          rawItem.qr_type,

        qr_code_url:
          rawItem.qr_code_url,

        scanned_at:
          rawItem.scanned_at ||
          new Date().toISOString(),
      };
    };

    const extractItem = (
      payload: any
    ) => {
      return (
        payload?.data?.item ||
        payload?.item ||
        payload?.data ||
        payload
      );
    };

    const extractSession = (
      payload: any
    ) => {
      return (
        payload?.session_id ||
        payload?.data?.session_id ||
        payload?.sessionId
      );
    };

    const handlePreview = (
      payload: any
    ) => {
      console.log(
        "PREVIEW RECEIVED",
        payload
      );

      const item =
        extractItem(payload);

      const normalized =
        normalize(item);

      if (!normalized) return;

      onPreview?.(normalized);
    };

    const handleFinal = (
      payload: any
    ) => {
      console.log(
        "FINAL RECEIVED",
        payload
      );

      const sessionId =
        extractSession(payload);

      if (
        sessionId &&
        sessionRef.current &&
        sessionId !==
          sessionRef.current
      ) {
        console.warn(
          "SESSION MISMATCH"
        );

        console.warn(
          "EXPECTED:",
          sessionRef.current
        );

        console.warn(
          "RECEIVED:",
          sessionId
        );

        return;
      }

      const item =
        extractItem(payload);

      const normalized =
        normalize(item);

      if (!normalized) {
        console.error(
          "NORMALIZATION FAILED"
        );
        return;
      }

      onItemReceived(
        normalized
      );
    };

    const handleJoined = (
      data: any
    ) => {
      console.log(
        "ROOM JOINED",
        data
      );
    };

    socket.on(
      "billing:item_preview",
      handlePreview
    );

    socket.on(
      "billing:item_scanned",
      handleFinal
    );

    socket.on(
      "billing-session-joined",
      handleJoined
    );

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "billing:item_preview",
        handlePreview
      );

      socket.off(
        "billing:item_scanned",
        handleFinal
      );

      socket.off(
        "billing-session-joined",
        handleJoined
      );
    };
  }, [onItemReceived, onPreview]);

  return null;
}