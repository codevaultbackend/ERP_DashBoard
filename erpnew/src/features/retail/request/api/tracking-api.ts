import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://erp-backend-w3pb.onrender.com";

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token")
  );
}

export const trackingApi = axios.create({
  baseURL: API_BASE,
});

trackingApi.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export type TrackingCoordinate = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  battery_level?: number | null;
};

export async function startLiveTrackingApi(
  transferId: number | string,
  payload: {
    start_lat: number;
    start_lng: number;
  }
) {
  const res = await trackingApi.post(`/track/${transferId}/start`, payload);
  return res.data;
}

export async function patchLiveLocationApi(
  transferId: number | string,
  payload: TrackingCoordinate
) {
  const res = await trackingApi.patch(`/track/${transferId}/location`, payload);
  return res.data;
}

export async function getLiveLocationApi(transferId: number | string) {
  const res = await trackingApi.get(`/track/${transferId}/live-location`);
  return res.data;
}

export async function stopLiveTrackingApi(transferId: number | string) {
  const res = await trackingApi.post(`/track/${transferId}/stop`);
  return res.data;
}