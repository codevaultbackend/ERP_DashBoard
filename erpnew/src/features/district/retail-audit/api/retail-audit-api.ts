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
/*                            RESPONSE INTERCEPTOR                            */
/* -------------------------------------------------------------------------- */

retailAuditApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "RETAIL AUDIT API ERROR:",
      error?.response?.data || error
    );

    if (error?.response?.status === 401) {
      console.error(
        "Unauthorized. Token expired or invalid."
      );
    }

    return Promise.reject(error);
  }
);

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type RetailAuditStore = {
  id: number;
  store_name: string;
  store_code: string;
  organization_level?: string;
};

export type RetailAudit = {
  id: number;
  audit_no?: string;
  audit_name?: string;
  audit_title?: string;
  store_id?: number;
  store_name?: string;
  organization_name?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  auditor_name?: string;
  remarks?: string;
};

export type RetailAuditDetails = {
  id: number;
  audit_no?: string;
  audit_name?: string;
  audit_title?: string;
  store_name?: string;
  store_code?: string; 
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
/*                            GET RETAIL STORES                               */
/* -------------------------------------------------------------------------- */

export const getRetailStores =
  async (): Promise<RetailAuditStore[]> => {
    try {
      const response =
        await retailAuditApi.get(
          "/request/district/retail-stores"
        );

      console.log(
        "RETAIL STORES RESPONSE:",
        response.data
      );

      if (
        Array.isArray(
          response?.data?.data
        )
      ) {
        return response.data.data;
      }

      if (
        Array.isArray(
          response?.data?.stores
        )
      ) {
        return response.data.stores;
      }

      if (
        Array.isArray(response?.data)
      ) {
        return response.data;
      }

      return [];
    } catch (error: any) {
      console.error(
        "Retail stores fetch error:",
        error?.response?.data ||
          error
      );

      throw error;
    }
  };

export const getRetailAudits =
  async (): Promise<RetailAudit[]> => {
    try {
      const response =
        await retailAuditApi.get(
          "/complete-audit/district/retail-audits"
        );

      console.log(
        "RETAIL AUDITS RESPONSE:",
        response.data
      );

      if (
        Array.isArray(
          response?.data?.data
        )
      ) {
        return response.data.data;
      }

      if (
        Array.isArray(response?.data)
      ) {
        return response.data;
      }

      return [];
    } catch (error: any) {
      console.error(
        "Retail audits fetch error:",
        error?.response?.data || error
      );

      return [];
    }
  };

/* -------------------------------------------------------------------------- */
/*                     GET RETAIL AUDIT BY ID                                 */
/* -------------------------------------------------------------------------- */

export const getRetailAuditById =
  async (
    id: number | string
  ): Promise<RetailAuditDetails> => {
    try {
      const response =
        await retailAuditApi.get(
          `/complete-audit/district/retail-audits/${id}`
        );

      console.log(
        "AUDIT DETAILS RESPONSE:",
        response.data
      );

      return (
        response?.data?.data ||
        response?.data ||
        {}
      );
    } catch (error: any) {
      console.error(
        "Audit details fetch error:",
        error?.response?.data || error
      );

      throw error;
    }
  };

/* -------------------------------------------------------------------------- */
/*                         DOWNLOAD AUDIT REPORT                              */
/* -------------------------------------------------------------------------- */

export const downloadRetailAudit =
  async (
    id: number | string
  ) => {
    try {
      const response =
        await retailAuditApi.get(
          `/complete-audit/district/retail-audits/${id}/download`,
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
            ],
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;
      link.download = `audit-report-${id}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      return true;
    } catch (error: any) {
      console.error(
        "Download audit error:",
        error?.response?.data || error
      );

      throw error;
    }
  };

/* -------------------------------------------------------------------------- */
/*                       FILTER HELPERS (FRONTEND)                            */
/* -------------------------------------------------------------------------- */

export const filterAuditsByStore = (
  audits: RetailAudit[],
  storeId: number | null
) => {
  if (!storeId) return audits;

  return audits.filter(
    (audit) =>
      Number(audit.store_id) ===
      Number(storeId)
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
      String(
        audit.audit_name || ""
      )
        .toLowerCase()
        .includes(search) ||
      String(
        audit.audit_title || ""
      )
        .toLowerCase()
        .includes(search) ||
      String(
        audit.audit_no || ""
      )
        .toLowerCase()
        .includes(search) ||
      String(
        audit.store_name ||
          audit.organization_name ||
          ""
      )
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