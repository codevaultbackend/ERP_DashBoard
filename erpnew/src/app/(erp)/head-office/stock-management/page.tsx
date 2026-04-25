"use client";

import { useEffect, useMemo, useState } from "react";
import StockStatCards from "../../../../features/retail/StockManagement/components/StockStatCards";
import StockManagementToolbar from "../../../../features/retail/StockManagement/components/StockManagementToolbar";
import StockManagementTable from "../../../../features/retail/StockManagement/components/StockManagementTable";
import { stockRows } from "../../../../features/retail/data/stock-management-data";

type StockArticle = {
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

type StockRow = {
  id: number;
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

export default function StockManagementPage() {
  const rows = stockRows as StockRow[];

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticles, setSelectedArticles] = useState<Record<string, boolean>>({});
  const [reportedArticles, setReportedArticles] = useState<Record<string, boolean>>({});

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
    const selectedIds = Object.keys(selectedArticles).filter((id) => selectedArticles[id]);
    sessionStorage.setItem("selected-audit-items", JSON.stringify(selectedIds));
  }, [selectedArticles]);

  useEffect(() => {
    const reportedIds = Object.keys(reportedArticles).filter((id) => reportedArticles[id]);
    sessionStorage.setItem("submitted-audit-items", JSON.stringify(reportedIds));
  }, [reportedArticles]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(rows.map((row) => row.category)));
    return ["All", ...unique];
  }, [rows]);

  const allArticles = useMemo(() => {
    return rows.flatMap((row) => row.articles ?? []);
  }, [rows]);

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

  const handleCreateReport = () => {
    const idsToSubmit = Object.keys(selectedArticles).filter(
      (id) => selectedArticles[id] && !reportedArticles[id]
    );

    if (!idsToSubmit.length) return;

    setReportedArticles((prev) => {
      const next = { ...prev };
      idsToSubmit.forEach((id) => {
        next[id] = true;
      });
      return next;
    });

    setSelectedArticles((prev) => {
      const next = { ...prev };
      idsToSubmit.forEach((id) => {
        next[id] = false;
      });
      return next;
    });
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <StockStatCards />

      <StockManagementToolbar
        selectedCount={selectedCount}
        onCreateReport={handleCreateReport}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <StockManagementTable
        selectedArticles={selectedArticles}
        reportedArticles={reportedArticles}
        onToggleArticle={handleToggleArticle}
        searchValue={searchValue}
        selectedCategory={selectedCategory}
      />
    </div>
  );
}