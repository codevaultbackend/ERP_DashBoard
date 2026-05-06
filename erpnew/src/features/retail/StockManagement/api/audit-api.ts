export type AuditStatus = "present" | "missing" | "pending";

export type CreateDailyAuditPayload = {
  audit_date?: string;
  remark?: string;
  submit?: boolean;
  items: {
    item_id: string | number;
    audit_result: AuditStatus;
    checklist_note?: string;
    missing_reason?: string;
    physical_qty?: number;
    physical_weight?: number;
    image_url?: string;
    attachment_url?: string;
  }[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-backend-w3pb.onrender.com";

export async function createDailyAudit(payload: CreateDailyAuditPayload) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    throw new Error("Login token missing. Please login again.");
  }

  const res = await fetch(`${API_BASE}/audit/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  let data: any;

  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid response from server");
  }

  if (!res.ok) {
    console.error(" createDailyAudit API error:", data);
    throw new Error(data?.message || data?.error || "Failed to create audit");
  }

  return data;
}