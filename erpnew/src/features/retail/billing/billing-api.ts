import axios from "axios";
import type { LiveScannedBillingItem } from "./live-scanner-types";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://erp-for-local.onrender.com";

function getAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

function getStoreCode() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("store_code") ||
    localStorage.getItem("storeCode") ||
    ""
  );
}

async function parseApiResponse(
  res: Response
) {
  const json = await res
    .json()
    .catch(() => null);

  if (
    !res.ok ||
    json?.success === false
  ) {
    throw new Error(
      json?.message ||
      json?.error ||
      "Something went wrong"
    );
  }

  return json;
}

/* =========================================================
   SCAN ITEM
=======================================================

/**
 * Get or create stable billing session
 * (VERY IMPORTANT for realtime sync)
 */
function getBillingSessionId() {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("billing_session_id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("billing_session_id", sessionId);
  }

  return sessionId;
}

/**
 * SCAN BILLING ITEM (REALTIME SAFE VERSION)
 */
export async function scanBillingItemByCode(
  code: string,
  sessionId?: string
): Promise<LiveScannedBillingItem> {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Auth token missing");
    }

    // 🔥 ALWAYS ensure session exists
    const finalSessionId = sessionId || getBillingSessionId();

    const url = `${API_BASE_URL}/bill/billing/scan-item/${encodeURIComponent(
      code
    )}`;

    console.log("📡 Scanning item:", {
      url,
      sessionId: finalSessionId,
      code,
    });

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-billing-session-id": finalSessionId,
      },
    });

    console.log("📦 Scan response:", response.data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Scan failed");
    }

    return response.data.data;
  } catch (error: any) {
    console.error("❌ Scan Billing Error:", {
      message: error?.message,
      response: error?.response?.data,
    });

    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Scan failed"
    );
  }
}

/* =========================================================
   CREATE BILL TYPES
========================================================= */

export type CreateBillCustomerPayload =
  {
    name?: string | null;

    phone?: string | null;

    pan_card_number?:
    | string
    | null;

    pincode?: string | null;

    address?: string | null;
  };

export type CreateBillItemPayload = {
    item_id:number|string;

    product_code?:string|null;

    description?:string|null;

    qty:number;

    net_weight:number;

    rate:number;

    making_charge_percent:number;

    making_charge_deduction?:number;

    unit?:string|null;
}

export type CreateBillPayload =
  {
    store_code?:
    | string
    | null;

    customer?:
    | CreateBillCustomerPayload
    | null;

    items: CreateBillItemPayload[];

    paid_amount?: number;

    notes?: string | null;
  };

/* =========================================================
   CREATE BILL
========================================================= */

export async function createBillingInvoice(
  payload: CreateBillPayload
) {

  const token =
    getAuthToken();

  if (!token) {
    throw new Error(
      "Login token missing"
    );
  }

  const storeCode =
    getStoreCode();

  const response =
    await fetch(
      `${API_BASE_URL}/bill/create-bill`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          ...payload,

          store_code:
            payload.store_code ||
            storeCode ||
            undefined,
        }),
      }
    );

  return parseApiResponse(
    response
  );
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const billingApi = {
  scanBillingItemByCode,
  createBillingInvoice,
};

export default billingApi;