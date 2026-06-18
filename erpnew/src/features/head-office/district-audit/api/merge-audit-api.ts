"use client";

import axios from "axios";

export const retailAuditApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://erp-backend-w3pb.onrender.com",

  headers: {
    "Content-Type": "application/json",
  },
});

/* -------------------------------------------------------------------------- */
/*                           REQUEST INTERCEPTOR                              */
/* -------------------------------------------------------------------------- */

retailAuditApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------------------------------------------------- */
/*                          RESPONSE INTERCEPTOR                              */
/* -------------------------------------------------------------------------- */

retailAuditApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "RETAIL AUDIT API ERROR:",
      error?.response?.data || error
    );

    return Promise.reject(error);
  }
);

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type RetailAuditStore = {
  id: string;

  store_name: string;

  store_code: string;

  organization_level?: string;

  state?: string | null;

  district?: string | null;

  district_id?: string | null;

  address?: string | null;

  phone_number?: string | null;

  inventory?: any[];
};

export type RetailAudit = {
  id: number;

  audit_no?: string;

  audit_date?: string;

  audit_type?: string;

  store_id?: string | number;

  store_code?: string;

  store_name?: string;

  district_id?: string | number;

  district_name?: string;

  total_items?: number;

  checked_items?: number;

  present_items?: number;

  missing_items?: number;

  pending_items?: number;

  created_at?: string;

  updated_at?: string;

  status?: string;

  remark?: string;
};

export type RetailAuditDetails = {
  id: number;

  audit_no?: string;

  audit_name?: string;

  audit_title?: string;

  store_name?: string;

  organization_name?: string;

  created_at?: string;

  updated_at?: string;

  status?: string;

  auditor_name?: string;

  remarks?: string;

  items?: any[];

  variance_items?: any[];
};

/* -------------------------------------------------------------------------- */
/*                       GET STORES (DISTRICT / RETAIL)                       */
/* -------------------------------------------------------------------------- */

export const getStores = async (
  targetType: "district" | "retail"
): Promise<RetailAuditStore[]> => {
  try {
    const response =
      await retailAuditApi.get(
        `/request/available-stores/${targetType}`
      );

    console.log(
      `${targetType.toUpperCase()} STORES RESPONSE`,
      response.data
    );

    if (
      response?.data?.success &&
      Array.isArray(response?.data?.data)
    ) {
      return response.data.data;
    }

    if (
      Array.isArray(response?.data?.data)
    ) {
      return response.data.data;
    }

    return [];
  } catch (error: any) {
    console.error(
      `${targetType} stores fetch error`,
      error?.response?.data || error
    );

    return [];
  }
};

/* -------------------------------------------------------------------------- */
/*                  GET ALL RETAIL AUDITS OF A DISTRICT                       */
/* -------------------------------------------------------------------------- */

export const getDistrictAudits = async (
  districtStoreCode: string
): Promise<RetailAudit[]> => {
  try {
    const response =
      await retailAuditApi.get(
        "/complete-audit/head/district-audits",
        {
          params: {
            district_store_code:
              districtStoreCode,
          },
        }
      );

    console.log(
      "DISTRICT AUDITS RESPONSE",
      response.data
    );

    if (
      response?.data?.success &&
      Array.isArray(response?.data?.data)
    ) {
      return response.data.data;
    }

    if (
      Array.isArray(response?.data?.data)
    ) {
      return response.data.data;
    }

    return [];
  } catch (error: any) {
    console.error(
      "District audits fetch error",
      error?.response?.data || error
    );

    return [];
  }
};


export const getRetailAudits = async (
  retailStoreCode: string
): Promise<RetailAudit[]> => {
  try {
    const response =
      await retailAuditApi.get(
        "/complete-audit/head/retail-audits",
        {
          params: {
            retail_store_code:
              retailStoreCode,
          },
        }
      );

    console.log(
      "RETAIL AUDITS RESPONSE",
      response.data
    );

    if (
      response?.data?.success &&
      Array.isArray(response?.data?.data)
    ) {
      return response.data.data;
    }

    if (
      Array.isArray(response?.data?.data)
    ) {
      return response.data.data;
    }

    return [];
  } catch (error: any) {
    console.error(
      "Retail audits fetch error",
      error?.response?.data || error
    );

    return [];
  }
};
/* -------------------------------------------------------------------------- */
/*                           GET AUDIT preview                               */
/* -------------------------------------------------------------------------- */

export const getRetailAuditById =
  async (
    id: string | number
  ): Promise<RetailAuditDetails> => {
    try {
      const response =
        await retailAuditApi.get(
          `/head/district-audits/${id}`
        );

      return (
        response?.data?.data ||
        response?.data ||
        {}
      );
    } catch (error: any) {
      console.error(
        "Audit details fetch error",
        error?.response?.data || error
      );

      throw error;
    }
  };

/* -------------------------------------------------------------------------- */
/*                            DOWNLOAD AUDIT PDF                              */
/* -------------------------------------------------------------------------- */

export const downloadRetailAudit =
  async (
    districtStoreCode: string,
    auditId: string | number
  ) => {
    try {
      const response = await retailAuditApi.get(
        `/complete-audit/head/district/${districtStoreCode}/store-audits/${auditId}/download`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers[
            "content-type"
            ] ||
            "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `audit-report-${auditId}.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      return true;
    } catch (error: any) {
      console.error(
        "Download audit error",
        error?.response?.data || error
      );

      throw error;
    }
  };


  export const downloadDistrictAudit =
  async (
    auditId: string | number
  ) => {
    try {
      const response =
        await retailAuditApi.get(
          `/complete-audit/head/district-audits/${auditId}/download`,
          {
            responseType: "blob",
          }
        );

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers[
              "content-type"
            ] ||
            "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `district-audit-${auditId}.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      return true;
    } catch (error: any) {
      console.error(
        "District audit download error",
        error?.response?.data ||
          error
      );

      throw error;
    }
  };
/* -------------------------------------------------------------------------- */
/*                                FILTERS                                     */
/* -------------------------------------------------------------------------- */

export const filterAuditsByStore = (
  audits: RetailAudit[],
  storeId: string | number | null
) => {
  if (!storeId) return audits;

  return audits.filter(
    (audit) =>
      String(audit.store_id) ===
      String(storeId)
  );
};

export const filterAuditsByDate = (
  audits: RetailAudit[],
  date: string
) => {
  if (!date) return audits;

  return audits.filter((audit) => {
    const auditDate =
      audit.created_at
        ? new Date(
          audit.created_at
        )
          .toISOString()
          .split("T")[0]
        : "";

    return auditDate === date;
  });
};

export const searchRetailAudits = (
  audits: RetailAudit[],
  query: string
) => {
  if (!query.trim()) return audits;

  const search =
    query.toLowerCase();

  return audits.filter(
    (audit) =>
      String(audit.audit_no || "")
        .toLowerCase()
        .includes(search) ||

      String(audit.store_name || "")
        .toLowerCase()
        .includes(search) ||

      String(audit.store_code || "")
        .toLowerCase()
        .includes(search) ||

      String(audit.audit_type || "")
        .toLowerCase()
        .includes(search) ||

      String(audit.status || "")
        .toLowerCase()
        .includes(search)
  );
};

/* -------------------------------------------------------------------------- */
/*                               FORMATTERS                                   */
/* -------------------------------------------------------------------------- */

export const formatAuditDate = (
  date?: string
): string => {
  if (!date) return "--";

  try {
    return new Date(
      date
    ).toLocaleDateString(
      "en-GB"
    );
  } catch {
    return "--";
  }
};