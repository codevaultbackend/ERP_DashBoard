import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-backend-w3pb.onrender.com";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("erp_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.error("Unauthorized request. Token missing or expired.");
    }

    return Promise.reject(error);
  }
);