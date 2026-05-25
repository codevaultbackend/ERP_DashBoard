"use client";

import { useEffect, useRef } from "react";

import { socket } from "../socket";

type Props = {
  onItemReceived: (item: any) => void;
};

export default function DesktopBillingScannerReceiver({
  onItemReceived,
}: Props) {

  const mountedRef = useRef(false);

  const joinedRef = useRef(false);

  useEffect(() => {

    /**
     * prevent duplicate strict mode mounts
     */
    if (mountedRef.current) {
      return;
    }

    mountedRef.current = true;

    /**
     * IMPORTANT
     * persistent billing session
     */
    let billingSessionId =
      localStorage.getItem(
        "billing_session_id"
      );

    if (!billingSessionId) {

      billingSessionId =
        crypto.randomUUID();

      localStorage.setItem(
        "billing_session_id",
        billingSessionId
      );
    }

    /**
     * connect socket
     */
    if (!socket.connected) {
      socket.connect();
    }

    /**
     * join billing room once
     */
    if (!joinedRef.current) {

      joinedRef.current = true;

      socket.emit(
        "join-billing-session",
        billingSessionId
      );

      console.log(
        "Joined billing session:",
        billingSessionId
      );
    }

    /**
     * socket connected
     */
    const handleConnect = () => {

      console.log(
        "Socket connected:",
        socket.id
      );

      /**
       * reconnect join
       */
      socket.emit(
        "join-billing-session",
        billingSessionId
      );
    };

    /**
     * socket disconnected
     */
    const handleDisconnect = (
      reason: string
    ) => {

      console.log(
        "Socket disconnected:",
        reason
      );
    };

    /**
     * realtime scanned item
     */
    const handleScannedItem = (
      payload: any
    ) => {

      console.log(
        "Realtime billing item received:",
        payload
      );

      if (!payload) {
        return;
      }

      /**
       * backend format:
       * {
       *   success,
       *   type,
       *   data,
       *   sent_at
       * }
       */
      const item =
        payload?.data || payload;

      if (!item) {
        return;
      }

      onItemReceived(item);
    };

    /**
     * room joined confirmation
     */
    const handleRoomJoined = (
      data: any
    ) => {

      console.log(
        "Billing room joined:",
        data
      );
    };

    /**
     * listeners
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
      "billing:item_scanned",
      handleScannedItem
    );

    socket.on(
      "billing-session-joined",
      handleRoomJoined
    );

    /**
     * cleanup
     */
    return () => {

      mountedRef.current = false;

      joinedRef.current = false;

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "billing:item_scanned",
        handleScannedItem
      );

      socket.off(
        "billing-session-joined",
        handleRoomJoined
      );
    };

  }, [onItemReceived]);

  return null;
}