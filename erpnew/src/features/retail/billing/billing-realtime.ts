"use client";

import {
  createClient,
  type RealtimeChannel,
} from "@supabase/supabase-js";

/* =========================================================
   SUPABASE
========================================================= */

const supabase =
  createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

/* =========================================================
   CHANNEL CACHE
========================================================= */

const channelMap =
  new Map<
    string,
    RealtimeChannel
  >();

/* =========================================================
   SESSION ID
========================================================= */

export function createBillingSessionId() {

  try {

    return crypto.randomUUID();

  } catch {

    return `billing_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}

/* =========================================================
   CHANNEL NAME
========================================================= */

export function getBillingScannerChannelName(
  sessionId: string
) {

  return `billing_scanner_${sessionId}`;
}

/* =========================================================
   GET OR CREATE CHANNEL
========================================================= */

export function getOrCreateBillingChannel(
  sessionId: string
) {

  if (!sessionId) {
    throw new Error(
      "sessionId missing"
    );
  }

  const existing =
    channelMap.get(
      sessionId
    );

  if (existing) {
    return existing;
  }

  const channel =
    supabase.channel(
      getBillingScannerChannelName(
        sessionId
      ),
      {
        config: {
          broadcast: {
            self: true,
            ack: true,
          },
        },
      }
    );

  channel.subscribe(
    (status) => {
      console.log(
        "Billing realtime:",
        status
      );
    }
  );

  channelMap.set(
    sessionId,
    channel
  );

  return channel;
}

/* =========================================================
   DESTROY CHANNEL
========================================================= */

export async function destroyBillingChannel(
  sessionId: string
) {

  const channel =
    channelMap.get(
      sessionId
    );

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

  channelMap.delete(
    sessionId
  );
}

/* =========================================================
   SEND ITEM
========================================================= */

export async function sendScannedItemToDesktop({
  sessionId,
  item,
}: {
  sessionId: string;

  item: any;
}) {

  const channel =
    getOrCreateBillingChannel(
      sessionId
    );

  const payload = {
    event_id:
      createBillingSessionId(),

    session_id:
      sessionId,

    sent_at:
      new Date().toISOString(),

    item,
  };

  const response =
    await channel.send({
      type: "broadcast",

      event:
        "billing:item_scanned",

      payload,
    });

  return response;
}

/* =========================================================
   SUBSCRIBE ITEMS
========================================================= */

export function subscribeBillingItems({
  sessionId,
  onItem,
}: {
  sessionId: string;

  onItem: (
    payload: any
  ) => void;
}) {

  const channel =
    getOrCreateBillingChannel(
      sessionId
    );

  /**
   * Remove old listeners first
   * prevents duplicate events
   */
  channel.unsubscribe();

  channel.subscribe();

  channel.on(
    "broadcast",
    {
      event:
        "billing:item_scanned",
    },
    ({ payload }) => {

      if (!payload) {
        return;
      }

      onItem(payload);
    }
  );

  return {
    unsubscribe: async () => {

      try {

        await destroyBillingChannel(
          sessionId
        );

      } catch (error) {

        console.error(
          "unsubscribe failed",
          error
        );
      }
    },
  };
}