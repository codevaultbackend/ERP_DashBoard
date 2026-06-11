"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  downloadRetailAudit,
  filterAuditsByDate,
  filterAuditsByStore,
  getRetailAudits,
  getRetailStores,
  searchRetailAudits,
} from "../api/retail-audit-api";

import type {
  RetailAudit,
  RetailAuditStore,
} from "../types/retail-audit.types";

type Filters = {
  search: string;
  storeId: number | null;
  date: string;
};

export function useRetailAudit() {
  const [audits, setAudits] = useState<RetailAudit[]>([]);
  const [stores, setStores] = useState<RetailAuditStore[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [downloadingId, setDownloadingId] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  const [filters, setFilters] =
    useState<Filters>({
      search: "",
      storeId: null,
      date: "",
    });

  /* -------------------------------------------------------------------------- */
  /*                              FETCH AUDITS                                  */
  /* -------------------------------------------------------------------------- */

  const fetchAudits =
    useCallback(async () => {
      try {
        const data =
          await getRetailAudits();

        setAudits(
          Array.isArray(data)
            ? data
            : []
        );

        return data;
      } catch (err: any) {
        const message =
          err?.response?.data
            ?.message ||
          err?.message ||
          "Failed to load audits";

        setError(message);

        setAudits([]);

        throw err;
      }
    }, []);

  /* -------------------------------------------------------------------------- */
  /*                              FETCH STORES                                  */
  /* -------------------------------------------------------------------------- */

  const fetchStores =
    useCallback(async () => {
      try {
        const data =
          await getRetailStores();

        setStores(
          Array.isArray(data)
            ? data
            : []
        );

        return data;
      } catch (err) {
        console.error(
          "Failed to load stores:",
          err
        );

        setStores([]);

        throw err;
      }
    }, []);

  /* -------------------------------------------------------------------------- */
  /*                                LOAD DATA                                   */
  /* -------------------------------------------------------------------------- */

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        await Promise.all([
          fetchAudits(),
          fetchStores(),
        ]);
      } catch (err) {
        console.error(
          "Retail audit load error:",
          err
        );
      } finally {
        setLoading(false);
      }
    }, [
      fetchAudits,
      fetchStores,
    ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* -------------------------------------------------------------------------- */
  /*                                REFRESH                                     */
  /* -------------------------------------------------------------------------- */

  const refresh =
    useCallback(async () => {
      try {
        setRefreshing(true);
        setError("");

        await Promise.all([
          fetchAudits(),
          fetchStores(),
        ]);
      } catch (err) {
        console.error(
          "Refresh failed:",
          err
        );
      } finally {
        setRefreshing(false);
      }
    }, [
      fetchAudits,
      fetchStores,
    ]);

  /* -------------------------------------------------------------------------- */
  /*                               DOWNLOAD PDF                                 */
  /* -------------------------------------------------------------------------- */

  const handleDownload =
    useCallback(
      async (
        auditId: number
      ) => {
        try {
          setDownloadingId(
            auditId
          );

          await downloadRetailAudit(
            auditId
          );
        } catch (err) {
          console.error(
            "Download failed:",
            err
          );
        } finally {
          setDownloadingId(
            null
          );
        }
      },
      []
    );

  /* -------------------------------------------------------------------------- */
  /*                                FILTERS                                     */
  /* -------------------------------------------------------------------------- */

  const updateSearch =
    useCallback(
      (value: string) => {
        setFilters(
          (prev) => ({
            ...prev,
            search: value,
          })
        );
      },
      []
    );

  const updateStore =
    useCallback(
      (
        value:
          | number
          | null
      ) => {
        setFilters(
          (prev) => ({
            ...prev,
            storeId: value,
          })
        );
      },
      []
    );

  const updateDate =
    useCallback(
      (value: string) => {
        setFilters(
          (prev) => ({
            ...prev,
            date: value,
          })
        );
      },
      []
    );

  const clearFilters =
    useCallback(() => {
      setFilters({
        search: "",
        storeId: null,
        date: "",
      });
    }, []);

  /* -------------------------------------------------------------------------- */
  /*                             FILTERED AUDITS                                */
  /* -------------------------------------------------------------------------- */

  const filteredAudits =
    useMemo(() => {
      let result = [
        ...audits,
      ];

      result =
        searchRetailAudits(
          result,
          filters.search
        );

      result =
        filterAuditsByStore(
          result,
          filters.storeId
        );

      result =
        filterAuditsByDate(
          result,
          filters.date
        );

      return result;
    }, [
      audits,
      filters.search,
      filters.storeId,
      filters.date,
    ]);

  /* -------------------------------------------------------------------------- */
  /*                                METRICS                                     */
  /* -------------------------------------------------------------------------- */

  const metrics =
    useMemo(() => {
      const completed =
        audits.filter(
          (audit) =>
            ["completed", "approved"].includes(
              String(
                audit.status
              ).toLowerCase()
            )
        ).length;

      const pending =
        audits.filter(
          (audit) =>
            String(
              audit.status
            ).toLowerCase() ===
            "pending"
        ).length;

      const rejected =
        audits.filter(
          (audit) =>
            String(
              audit.status
            ).toLowerCase() ===
            "rejected"
        ).length;

      return {
        total:
          audits.length,
        completed,
        pending,
        rejected,
      };
    }, [audits]);

  /* -------------------------------------------------------------------------- */
  /*                                 RETURN                                     */
  /* -------------------------------------------------------------------------- */

  return {
    audits,
    filteredAudits,
    stores,

    loading,
    refreshing,
    downloadingId,
    error,

    metrics,
    filters,

    updateSearch,
    updateStore,
    updateDate,
    clearFilters,

    refresh,
    loadData,

    handleDownload,
  };
}