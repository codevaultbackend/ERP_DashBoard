"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseRealtime } from "@/lib/supabase-realtime";
import type {
  LiveScannedBillingItem,
  LiveScannerPayload,
} from "./live-scanner-types";

export function createBillingSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `billing-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getBillingScannerChannelName(sessionId: string) {
  return `billing-scanner-${sessionId}`;
}

export function subscribeBillingScannerSession(params: {
  sessionId: string;
  onItemScanned: (item: LiveScannedBillingItem) => void;
  onStatus?: (status: string) => void;
  onError?: (error: string) => void;
}) {
  const { sessionId, onItemScanned, onStatus, onError } = params;

  const channel = supabaseRealtime.channel(
    getBillingScannerChannelName(sessionId),
    {
      config: {
        broadcast: {
          self: false,
        },
      },
    }
  );

  channel.on(
    "broadcast",
    {
      event: "mobile_scanned_item",
    },
    (event) => {
      const payload = event.payload as LiveScannerPayload;

      if (!payload?.session_id || payload.session_id !== sessionId) return;
      if (!payload.item) return;

      onItemScanned(payload.item);
    }
  );

  channel.subscribe((status) => {
    onStatus?.(status);

    if (status === "CHANNEL_ERROR") {
      onError?.("Realtime channel connection failed");
    }
  });

  return channel;
}

export async function sendScannedItemToDesktop(params: {
  sessionId: string;
  item: LiveScannedBillingItem;
  channel?: RealtimeChannel;
}) {
  const channel =
    params.channel ||
    supabaseRealtime.channel(getBillingScannerChannelName(params.sessionId));

  const payload: LiveScannerPayload = {
    session_id: params.sessionId,
    item: params.item,
  };

  return channel.send({
    type: "broadcast",
    event: "mobile_scanned_item",
    payload,
  });
}

export async function removeBillingScannerChannel(channel: RealtimeChannel) {
  await supabaseRealtime.removeChannel(channel);
}