"use client";

import {
  createClient,
  type RealtimeChannel,
} from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const channelMap = new Map<
  string,
  RealtimeChannel
>();

const subscribedMap = new Map<
  string,
  boolean
>();

function safeWindow() {
  return typeof window !== "undefined";
}

/**
 * SAFE STORE CODE
 */
export function getStoreCode() {
  if (!safeWindow()) {
    return null;
  }

  const storeCode =
    localStorage.getItem("store_code") ||
    localStorage.getItem("storeCode") ||
    sessionStorage.getItem("store_code") ||
    sessionStorage.getItem("storeCode") ||
    "";

  const clean = String(storeCode).trim();

  if (!clean) {
    return null;
  }

  return clean;
}

/**
 * SAFE CHANNEL NAME
 */
export function getBillingChannelName() {
  const storeCode = getStoreCode();

  /**
   * DO NOT THROW
   */
  if (!storeCode) {
    return null;
  }

  return `billing_store_${storeCode}`;
}

/**
 * SINGLETON CHANNEL
 */
export function getBillingChannel() {
  const channelName =
    getBillingChannelName();

  /**
   * store not ready yet
   */
  if (!channelName) {
    return null;
  }

  const existing =
    channelMap.get(channelName);

  /**
   * prevent duplicate joins
   */
  if (existing) {
    return existing;
  }

  const channel = supabase.channel(
    channelName,
    {
      config: {
        broadcast: {
          self: true,
          ack: true,
        },
      },
    }
  );

  /**
   * subscribe ONLY once
   */
  if (!subscribedMap.get(channelName)) {
    subscribedMap.set(channelName, true);

    channel.subscribe((status) => {
      console.log(
        "[Billing Realtime]",
        status
      );
    });
  }

  channelMap.set(
    channelName,
    channel
  );

  return channel;
}

/**
 * CLEANUP
 */
export async function destroyBillingChannel() {
  const channelName =
    getBillingChannelName();

  if (!channelName) {
    return;
  }

  const channel =
    channelMap.get(channelName);

  if (!channel) {
    return;
  }

  try {
    await supabase.removeChannel(
      channel
    );
  } catch (error) {
    console.error(
      "removeChannel failed",
      error
    );
  }

  channelMap.delete(channelName);

  subscribedMap.delete(channelName);
}

/**
 * SEND ITEM
 */
export async function sendScannedItemToDesktop(
  payload: any
) {
  const channel =
    getBillingChannel();

  if (!channel) {
    throw new Error(
      "Store not initialized"
    );
  }

  return channel.send({
    type: "broadcast",

    event: "billing:item_scanned",

    payload: {
      ...payload,

      sent_at:
        new Date().toISOString(),

      event_id:
        crypto.randomUUID(),
    },
  });
}

/**
 * SUBSCRIBE ITEMS
 */
export function subscribeBillingItems({
  onItem,
}: {
  onItem: (
    payload: any
  ) => void;
}) {
  const channel =
    getBillingChannel();

  /**
   * store not ready yet
   */
  if (!channel) {
    console.warn(
      "Billing realtime skipped: store_code missing"
    );

    return null;
  }

  channel.on(
    "broadcast",
    {
      event:
        "billing:item_scanned",
    },
    ({ payload }) => {
      onItem(payload);
    }
  );

  return channel;
}