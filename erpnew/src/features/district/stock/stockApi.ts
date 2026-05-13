import axios from "axios";

export const stockApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://erp-backend-w3pb.onrender.com",
  withCredentials: false,
});

stockApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("ims_token") ||
      localStorage.getItem("erp_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});