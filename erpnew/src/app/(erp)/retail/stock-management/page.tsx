"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import StockStatCards from "../../../../features/retail/StockManagement/components/StockStatCards";
import StockManagementToolbar from "../../../../features/retail/StockManagement/components/StockManagementToolbar";
import StockManagementTable from "../../../../features/retail/StockManagement/components/StockManagementTable";
import StockAuditPopup from "../../../../features/retail/StockManagement/components/StockAuditPopup";

import {
  createDailyAudit,
  type AuditStatus,
} from "../../../../features/retail/StockManagement/api/audit-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  article_code: string;
  sku_code: string;
  item_name: string;
  category: string;
  purity: string;
  gross_weight: number;
  net_weight: number;
  stone_weight: number;
  quantity: number;
  available_qty: number;
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

function safeText(value: unknown, fallback = "--") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function safeWeight(value: unknown) {
  if (value === null || value === undefined || value === "") return "--";
  return `${value} g`;
}

function safePrice(value: unknown) {
  if (value === null || value === undefined || value === "") return "--";
  return `₹${value}`;
}

function mapCategoryRowsToStockRows(rows: StockCategoryRowApi[]): StockRow[] {
  return rows.map((row, index) => ({
    id: index + 1,
    category: safeText(row.category),
    code: safeText(row.code),
    quantity: Number(row.quantity || 0),
    sellingPrice: safePrice(row.selling_price),
    makingCharge: safePrice(row.making_charge),
    purity: safeText(row.purity),
    netWeight: safeWeight(row.net_weight),
    stoneWeight: safeWeight(row.stone_weight),
    grossWeight: safeWeight(row.gross_weight),
    image: "/images/placeholder-product.png",
    articles: [],
  }));
}

function mapCategoryItemsToArticles(rows: StockCategoryItemApi[]): StockArticle[] {
  return rows.map((row) => ({
    id: String(row.id), // IMPORTANT: this is backend item_id
    image: "/images/placeholder-product.png",
    article: safeText(row.item_name),
    code: safeText(row.article_code || row.sku_code),
    quantity: Number(row.available_qty ?? row.quantity ?? 0),
    purity: safeText(row.purity),
    netWeight: safeWeight(row.net_weight),
    stoneWeight: safeWeight(row.stone_weight),
    grossWeight: safeWeight(row.gross_weight),
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

export default function StockManagementPage() {
  const [rows, setRows] = useState<StockRow[]>([]);

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

  const [selectedArticles, setSelectedArticles] = useState<
    Record<string, boolean>
  >({});
  const [reportedArticles, setReportedArticles] = useState<
    Record<string, boolean>
  >({});

  const [popupOpen, setPopupOpen] = useState(false);
  const [auditStatus, setAuditStatus] = useState<AuditStatus>("present");
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const storedSelected = sessionStorage.getItem("selected-audit-items");
    const storedReported = sessionStorage.getItem("submitted-audit-items");

    if (storedSelected) {
      try {
        const parsed: string[] = JSON.parse(storedSelected);
        const mapped = parsed.reduce<Record<string, boolean>>((acc, id) => {
          acc[id] = true;
          return acc;
        }, {});
        setSelectedArticles(mapped);
      } catch {
        sessionStorage.removeItem("selected-audit-items");
      }
    }

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
  }, []);

  useEffect(() => {
    const selectedIds = Object.keys(selectedArticles).filter(
      (id) => selectedArticles[id]
    );

    sessionStorage.setItem("selected-audit-items", JSON.stringify(selectedIds));
  }, [selectedArticles]);

  useEffect(() => {
    const reportedIds = Object.keys(reportedArticles).filter(
      (id) => reportedArticles[id]
    );

    sessionStorage.setItem("submitted-audit-items", JSON.stringify(reportedIds));
  }, [reportedArticles]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(rows.map((row) => row.category)));
    return ["All", ...unique];
  }, [rows]);

  const allArticles = useMemo(() => {
    return rows.flatMap((row) => row.articles ?? []);
  }, [rows]);

  const selectedIds = useMemo(() => {
    return Object.keys(selectedArticles).filter(
      (id) => selectedArticles[id] && !reportedArticles[id]
    );
  }, [selectedArticles, reportedArticles]);

  const selectedCount = useMemo(() => {
    return allArticles.filter(
      (article) => selectedArticles[article.id] && !reportedArticles[article.id]
    ).length;
  }, [allArticles, selectedArticles, reportedArticles]);

  const handleToggleArticle = (articleId: string) => {
    if (reportedArticles[articleId]) return;

    setSelectedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  const handleOpenAuditPopup = () => {
    if (!selectedIds.length) return;
    setPopupOpen(true);
  };

  const handleSubmitAudit = async () => {
    if (!selectedIds.length) return;

    try {
      setSubmitting(true);

      await createDailyAudit({
        submit: true,
        remark,
        items: selectedIds.map((id) => ({
          item_id: id,
          audit_result: auditStatus,
          checklist_note: remark || undefined,
          missing_reason:
            auditStatus === "missing" && remark ? remark : undefined,
        })),
      });

      setReportedArticles((prev) => {
        const next = { ...prev };

        selectedIds.forEach((id) => {
          next[id] = true;
        });

        return next;
      });

      setSelectedArticles((prev) => {
        const next = { ...prev };

        selectedIds.forEach((id) => {
          next[id] = false;
        });

        return next;
      });

      setPopupOpen(false);
      setAuditStatus("present");
      setRemark("");
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit audit"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadArticles = async (category: string) => {
    const existingRow = rows.find((row) => row.category === category);
    if (existingRow?.articles?.length) return;

    try {
      setLoadingRowCategory(category);

      const res = await getRetailStockItemsByCategory(category);
      const apiRows: StockCategoryItemApi[] = Array.isArray(res?.data)
        ? res.data
        : [];

      const articles = mapCategoryItemsToArticles(apiRows);

      setRows((prev) =>
        prev.map((row) =>
          row.category === category
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
            change: "+12.5%",
            changeTone: "green",
          },
          {
            id: "2",
            title: "Dead Stock Items",
            value: summary.dead_stock_items,
            tone: "red",
            icon: "badge",
            change: "+12.5%",
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
        selectedCount={selectedCount}
        onCreateReport={handleOpenAuditPopup}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
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
        selectedArticles={selectedArticles}
        reportedArticles={reportedArticles}
        onToggleArticle={handleToggleArticle}
        searchValue={searchValue}
        selectedCategory={selectedCategory}
        onLoadArticles={handleLoadArticles}
      />

      <StockAuditPopup
        open={popupOpen}
        selectedCount={selectedIds.length}
        auditStatus={auditStatus}
        remark={remark}
        submitting={submitting}
        onClose={() => setPopupOpen(false)}
        onStatusChange={setAuditStatus}
        onRemarkChange={setRemark}
        onSubmit={handleSubmitAudit}
      />
    </div>
  );
}