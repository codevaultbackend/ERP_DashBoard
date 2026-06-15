"use client";

import { useEffect } from "react";
import { socket } from "../socket";

type Props = {
  onItemReceived: (item: any) => void;
};

export default function DesktopBillingScannerReceiver({
  onItemReceived,
}: Props) {
  useEffect(() => {
    /**
     * SESSION
     */
    let billingSessionId =
      localStorage.getItem("billing_session_id");

    if (!billingSessionId) {
      billingSessionId = crypto.randomUUID();

      localStorage.setItem(
        "billing_session_id",
        billingSessionId
      );
    }

    /**
     * ROOM
     */
    const roomName =
      `billing_session_${billingSessionId}`;

    const storeCode =
      localStorage.getItem("store_code");

    const organizationId =
      localStorage.getItem("organization_id");

    /**
     * CONNECT
     */
    if (!socket.connected) {
      socket.connect();
    }

    /**
     * JOIN ALL ROOMS
     */
    const joinRooms = () => {
      socket.emit(
        "join-billing-session",
        roomName
      );

      if (storeCode) {
        socket.emit(
          "join-billing-store",
          storeCode
        );
      }

      if (organizationId) {
        socket.emit(
          "join-billing-org",
          organizationId
        );
      }

      console.log(
        "[Desktop] Joined:",
        roomName
      );
    };

    joinRooms();

    /**
     * CONNECTED
     */
    const handleConnect = () => {
      console.log(
        "[Desktop] Connected:",
        socket.id
      );

      joinRooms();
    };

    /**
     * DISCONNECTED
     */
    const handleDisconnect = (
      reason: string
    ) => {
      console.log(
        "[Desktop] Disconnected:",
        reason
      );
    };

    /**
     * ITEM RECEIVED
     */
    const handleScannedItem = (
      payload: any
    ) => {
      console.log(
        "[Desktop] billing-item-scanned",
        payload
      );

      /**
       * Mobile sends:
       * {
       *   session_id,
       *   store_code,
       *   organization_id,
       *   item
       * }
       */

      const rawItem =
        payload?.item ||
        payload?.data?.item ||
        payload?.data ||
        payload;

      if (!rawItem) {
        console.error(
          "[Desktop] No item received"
        );
        return;
      }

      const normalizedItem = {
        id: rawItem?.id,

        item_id:
          rawItem?.item_id ||
          rawItem?.id,

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

        qty: Number(
          rawItem?.qty || 1
        ),

        purity:
          rawItem?.purity || "",

        gross_weight: Number(
          rawItem?.gross_weight ||
            rawItem?.grossWeight ||
            0
        ),

        net_weight: Number(
          rawItem?.net_weight ||
            rawItem?.netWeight ||
            0
        ),

        weight: Number(
          rawItem?.weight ||
            rawItem?.net_weight ||
            0
        ),

        rate: Number(
          rawItem?.rate || 0
        ),

        making_charge_percent: Number(
          rawItem?.making_charge_percent ||
            rawItem?.makingChargePercent ||
            0
        ),

        makingCharges: Number(
          rawItem?.makingCharges ||
            rawItem?.making_charges ||
            0
        ),

        metalValue: Number(
          rawItem?.metalValue ||
            rawItem?.metal_value ||
            0
        ),

        category:
          rawItem?.category || "",

        unit:
          rawItem?.unit || "g",

        scanned_at:
          new Date().toISOString(),
      };

      if (!normalizedItem.code) {
        console.error(
          "[Desktop] Invalid item"
        );
        return;
      }

      console.log(
        "[Desktop] Item received",
        normalizedItem
      );

      onItemReceived(
        normalizedItem
      );
    };

    /**
     * ROOM JOIN CONFIRMATION
     */
    const handleRoomJoined = (
      data: any
    ) => {
      console.log(
        "[Desktop] Room joined",
        data
      );
    };

    /**
     * DEBUG
     */
    socket.onAny(
      (event, data) => {
        console.log(
          "[SOCKET]",
          event,
          data
        );
      }
    );

    /**
     * EVENTS
     */
    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "billing-item-scanned",
      handleScannedItem
    );

    socket.on(
      "billing-session-joined",
      handleRoomJoined
    );

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "billing-item-scanned",
        handleScannedItem
      );

      socket.off(
        "billing-session-joined",
        handleRoomJoined
      );

      socket.offAny();
    };
  }, [onItemReceived]);

  return null;
}