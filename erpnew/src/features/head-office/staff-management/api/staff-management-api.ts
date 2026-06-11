import axios, { AxiosError } from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://erp-backend-w3pb.onrender.com";

function getToken() {
  if (typeof window === "undefined") return null;

  const keys = ["token", "accessToken", "authToken", "ims_token", "imsToken", "jwt"];

  for (const key of keys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value) return value;
  }

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.token || user?.accessToken || user?.authToken || null;
  } catch {
    return null;
  }
}

function cleanParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );
}

export function getApiError(error: unknown, fallback = "Something went wrong.") {
  const err = error as AxiosError<any>;

  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

export const staffApi = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

staffApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export type StaffStatus = "active" | "inactive" | "";

export type StaffFilters = {
  search?: string;
  role?: string;
  status?: StaffStatus;
  page?: number;
  limit?: number;
};

export type OrganizationLevel = "retail" | "district" | "head";

export type Organization = {
  id: number;
  store_name: string;
  store_code: string;
  organization_level: "Retail" | "District" | "Head";
  state?: string;
  district?: string;
  district_id?: number | string;
  address?: string;
  phone_number?: string;
};

export type AddEmployeePayload = {
  email: string;
  username: string;
  password?: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  organization_id: string | number;
  aadhaar?: File | null;
  pan?: File | null;
  policeDoc?: File | null;
};

export type UpdateEmployeePayload =
  Partial<AddEmployeePayload>;

function buildEmployeeFormData(
  payload: Partial<AddEmployeePayload>,
  isEdit = false
) {
  const formData = new FormData();

  const appendIfExists = (
    key: string,
    value: string | number | boolean | File | null | undefined
  ) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      formData.append(key, String(value));
    }
  };

  if (isEdit) {
    appendIfExists("email", payload.email?.trim());
    appendIfExists("username", payload.username?.trim());
    appendIfExists("password", payload.password?.trim());
    appendIfExists("role", payload.role);
    appendIfExists("organization_id", payload.organization_id);
    appendIfExists("phoneNumber", payload.phoneNumber?.trim());
    appendIfExists("address", payload.address?.trim());


    if (payload.aadhaar) {
      formData.append("aadhaar", payload.aadhaar);
    }

    if (payload.pan) {
      formData.append("pan", payload.pan);
    }

    if (payload.policeDoc) {
      formData.append("policeDoc", payload.policeDoc);
    }

    return formData;
  }

  // CREATE EMPLOYEE (all required)

  formData.append("email", payload.email?.trim() || "");
  formData.append("username", payload.username?.trim() || "");
  formData.append("password", payload.password?.trim() || "");
  formData.append("role", payload.role || "");
  formData.append(
    "organization_id",
    String(payload.organization_id || "")
  );
  formData.append(
    "phoneNumber",
    payload.phoneNumber?.trim() || ""
  );
  formData.append(
    "address",
    payload.address?.trim() || ""
  );

  if (payload.aadhaar) {
    formData.append("aadhaar", payload.aadhaar);
  }

  if (payload.pan) {
    formData.append("pan", payload.pan);
  }

  if (payload.policeDoc) {
    formData.append("policeDoc", payload.policeDoc);
  }

  return formData;
}

export async function getStaffList(filters: StaffFilters = {}) {
  const res = await staffApi.get("/staff/get", {
    params: cleanParams({
      search: filters.search,
      role: filters.role,
      status: filters.status,
      page: filters.page || 1,
      limit: filters.limit || 20,
    }),
  });

  return res.data;
}

export async function addEmployee(payload: AddEmployeePayload) {
  const formData = buildEmployeeFormData(payload, false);

  const res = await staffApi.post("/staff/add-emp", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function updateEmployee(
  id: number | string,
  payload: Partial<AddEmployeePayload>
) {
  if (!id) {
    throw new Error("Staff id is required.");
  }

  const formData = buildEmployeeFormData(payload, true);

  const res = await staffApi.put(
    `/staff/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}

export async function deleteStaff(id: number | string) {
  if (!id) throw new Error("Staff id is required.");

  const res = await staffApi.delete(`/staff/${id}`);
  return res.data;
}

export async function toggleStaffStatus(id: number | string) {
  if (!id) throw new Error("Staff id is required.");

  const res = await staffApi.patch(`/staff/${id}/status`);
  return res.data;
}

export async function getOrganizationsByLevel(
  level: OrganizationLevel
): Promise<Organization[]> {
  const res = await staffApi.get("/staff/organizations-by-level", {
    params: { level },
  });

  return Array.isArray(res.data?.data) ? res.data.data : [];
}