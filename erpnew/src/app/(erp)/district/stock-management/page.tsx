"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import StockStatCards from "../../../../features/retail/StockManagement/components/StockStatCards";
import StockManagementToolbar from "../../../../features/retail/StockManagement/components/StockManagementToolbar";
import StockManagementTable from "../../../../features/retail/StockManagement/components/StockManagementTable";
import DistrictAddStockPopup, {
  type DistrictAddStockFormPayload,
} from "../../../../features/district/stock/component/DistrictAddStockPopup";

import {
  createDailyAudit,
  type AuditStatus,
} from "../../../../features/retail/StockManagement/api/audit-api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://erp-backend-w3pb.onrender.com";

const stockApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

stockApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("ims_token") ||
      localStorage.getItem("erp_token") ||
      sessionStorage.getItem("token") ||
      "";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

type StockSummaryApi = {
  total_stock_items: number;
  dead_stock_items: number;
  low_stock_items: number;
  transit_goods: number;
};

type StockCategoryRowApi = {
  category: string;
  code?: string;
  quantity: number;
  selling_price?: number;
  making_charge?: number;
  purity?: string;
  net_weight?: number;
  stone_weight?: number;
  gross_weight?: number;
};

type StockCategoryItemApi = {
  id: number;
  article_code?: string;
  sku_code?: string;
  item_name?: string;
  category?: string;
  purity?: string;
  gross_weight?: number;
  net_weight?: number;
  stone_weight?: number;
  available_qty?: number;
  quantity?: number;
  image?: string;
  image_url?: string;
  isItemAudit?: boolean;
  itemAuditAt?: string | null;
};

type StockListResponse = {
  success: boolean;
  message: string;
  summary?: StockSummaryApi;
  count?: number;
  data?: StockCategoryRowApi[];
};

type AddStockResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
};

type LoggedInUser = {
  id?: number;
  email?: string;
  role?: string;
  organization_id?: number | string;
  organizationId?: number | string;
  organization_level?: string;
  store_code?: string;
};

export type StockArticle = {
  id: string;
  image: string;
  article: string;
  code: string;
  quantity: number;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  category: string;
  isItemAudit?: boolean;
  itemAuditAt?: string | null;
};

export type StockRow = {
  id: number | string;
  category: string;
  code: string;
  quantity: number;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  image: string;
  articles?: StockArticle[];
};

type AuditMap = Record<
  string,
  {
    status: AuditStatus;
    remark: string;
    category: string;
  }
>;

function safeText(value: unknown, fallback = "--") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function safeWeight(value: unknown) {
  if (value === null || value === undefined || value === "") return "--";
  return `${value}g`;
}

function safePrice(value: unknown) {
  if (value === null || value === undefined || value === "") return "--";
  return `₹${value}`;
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeStoreCode(value: unknown) {
  const clean = normalizeText(value).toUpperCase();
  return clean || "";
}

function normalizeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function getLoggedInUser(): LoggedInUser | null {
  if (typeof window === "undefined") return null;

  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function getDistrictScope() {
  const user = getLoggedInUser();

  const storeCode = normalizeStoreCode(
    user?.store_code ||
    localStorage.getItem("store_code") ||
    localStorage.getItem("selected_store_code")
  );

  const organizationId =
    user?.organization_id ||
    user?.organizationId ||
    localStorage.getItem("organization_id") ||
    "";
  return {
    store_code: storeCode,
    organization_id: organizationId,
  };
}

function getStockApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
        message?: string;
        error?: string;
        errors?: unknown;
      }
      | undefined;

    if (Array.isArray(data?.errors)) {
      const errors = data.errors
        .map((item) => {
          if (typeof item === "string") return item;

          if (
            typeof item === "object" &&
            item !== null &&
            "message" in item
          ) {
            return String((item as { message?: string }).message || "");
          }

          return "";
        })
        .filter(Boolean);

      if (errors.length > 0) return errors.join(", ");
    }

    return (
      data?.message ||
      data?.error ||
      error.message ||
      "Failed to process stock request"
    );
  }

  if (error instanceof Error) return error.message;

  return "Failed to process stock request";
}

function isAuditDoneToday(article: StockArticle) {
  if (!article.isItemAudit || !article.itemAuditAt) return false;

  const auditDate = new Date(article.itemAuditAt);
  const today = new Date();

  return (
    auditDate.getFullYear() === today.getFullYear() &&
    auditDate.getMonth() === today.getMonth() &&
    auditDate.getDate() === today.getDate()
  );
}

function mapCategoryRowsToStockRows(rows: StockCategoryRowApi[]): StockRow[] {
  return rows.map((row, index) => ({
    id: row.category || index + 1,
    category: safeText(row.category),
    code: safeText(row.code),
    quantity: Number(row.quantity || 0),
    sellingPrice: safePrice(row.selling_price),
    makingCharge: safePrice(row.making_charge),
    purity: safeText(row.purity),
    netWeight: safeWeight(row.net_weight),
    stoneWeight: safeWeight(row.stone_weight),
    grossWeight: safeWeight(row.gross_weight),
    image: "/placeholder-product.png",
    articles: [],
  }));
}

function mapCategoryItemsToArticles(
  rows: StockCategoryItemApi[],
  category: string
): StockArticle[] {
  return rows.map((row) => ({
    id: String(row.id),
    image: row.image || row.image_url || "/placeholder-product.png",
    article: safeText(row.item_name || row.article_code || row.sku_code, "Item"),
    code: safeText(row.article_code || row.sku_code),
    quantity: Number(row.available_qty ?? row.quantity ?? 0),
    purity: safeText(row.purity),
    netWeight: safeWeight(row.net_weight),
    stoneWeight: safeWeight(row.stone_weight),
    grossWeight: safeWeight(row.gross_weight),
    category,
    isItemAudit: Boolean(row.isItemAudit),
    itemAuditAt: row.itemAuditAt || null,
  }));
}

async function getDistrictStockCategories(): Promise<StockListResponse> {
  const scope = getDistrictScope();

  const res = await stockApi.get("/stock/list", {
    params: {
      store_code: scope.store_code || undefined,
      organization_id: scope.organization_id || undefined,
    },
  });

  return res.data;
}

async function getDistrictStockItemsByCategory(category: string) {
  const scope = getDistrictScope();

  const res = await stockApi.get(
    `/stock/category/${encodeURIComponent(category)}`,
    {
      params: {
        store_code: scope.store_code || undefined,
        organization_id: scope.organization_id || undefined,
      },
    }
  );

  return res.data;
}

function validateAddStockPayload(payload: {
  item_name: string;
  metal_type: "Gold" | "Silver";
  category: string;
  purity: string;
  qty: number;
  net_weight: number;
}) {
  if (!payload.item_name) {
    throw new Error("Item name is required");
  }

  if (!["Gold", "Silver"].includes(payload.metal_type)) {
    throw new Error("Metal type must be Gold or Silver");
  }

  if (!payload.category) {
    throw new Error("Category is required");
  }

  if (!payload.purity) {
    throw new Error("Purity is required");
  }

  if (!Number.isFinite(payload.qty) || payload.qty <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  if (!Number.isFinite(payload.net_weight) || payload.net_weight <= 0) {
    throw new Error("Net weight must be greater than 0");
  }
}

async function addDistrictStockItem(
  payload: DistrictAddStockFormPayload
) {
  const scope = getDistrictScope();

  if (!scope.store_code) {
    throw new Error(
      "District store_code missing. Please login again."
    );
  }

  if (!scope.organization_id) {
    throw new Error(
      "District organization_id missing. Please login again."
    );
  }

  const formData = new FormData();

  const items = [
    {
      item_name: normalizeText(payload.item_name),

      item_code: normalizeText(
        payload.item_code
      ),

      metal_type: payload.metal_type,

      category: normalizeText(
        payload.category
      ),

      purity: normalizeText(
        payload.purity
      ),
      selling_price: Number(
        payload.selling_price || 0
      ),

      qty: Number(payload.qty),

      net_weight: Number(
        payload.net_weight
      ),

      stone_weight: Number(
        payload.stone_weight || 0
      ),

      making_charge: Number(
        payload.making_charge || 0
      ),
    },
  ];

  formData.append(
    "items",
    JSON.stringify(items)
  );

  if (payload.image) {
    formData.append(
      "images",
      payload.image,
      payload.image.name
    );
  }

  const res = await stockApi.post(
    "/stock/stock-in",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return res.data;
}

export default function StockManagementPage() {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [auditMode, setAuditMode] = useState(false);

  const [summary, setSummary] = useState<StockSummaryApi>({
    total_stock_items: 0,
    dead_stock_items: 0,
    low_stock_items: 0,
    transit_goods: 0,
  });

  const [loading, setLoading] = useState(true);

  const [loadingRowCategory, setLoadingRowCategory] = useState<string | null>(
    null
  );

  const [pageError, setPageError] = useState("");

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [reportedArticles, setReportedArticles] = useState<
    Record<string, boolean>
  >({});

  const [auditMap, setAuditMap] = useState<AuditMap>({});
  const [submitting, setSubmitting] = useState(false);

  const [addStockOpen, setAddStockOpen] = useState(false);
  const [addStockLoading, setAddStockLoading] = useState(false);
  const [addStockError, setAddStockError] = useState("");

  const loadDistrictRows = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const res = await getDistrictStockCategories();

      const apiRows = Array.isArray(res?.data) ? res.data : [];

      const apiSummary = res?.summary || {
        total_stock_items: 0,
        dead_stock_items: 0,
        low_stock_items: 0,
        transit_goods: 0,
      };

      setRows(mapCategoryRowsToStockRows(apiRows));
      setSummary(apiSummary);
    } catch (error) {
      setPageError(getStockApiErrorMessage(error));

      setRows([]);
      setSummary({
        total_stock_items: 0,
        dead_stock_items: 0,
        low_stock_items: 0,
        transit_goods: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDistrictRows();
  }, [loadDistrictRows]);


  async function uploadDistrictStockFile(file: File) {
    const scope = getDistrictScope();

    if (!scope.store_code) {
      throw new Error("District store_code missing. Please login again.");
    }

    if (!scope.organization_id) {
      throw new Error("District organization_id missing. Please login again.");
    }

    if (!file) {
      throw new Error("Please select a file.");
    }

    const allowedExtensions = ["xlsx", "xls", "csv", "pdf"];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      throw new Error("Only Excel, CSV, or PDF files are allowed.");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("store_code", scope.store_code);
    formData.append("organization_id", String(scope.organization_id));

    const res = await stockApi.post(
      "/stock/inventory/stock-in/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  }

  useEffect(() => {
    const storedReported = sessionStorage.getItem("submitted-audit-items");
    const storedAuditMap = sessionStorage.getItem("stock-audit-map");

    if (storedReported) {
      try {
        const parsed: string[] = JSON.parse(storedReported);

        const mapped = parsed.reduce<Record<string, boolean>>((acc, id) => {
          acc[id] = true;
          return acc;
        }, {});

        setReportedArticles(mapped);
      } catch {
        sessionStorage.removeItem("submitted-audit-items");
      }
    }

    if (storedAuditMap) {
      try {
        setAuditMap(JSON.parse(storedAuditMap));
      } catch {
        sessionStorage.removeItem("stock-audit-map");
      }
    }
  }, []);

  useEffect(() => {
    const reportedIds = Object.keys(reportedArticles).filter(
      (id) => reportedArticles[id]
    );

    sessionStorage.setItem(
      "submitted-audit-items",
      JSON.stringify(reportedIds)
    );
  }, [reportedArticles]);

  useEffect(() => {
    sessionStorage.setItem("stock-audit-map", JSON.stringify(auditMap));
  }, [auditMap]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(rows.map((row) => row.category)));
    return ["All", ...unique];
  }, [rows]);

  const auditedCount = useMemo(() => {
    return Object.values(auditMap).filter((audit) => {
      if (!audit?.status) return false;
      if (audit.status === "missing" && !audit.remark?.trim()) return false;

      return audit.status === "present" || audit.status === "missing";
    }).length;
  }, [auditMap]);

  const handleAddStockSubmit = async (
    payload: DistrictAddStockFormPayload[]
  ) => {
    try {
      if (addStockLoading) return;

      setAddStockLoading(true);
      setAddStockError("");
      setPageError("");

      for (const item of payload) {
        const result = await addDistrictStockItem(item);

        if (!result?.success) {
          throw new Error(
            result?.message || "Failed to add stock item"
          );
        }
      }

      if (!result?.success) {
        throw new Error(result?.message || "Failed to add stock item");
      }

      setAddStockOpen(false);
      setAddStockError("");

      await loadDistrictRows();
    } catch (error) {
      setAddStockError(getStockApiErrorMessage(error));
    } finally {
      setAddStockLoading(false);
    }
  };
  const handleUploadStock = async (file: File) => {
    try {
      if (uploadLoading) return;

      setUploadLoading(true);
      setUploadError("");
      setPageError("");

      const result = await uploadDistrictStockFile(file);

      if (!result?.success) {
        throw new Error(result?.message || "Failed to upload stock file");
      }

      await loadDistrictRows();
    } catch (error) {
      const message = getStockApiErrorMessage(error);

      setUploadError(message);
      setPageError(message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleLoadArticles = async (category: string) => {
    const existingRow = rows.find(
      (row) =>
        row.category?.toLowerCase().trim() === category?.toLowerCase().trim()
    );

    if (existingRow?.articles?.length) return;

    try {
      setLoadingRowCategory(category);

      const res = await getDistrictStockItemsByCategory(category);

      const apiRows: StockCategoryItemApi[] = Array.isArray(res?.data)
        ? res.data
        : [];

      const articles = mapCategoryItemsToArticles(apiRows, category);

      setRows((prev) =>
        prev.map((row) =>
          row.category?.toLowerCase().trim() === category?.toLowerCase().trim()
            ? {
              ...row,
              articles,
            }
            : row
        )
      );
    } catch (error) {
      console.error("Failed to load district category items", error);
    } finally {
      setLoadingRowCategory(null);
    }
  };

  const fetchArticlesForCategory = async (category: string) => {
    const res = await getDistrictStockItemsByCategory(category);

    const apiRows: StockCategoryItemApi[] = Array.isArray(res?.data)
      ? res.data
      : [];

    return mapCategoryItemsToArticles(apiRows, category);
  };

  const getRowsForAudit = async () => {
    const targetRows = rows;

    const hydratedRows: StockRow[] = [];

    for (const row of targetRows) {
      if (row.articles?.length) {
        hydratedRows.push(row);
        continue;
      }

      const articles = await fetchArticlesForCategory(row.category);

      hydratedRows.push({
        ...row,
        articles,
      });
    }

    setRows((prev) =>
      prev.map((row) => {
        const hydrated = hydratedRows.find(
          (x) =>
            x.category?.toLowerCase().trim() ===
            row.category?.toLowerCase().trim()
        );

        return hydrated || row;
      })
    );

    return hydratedRows;
  };

  const validateAuditRows = (articles: StockArticle[]) => {
    const pendingArticles = articles.filter((article) => {
      if (isAuditDoneToday(article)) return false;

      const audit = auditMap[article.id];

      if (!audit?.status) return true;

      if (audit.status === "missing" && !audit.remark?.trim()) {
        return true;
      }

      return audit.status !== "present" && audit.status !== "missing";
    });

    if (pendingArticles.length > 0) {
      alert(`Please complete audit for ${pendingArticles.length} item(s).`);
      return false;
    }

    return true;
  };
  const handleAuditButtonClick = async () => {
    if (!auditMode) {
      setAuditMode(true);

      await getRowsForAudit();

      return;
    }

    await handleCreateReport();
  };
  const handleCreateReport = async () => {
    try {
      if (submitting) return;

      setSubmitting(true);

      const auditRows = await getRowsForAudit();

      if (!auditRows.length) {
        throw new Error("No category found for audit");
      }

      const articles = auditRows.flatMap((row) => row.articles || []);

      if (!articles.length) {
        throw new Error("No frontend articles found for audit");
      }

      if (!validateAuditRows(articles)) {
        return;
      }

      const items = articles
        .filter((article) => !isAuditDoneToday(article))
        .map((article) => {
          const audit = auditMap[article.id];

          const status: AuditStatus = audit?.status || "pending";

          return {
            item_id: Number(article.id),
            audit_result: status,
            checklist_note:
              status === "present"
                ? "Audit completed"
                : audit?.remark || "Not audited",
            missing_reason:
              status === "missing" || status === "pending"
                ? audit?.remark || "Not audited"
                : undefined,
          };
        });

      if (!items.length) {
        alert("All selected items are already audited today.");
        return;
      }

      const payload = {
        submit: false,
        items,
      };

      console.log("FINAL AUDIT PAYLOAD:", JSON.stringify(payload, null, 2));

      const result = await createDailyAudit(payload);
      setAuditMode(false);
      setAuditMap({});

      console.log("AUDIT RESPONSE:", result);

      const auditedAt = new Date().toISOString();

      setReportedArticles((prev) => {
        const next = { ...prev };

        items.forEach((item) => {
          next[String(item.item_id)] = true;
        });

        return next;
      });

      setRows((prev) =>
        prev.map((row) => ({
          ...row,
          articles: row.articles?.map((article) =>
            items.some((item) => String(item.item_id) === article.id)
              ? {
                ...article,
                isItemAudit: true,
                itemAuditAt: auditedAt,
              }
              : article
          ),
        }))
      );

      alert(result?.message || "Audit saved successfully");
    } catch (error) {
      console.error("AUDIT ERROR:", error);
      alert(error instanceof Error ? error.message : "Failed to save audit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddStock = () => {
    const scope = getDistrictScope();

    setAddStockError("");

    if (!scope.store_code) {
      setAddStockError("District store_code missing. Please login again.");
      setAddStockOpen(true);
      return;
    }

    if (!scope.organization_id) {
      setAddStockError("District organization_id missing. Please login again.");
      setAddStockOpen(true);
      return;
    }

    setAddStockOpen(true);
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <StockStatCards
        stats={[
          {
            id: "1",
            title: "Total Stock Items",
            value: summary.total_stock_items,
            tone: "gold",
            icon: "box",
            changeTone: "green",
          },
          {
            id: "2",
            title: "Dead Stock Items",
            value: summary.dead_stock_items,
            tone: "red",
            icon: "badge",
            changeTone: "red",
          },
          {
            id: "3",
            title: "Low Stock Items",
            value: summary.low_stock_items,
            tone: "soft-red",
            icon: "arrow",
          },
          {
            id: "4",
            title: "Transit Goods",
            value: summary.transit_goods,
            tone: "purple",
            icon: "truck",
          },
        ]}
      />

      <StockManagementToolbar
        selectedCount={auditedCount}
        auditMode={auditMode}
        onCreateReport={handleAuditButtonClick}
        onAddItem={handleOpenAddStock}
        onUploadStock={handleUploadStock}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        submitting={submitting}
        uploadLoading={uploadLoading}
      />

      {pageError ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {pageError}
        </div>
      ) : null}

      <StockManagementTable
        rows={rows}
        auditMode={auditMode}
        loading={loading}
        loadingRowCategory={loadingRowCategory}
        auditMap={auditMap}
        setAuditMap={setAuditMap}
        reportedArticles={reportedArticles}
        searchValue={searchValue}
        selectedCategory={selectedCategory}
        onLoadArticles={handleLoadArticles}
      />

      <DistrictAddStockPopup
        open={addStockOpen}
        loading={addStockLoading}
        error={addStockError}
        onClose={() => {
          if (addStockLoading) return;

          setAddStockOpen(false);
          setAddStockError("");
        }}
        onSubmit={handleAddStockSubmit}
      />
    </div>
  );
}