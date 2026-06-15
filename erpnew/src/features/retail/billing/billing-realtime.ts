"use client";

import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import { socket } from "./socket";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const channelMap = new Map<string, RealtimeChannel>();
const subscribedMap = new Map<string, boolean>();

function safeWindow() {
  return typeof window !== "undefined";
}

/**
 * STORE CODE
 */
export function getStoreCode() {
  if (!safeWindow()) return null;

  const storeCode =
    localStorage.getItem("store_code") ||
    localStorage.getItem("storeCode") ||
    sessionStorage.getItem("store_code") ||
    sessionStorage.getItem("storeCode") ||
    "";

  const clean = String(storeCode).trim();
  return clean || null;
}

/**
 * CHANNEL NAME
 */
export function getBillingChannelName() {
  const storeCode = getStoreCode();
  if (!storeCode) return null;

  return `billing_store_${storeCode}`;
}

/**
 * CHANNEL (SUPABASE)
 */
export function getBillingChannel() {
  const channelName = getBillingChannelName();
  if (!channelName) return null;

  const existing = channelMap.get(channelName);
  if (existing) return existing;

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: true, ack: true },
    },
  });

  if (!subscribedMap.get(channelName)) {
    subscribedMap.set(channelName, true);

    channel.subscribe((status) => {
      console.log("[Billing Realtime]", status);
    });
  }

  channelMap.set(channelName, channel);
  return channel;
}

/**
 * CLEANUP
 */
export async function destroyBillingChannel() {
  const channelName = getBillingChannelName();
  if (!channelName) return;

  const channel = channelMap.get(channelName);
  if (!channel) return;

  await supabase.removeChannel(channel);

  channelMap.delete(channelName);
  subscribedMap.delete(channelName);
}

/**
 * SOCKET CONNECT WAIT
 */
async function ensureSocketConnected() {
  if (socket.connected) return;

  socket.connect();

  await new Promise<void>((resolve) => {
    socket.once("connect", () => resolve());
  });
}

/**
 * 🟡 STEP 1: PREVIEW (NEW - FIX FOR YOUR ISSUE)
 */
export async function sendPreviewToDesktop(payload: any) {
  await ensureSocketConnected();

  const billingSessionId =
    localStorage.getItem("billing_session_id");

  if (!billingSessionId) {
    throw new Error("Billing session missing");
  }

  const room = `billing_session_${billingSessionId}`;

  socket.emit("billing:item_preview", {
    room,
    data: payload,
    sent_at: new Date().toISOString(),
    event_id: crypto.randomUUID(),
  });

  console.log("PREVIEW SENT:", payload);
}

/**
 * 🟢 STEP 2: FINAL SEND
 */
export async function sendScannedItemToDesktop(payload: any) {
  await ensureSocketConnected();

  const billingSessionId =
    localStorage.getItem("billing_session_id");

  if (!billingSessionId) {
    throw new Error("Billing session missing");
  }

  const room = `billing_session_${billingSessionId}`;

  socket.emit("billing:item_scanned", {
    room,
    data: payload,
    sent_at: new Date().toISOString(),
    event_id: crypto.randomUUID(),
  });

  console.log("FINAL ITEM SENT:", payload);
}

/**
 * SUBSCRIBE
 */
export function subscribeBillingItems({
  onItem,
}: {
  onItem: (payload: any) => void;
}) {
  const channel = getBillingChannel();
  if (!channel) return null;

  channel.on(
    "broadcast",
    { event: "billing:item_scanned" },
    ({ payload }) => {
      onItem(payload);
    }
  );

  return channel;
}