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
    console.log(
      "=================================================="
    );
    console.log(
      "[DESKTOP RECEIVER INITIALIZING]"
    );
    console.log(
      "=================================================="
    );

    let billingSessionId =
      localStorage.getItem(
        "billing_session_id"
      );

    console.log(
      "[LOCAL STORAGE SESSION]",
      billingSessionId
    );

    if (!billingSessionId) {
      billingSessionId =
        crypto.randomUUID();

      localStorage.setItem(
        "billing_session_id",
        billingSessionId
      );

      console.log(
        "[NEW SESSION CREATED]",
        billingSessionId
      );
    }

    sessionRef.current =
      billingSessionId;

    const roomName =
      `billing_session_${billingSessionId}`;

    console.log(
      "[CURRENT SESSION]",
      sessionRef.current
    );

    console.log(
      "[EXPECTED ROOM]",
      roomName
    );

    if (!socket.connected) {
      console.log(
        "[SOCKET NOT CONNECTED] Calling connect()"
      );

      socket.connect();
    }

    const joinRoom = () => {
      const payload = {
        session_id:
          billingSessionId,
        room: roomName,
      };

      console.log(
        "=================================================="
      );
      console.log(
        "[JOIN ROOM REQUEST]"
      );
      console.log(payload);
      console.log(
        "Socket ID:",
        socket.id
      );
      console.log(
        "Connected:",
        socket.connected
      );
      console.log(
        "=================================================="
      );

      socket.emit(
        "join-billing-session",
        payload
      );

      console.log(
        "[JOIN EVENT SENT]"
      );
    };

    const handleConnect = () => {
      console.log(
        "=================================================="
      );
      console.log(
        "[SOCKET CONNECTED]"
      );
      console.log(
        "Socket ID:",
        socket.id
      );
      console.log(
        "Connected:",
        socket.connected
      );
      console.log(
        "=================================================="
      );

      joinRoom();
    };

    const handleConnectError = (
      err: any
    ) => {
      console.error(
        "=================================================="
      );

      console.error(
        "[SOCKET CONNECT ERROR]"
      );

      console.error(err);

      console.error(
        "=================================================="
      );
    };

    const handleDisconnect = (
      reason: string
    ) => {
      console.warn(
        "=================================================="
      );

      console.warn(
        "[SOCKET DISCONNECTED]"
      );

      console.warn(reason);

      console.warn(
        "=================================================="
      );
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    const normalize = (
      rawItem: any
    ) => {
      console.log(
        "[NORMALIZE RAW ITEM]",
        rawItem
      );

      if (!rawItem) {
        console.error(
          "[NORMALIZE FAILED] Empty item"
        );

        return null;
      }

      const normalized = {
        id: rawItem?.id,

        item_id:
          rawItem?.item_id ||
          rawItem?.id,

        sku_code:
          rawItem?.sku_code,

        article_code:
          rawItem?.article_code,

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
          rawItem?.purchase_rate ||
            0
        ),

        net_weight: Number(
          rawItem?.net_weight ||
            0
        ),

        gross_weight: Number(
          rawItem?.gross_weight ||
            0
        ),

        stone_weight: Number(
          rawItem?.stone_weight ||
            0
        ),

        stone_amount: Number(
          rawItem?.stone_amount ||
            0
        ),

        making_charge_percent:
          Number(
            rawItem?.making_charge_percent ||
              0
          ),

        making_charge_value:
          Number(
            rawItem?.making_charge_value ||
              0
          ),

        total_amount: Number(
          rawItem?.total_amount ||
            0
        ),

        available_qty: Number(
          rawItem?.available_qty ||
            0
        ),

        available_weight:
          Number(
            rawItem?.available_weight ||
              0
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
      };

      console.log(
        "[NORMALIZED ITEM]",
        normalized
      );

      return normalized;
    };

    const handleBillingScan = (
      payload: any
    ) => {
      try {
        console.log(
          "=================================================="
        );

        console.log(
          "[billing-item-scanned RECEIVED]"
        );

        console.log(
          "Payload:",
          payload
        );

        console.log(
          "Current Session:",
          sessionRef.current
        );

        console.log(
          "=================================================="
        );

        if (!payload) {
          console.error(
            "[EMPTY PAYLOAD]"
          );

          return;
        }

        const sessionId =
          payload?.session_id ||
          payload?.sessionId;

        console.log(
          "[PAYLOAD SESSION]",
          sessionId
        );

        if (
          sessionId &&
          sessionRef.current &&
          sessionId !==
            sessionRef.current
        ) {
          console.error(
            "[SESSION MISMATCH]"
          );

          console.error(
            "Received:",
            sessionId
          );

          console.error(
            "Current:",
            sessionRef.current
          );

          return;
        }

        const item =
          payload?.item ||
          payload;

        console.log(
          "[RAW ITEM]",
          item
        );

        const normalized =
          normalize(item);

        if (!normalized) {
          console.error(
            "[NORMALIZATION FAILED]"
          );

          return;
        }

        console.log(
          "[CALLING onItemReceived]"
        );

        onItemReceived(
          normalized
        );

        console.log(
          "[onItemReceived SUCCESS]"
        );
      } catch (error) {
        console.error(
          "[handleBillingScan ERROR]"
        );

        console.error(error);
      }
    };

    const handleBillingPreview = (
      payload: any
    ) => {
      try {
        console.log(
          "[billing-item-preview RECEIVED]",
          payload
        );

        const item =
          payload?.item ||
          payload;

        const normalized =
          normalize(item);

        if (!normalized) {
          return;
        }

        console.log(
          "[CALLING onPreview]"
        );

        onPreview?.(
          normalized
        );
      } catch (error) {
        console.error(
          "[handleBillingPreview ERROR]"
        );

        console.error(error);
      }
    };

    const handleRoomJoined = (
      data: any
    ) => {
      console.log(
        "=================================================="
      );

      console.log(
        "[ROOM JOINED SUCCESS]"
      );

      console.log(data);

      console.log(
        "=================================================="
      );
    };

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
      handleRoomJoined
    );

    socket.onAny(
      (event, ...args) => {
        console.log(
          "=================================================="
        );

        console.log(
          "[SOCKET EVENT]"
        );

        console.log(
          "Event:",
          event
        );

        console.log(
          "Args:",
          args
        );

        console.log(
          "=================================================="
        );
      }
    );

    return () => {
      console.log(
        "[DESKTOP RECEIVER CLEANUP]"
      );

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "billing-item-scanned",
        handleBillingScan
      );

      socket.off(
        "billing-item-preview",
        handleBillingPreview
      );

      socket.off(
        "billing-session-joined",
        handleRoomJoined
      );
    };
  }, [onItemReceived, onPreview]);

  return null;
}