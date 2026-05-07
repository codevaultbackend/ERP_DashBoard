import type { LiveScannedBillingItem } from "./live-scanner-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://erp-backend-w3pb.onrender.com";

function getAuthToken() {
  if (typeof window === "undefined") return "";

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

export async function scanBillingItemByCode(
  rawCode: string
): Promise<LiveScannedBillingItem> {
  const code = String(rawCode || "").trim();

  if (!code) {
    throw new Error("QR/Barcode code is required");
  }

  const token = getAuthToken();

  if (!token) {
    throw new Error("Login token missing. Please login again.");
  }

  const res = await fetch(
    `${API_BASE_URL}/bill/billing/scan-item/${encodeURIComponent(code)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    throw new Error(
      json?.message || json?.error || "Failed to fetch scanned item"
    );
  }

  return {
    ...json.data,
    raw_qr_value: code,
    scanned_at: new Date().toISOString(),
  };
}