import { API_BASE } from "@/features/retail/transit/api";

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ||
    ""
  );
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...(options.headers || {}),
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json?.message ||
      json?.error ||
      "Failed to fetch"
    );
  }

  return json;
}

export async function getHeadAllTransfers(
  filters: Record<string, string>
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value &&
      value !== "all"
    ) {
      params.append(key, value);
    }
  });

  return apiFetch(
    `/request/transfers/head/all?${params.toString()}`
  );
}