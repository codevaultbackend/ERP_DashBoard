import axios from "axios";
import type { LiveScannedBillingItem } from "./live-scanner-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://erp-backend-w3pb.onrender.com";

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
========================================================= */

    export async function scanBillingItemByCode(
  code: string,
  sessionId?: string
) {
  const token =
    localStorage.getItem("token");

  const response = await axios.get(
    `${API_BASE_URL}/billing/scan/${encodeURIComponent(code)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-billing-session-id": sessionId || "",
      },
    }
  );

  return response.data.data;
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

export type CreateBillItemPayload =
  {
    item_id:
      | number
      | string;

    product_code?:
      | string
      | null;

    description?:
      | string
      | null;

    qty: number;

    net_weight: number;

    rate: number;

    making_charge_percent: number;

    unit?: string | null;
  };

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