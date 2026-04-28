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
  }[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

export async function createDailyAudit(payload: CreateDailyAuditPayload) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const res = await fetch(`${API_BASE}/audit/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();


  console.log(data);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Failed to create audit");
  }

  return data;
}