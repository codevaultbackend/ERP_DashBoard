import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                  AXIOS                                     */
/* -------------------------------------------------------------------------- */

export const requestApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://erp-for-local.onrender.com",

  headers: {
    "Content-Type": "application/json",
  },
});

/* -------------------------------------------------------------------------- */
/*                         AUTO AUTH TOKEN ATTACH                             */
/* -------------------------------------------------------------------------- */

requestApi.interceptors.request.use(
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

  (error) => {
    return Promise.reject(error);
  }
);

/* -------------------------------------------------------------------------- */
/*                            RESPONSE INTERCEPTOR                            */
/* -------------------------------------------------------------------------- */

requestApi.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      "API ERROR:",
      error?.response?.data || error
    );

    if (error?.response?.status === 401) {
      console.error(
        "Unauthorized. Token missing or expired."
      );
    }

    return Promise.reject(error);
  }
);

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type DistrictRetailStoreApi = {
  id: number;
  store_code: string;
  store_name: string;
  organization_level: string;
  district_id?: number;
  is_active?: boolean;
};

export type HeadOfficeApi = {
  id: number;
  store_code: string;
  store_name: string;
  organization_level: string;
  district_id?: number;
  is_active?: boolean;
};

export type CategoryRowApi = {
  category: string;
  quantity: number;
};

export type CategoryItemApi = {
  id: number;
  item_name?: string;
  article_code?: string;
  sku_code?: string;
  quantity?: number;
  available_qty?: number;
  parent_batch_id?: number | null;
};

export type DistrictStockRequestPayload = {
  target_type: "head" | "retail";

  to_store_id?: number;
  to_store_code: string;
  priority: string;
  category?: string;
  notes?: string;

  items: {
    item_id: number;
    parent_batch_id?: number | null;
    request_qty: number;
  }[];
};

/* -------------------------------------------------------------------------- */
/*                         CREATE DISTRICT REQUEST                            */
/* -------------------------------------------------------------------------- */

export const createDistrictStockRequest =
  async (
    payload: DistrictStockRequestPayload
  ) => {
    try {
      console.group(
        "DISTRICT STOCK REQUEST"
      );

      console.log(
        "REQUEST PAYLOAD:",
        payload
      );

      const res = await requestApi.post(
        "/request/district-stock-request",
        payload
      );

      console.log(
        "REQUEST SUCCESS:",
        res.data
      );

      console.groupEnd();

      return res.data;
    } catch (error: any) {
      console.error(
        "REQUEST FAILED:",
        error?.response?.data || error
      );

      console.groupEnd();

      throw error;
    }
  };

/* -------------------------------------------------------------------------- */
/*                       GET RETAIL STORES UNDER DISTRICT                     */
/* -------------------------------------------------------------------------- */

export const getRetailStoresUnderDistrict =
  async (): Promise<
    DistrictRetailStoreApi[]
  > => {
    try {
      console.log(
        "Fetching district retail stores..."
      );

      const res = await requestApi.get(
        "/request/district/retail-stores"
      );

      console.log(
        "RETAIL STORE RESPONSE:",
        res.data
      );

      return Array.isArray(
        res?.data?.data
      )
        ? res.data.data
        : [];
    } catch (error: any) {
      console.error(
        "Retail fetch error:",
        error?.response?.data || error
      );

      throw error;
    }
  };

/* -------------------------------------------------------------------------- */
/*                              GET HEAD OFFICE                               */
/* -------------------------------------------------------------------------- */

export const getHeadOffice =
  async (): Promise<
    HeadOfficeApi[]
  > => {
    try {
      console.log(
        "Fetching head office..."
      );

      const res = await requestApi.get(
        "/staff/organizations-by-level",
        {
          params: {
            level: "head_office",
          },
        }
      );

      console.log(
        "HEAD OFFICE RESPONSE:",
        res.data
      );

      return Array.isArray(
        res?.data?.data
      )
        ? res.data.data
        : [];
    } catch (error: any) {
      console.error(
        "Head office fetch error:",
        error?.response?.data || error
      );

      throw error;
    }
  };

/* -------------------------------------------------------------------------- */
/*                           GET STOCK CATEGORIES                             */
/* -------------------------------------------------------------------------- */

export const getStockCategories =
  async ({
    organization_id,
    organization_level,
  }: {
    organization_id: number;
    organization_level: string;
  }): Promise<
    CategoryRowApi[]
  > => {
    try {
      console.log(
        "Fetching stock categories...",
        {
          organization_id,
          organization_level,
        }
      );

      const res = await requestApi.get(
        "/stock/list",
        {
          params: {
            organization_id,
            organization_level,
          },
        }
      );

      console.log(
        "CATEGORY RESPONSE:",
        res.data
      );

      /**
       * IMPORTANT FIX
       */

      return Array.isArray(
        res?.data?.data
      )
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
    } catch (error: any) {
      console.error(
        "Category fetch error:",
        error?.response?.data || error
      );

      throw error;
    }
  };

/* -------------------------------------------------------------------------- */
/*                         GET ITEMS BY CATEGORY                              */
/* -------------------------------------------------------------------------- */

export const getStockItemsByCategory =
  async ({
    category,
    organization_id,
    organization_level,
  }: {
    category: string;
    organization_id: number;
    organization_level: string;
  }): Promise<
    CategoryItemApi[]
  > => {
    try {
      console.log(
        "Fetching items by category:",
        {
          category,
          organization_id,
          organization_level,
        }
      );

      /**
       * SAME ENDPOINT
       * ONLY PARAMS FIXED
       */

      const res = await requestApi.get(
        `/stock/category/${encodeURIComponent(
          category
        )}`,
        {
          params: {
            organization_id,
            organization_level,
          },
        }
      );

      console.log(
        "ITEM RESPONSE:",
        res.data
      );

      /**
       * IMPORTANT FIX
       */

      return Array.isArray(
        res?.data?.data
      )
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
    } catch (error: any) {
      console.error(
        "Items fetch error:",
        error?.response?.data || error
      );

      throw error;
    }
  };