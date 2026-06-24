import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://erp-backend-w3pb.onrender.com";

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken")
  );
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

export type TransferStore = {
  id: number;
  store_code: string;
  store_name: string;
  organization_level: string;
};

export type TransferToRetailPayload = {
  retail_store_code: string;
  notes?: string;
};

export type TransferToDistrictPayload = {
  district_store_code: string;
  notes?: string;
};

/* -------------------------------------------------------------------------- */
/* DISTRICT -> RETAIL */
/* -------------------------------------------------------------------------- */

export async function getRetailStoresForTransfer(): Promise<{
  success: boolean;
  data: TransferStore[];
}> {
  const response = await api.get(
    "/request/district/retail-stores"
  );

  return response.data;
}

/* -------------------------------------------------------------------------- */
/* HEAD OFFICE -> DISTRICT */
/* -------------------------------------------------------------------------- */

export async function getDistrictStoresForTransfer(): Promise<{
  success: boolean;
  data: TransferStore[];
}> {
  const response = await api.get(
    "/staff/organizations-by-level",
    {
      params: {
        level: "district",
      },
    }
  );

  return {
    success: true,
    data: response?.data?.data || [],
  };
}

/* -------------------------------------------------------------------------- */
/* DISTRICT -> RETAIL TRANSFER */
/* -------------------------------------------------------------------------- */

export async function transferRequestToRetail(
  requestId: number | string,
  payload: TransferToRetailPayload
) {
  const response = await api.post(
    `/request/district/requests/${requestId}/transfer-to-retail`,
    {
      retail_store_code: payload.retail_store_code,
      notes: payload.notes || "",
    }
  );

  return response.data;
}

/* -------------------------------------------------------------------------- */
/* HEAD OFFICE -> DISTRICT TRANSFER */
/* -------------------------------------------------------------------------- */

export async function transferRequestToDistrict(
  requestId: number | string,
  payload: TransferToDistrictPayload
) {
  try {
    const response = await api.post(
      `/request/head/requests/${requestId}/transfer-to-district`,
      {
        district_store_code: payload.district_store_code,
        notes: payload.notes || "",
      }
    );

    return response.data;
  } catch (error: any) {
    console.log("TRANSFER DISTRICT ERROR");
    console.log("STATUS:", error?.response?.status);
    console.log("DATA:", error?.response?.data);
    throw error;
  }
}