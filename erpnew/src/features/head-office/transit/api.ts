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

export async function getOrganizationsByLevel(
  level: "district" | "retail" | "head"
) {
  return apiFetch(
    `/staff/organizations-by-level?level=${level}`
  );
}

export async function getHeadTransitById(
  id: string | number
) {
  const res = await apiFetch<any>(
    `/request/head/transfers/${id}`
  );

  return res.data;
}

export async function markHeadTransferReceived(
  id: string | number
) {
  return apiFetch(
    `/request/transfers/head/${id}/receive`,
    {
      method: "PUT",
    }
  );
}
export async function getHeadTransferLiveLocation(
  id: string | number
) {
  return apiFetch(
    `/track/${id}/live-location`
  );
}

export async function getHeadTransferRoute(
  id: string | number
) {
  return apiFetch(
    `/track/${id}/route`
  );
}

export async function startHeadTransferLiveTracking(
  id: string | number,
  payload: {
    start_lat: number;
    start_lng: number;
  }
) {
  return apiFetch(
    `/track/${id}/start`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function updateHeadTransferLiveLocation(
  id: string | number,
  payload: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    battery_level?: number;
  }
) {
  return apiFetch(
    `/track/${id}/location`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function stopHeadTransferLiveTracking(
  id: string | number
) {
  return apiFetch(
    `/track/${id}/stop`,
    {
      method: "POST",
    }
  );
}