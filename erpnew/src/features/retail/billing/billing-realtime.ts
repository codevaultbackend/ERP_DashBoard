"use client";

import { socket } from "./socket";

function safeWindow() {
  return typeof window !== "undefined";
}

/**
 * BILLING SESSION
 */
export function getBillingSessionId() {
  if (!safeWindow()) {
    return null;
  }

  const sessionId =
    localStorage.getItem("billing_session_id") ||
    sessionStorage.getItem("billing_session_id") ||
    "";

  const clean = String(sessionId).trim();

  return clean || null;
}

/**
 * SEND ITEM TO DESKTOP
 */
export async function sendScannedItemToDesktop(
  payload: any
) {
  const billingSessionId =
    getBillingSessionId();

  if (!billingSessionId) {
    throw new Error(
      "Billing session missing"
    );
  }

  const roomName =
    `billing_session_${billingSessionId}`;

  /**
   * CONNECT IF NEEDED
   */
  if (!socket.connected) {
    socket.connect();
  }

  /**
   * SEND TO BACKEND
   */
  socket.emit(
    "billing:item_scanned",
    {
      room: roomName,

      data: payload,

      sent_at:
        new Date().toISOString(),

      event_id:
        crypto.randomUUID(),
    }
  );

  console.log(
    "[Billing] Item sent:",
    payload
  );
}

/**
 * OPTIONAL
 * LISTEN DIRECTLY USING SOCKET
 */
export function subscribeBillingItems({
  onItem,
}: {
  onItem: (
    payload: any
  ) => void;
}) {
  const handler = (
    payload: any
  ) => {
    onItem(payload);
  };

  socket.on(
    "billing-item-scanned",
    handler
  );

  return () => {
    socket.off(
      "billing-item-scanned",
      handler
    );
  };
}