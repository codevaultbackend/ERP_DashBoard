"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import StockStatCards from "../../../../features/retail/StockManagement/components/StockStatCards";
import StockManagementToolbar from "../../../../features/retail/StockManagement/components/StockManagementToolbar";
import StockManagementTable from "../../../../features/retail/StockManagement/components/StockManagementTable";
import AddStockPopup, {
  type AddStockFormPayload,
} from "../../../../features/retail/StockManagement/components/AddStockPopup";

import {
  addStockItem,
  getStockApiErrorMessage,
  uploadStockInFile
} from "../../../../features/retail/StockManagement/api/stock-management-api";
import {
  createDailyAudit,
  type AuditStatus,
} from "../../../../features/retail/StockManagement/api/audit-api";
import DistrictAddStockPopup from "@/features/district/stock/component/DistrictAddStockPopup";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-backend-w3pb.onrender.com";

const stockApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

stockApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

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
  quantity?: number;
  available_qty?: number;
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

async function getRetailStockCategories(): Promise<StockListResponse> {
  const res = await stockApi.get("/stock/list");
  return res.data;
}

async function getRetailStockItemsByCategory(category: string) {
  const res = await stockApi.get(
    `/stock/category/${encodeURIComponent(category)}`
  );
  return res.data;
}

function isTodayAuditDone(article: StockArticle) {
  if (!article.isItemAudit || !article.itemAuditAt) return false;

  const auditDate = new Date(article.itemAuditAt);
  const today = new Date();

  return (
    auditDate.getFullYear() === today.getFullYear() &&
    auditDate.getMonth() === today.getMonth() &&
    auditDate.getDate() === today.getDate()
  );
}

export default function StockManagementPage() {
  const [rows, setRows] = useState<StockRow[]>([]);

  const [summary, setSummary] = useState<StockSummaryApi>({
    total_stock_items: 0,
    dead_stock_items: 0,
    low_stock_items: 0,
    transit_goods: 0,
  });

  const handleAddStockSubmit = async (payload: AddStockFormPayload) => {
    try {
      if (addStockLoading) return;

      setAddStockLoading(true);
      setAddStockError("");

      const result = await addStockItem(payload);

      if (!result?.success) {
        throw new Error(result?.message || "Failed to add stock item");
      }

      setAddStockOpen(false);
      setAddStockError("");

      await loadRetailRows();
    } catch (error) {
      setAddStockError(getStockApiErrorMessage(error));
    } finally {
      setAddStockLoading(false);
    }
  };

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
  const [uploadStockLoading, setUploadStockLoading] = useState(false);
  const [uploadStockError, setUploadStockError] = useState("");

  const loadRetailRows = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const res = await getRetailStockCategories();

      const apiRows = Array.isArray(res?.data) ? res.data : [];

      const apiSummary = res?.summary || {
        total_stock_items: 0,
        dead_stock_items: 0,
        low_stock_items: 0,
        transit_goods: 0,
      };

      setRows(mapCategoryRowsToStockRows(apiRows));
      setSummary(apiSummary);
    } catch (err: any) {
      setPageError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load retail stock"
      );

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
    loadRetailRows();
  }, [loadRetailRows]);


  const handleUploadStockFile = async (file: File) => {
    try {
      if (uploadStockLoading) return;

      setUploadStockLoading(true);
      setUploadStockError("");
      setPageError("");

      const allowedExtensions = [".xlsx", ".xls", ".csv", ".pdf"];
      const fileName = file.name.toLowerCase();

      const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));

      if (!isAllowed) {
        throw new Error("Only Excel, CSV, or PDF files are allowed.");
      }

      const maxSize = 15 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error("File size should be less than 15MB.");
      }

      const result = await uploadStockInFile(file);

      if (!result?.success) {
        throw new Error(result?.message || "Failed to upload stock file");
      }

      await loadRetailRows();

      alert(result?.message || "Stock uploaded successfully");
    } catch (error) {
      const message = getStockApiErrorMessage(error);

      setUploadStockError(message);
      alert(message);
    } finally {
      setUploadStockLoading(false);
    }
  };

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

  const handleLoadArticles = async (category: string) => {
    const existingRow = rows.find(
      (row) =>
        row.category?.toLowerCase().trim() === category?.toLowerCase().trim()
    );

    if (existingRow?.articles?.length) return;

    try {
      setLoadingRowCategory(category);

      const res = await getRetailStockItemsByCategory(category);

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
    } catch (err) {
      console.error("Failed to load retail category items", err);
    } finally {
      setLoadingRowCategory(null);
    }
  };

  const fetchArticlesForCategory = async (category: string) => {
    const res = await getRetailStockItemsByCategory(category);

    const apiRows: StockCategoryItemApi[] = Array.isArray(res?.data)
      ? res.data
      : [];

    return mapCategoryItemsToArticles(apiRows, category);
  };

  const getRowsForAudit = async () => {
    const targetRows =
      selectedCategory === "All"
        ? rows
        : rows.filter(
          (row) =>
            row.category?.toLowerCase().trim() ===
            selectedCategory?.toLowerCase().trim()
        );

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
      if (isTodayAuditDone(article)) return false;

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

  const handleCreateAudit = async () => {
    console.log(" AUDIT DEBUG START");

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
        .filter((article) => !isTodayAuditDone(article))
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

      console.log(" FINAL AUDIT PAYLOAD:", JSON.stringify(payload, null, 2));

      const result = await createDailyAudit(payload);

      console.log(" AUDIT RESPONSE:", result);

      setReportedArticles((prev) => {
        const next = { ...prev };

        articles.forEach((article) => {
          next[article.id] = true;
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
                itemAuditAt: new Date().toISOString(),
              }
              : article
          ),
        }))
      );

      alert(result?.message || "Audit saved successfully");
    } catch (err: any) {
      console.error("❌ AUDIT ERROR:", err?.message || err);
      alert(err?.message || "Failed to save audit");
    } finally {
      setSubmitting(false);
    }
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
        onCreateReport={handleCreateAudit}
        onAddItem={() => {
          setAddStockError("");
          setAddStockOpen(true);
        }}
        onUploadStock={handleUploadStockFile}
        uploadLoading={uploadStockLoading}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        submitting={submitting}
      />

      <DistrictAddStockPopup open={addStockOpen}
        loading={addStockLoading}
        error={addStockError}
        onClose={() => {
          if (addStockLoading) return;

          setAddStockOpen(false);
          setAddStockError("");
        }}
        onSubmit={handleAddStockSubmit}

      />

      {pageError ? (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {pageError}
        </div>
      ) : null}

      <StockManagementTable
        rows={rows}
        loading={loading}
        loadingRowCategory={loadingRowCategory}
        auditMap={auditMap}
        setAuditMap={setAuditMap}
        reportedArticles={reportedArticles}
        searchValue={searchValue}
        selectedCategory={selectedCategory}
        onLoadArticles={handleLoadArticles}
      />
    </div>
  );
}