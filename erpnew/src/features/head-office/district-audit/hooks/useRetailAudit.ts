"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getStores,
  getDistrictAudits,
  getRetailAudits,
  filterAuditsByStore,
  filterAuditsByDate,
  searchRetailAudits,
} from "../api/merge-audit-api";

import type {
  RetailAudit,
  RetailAuditStore,
} from "../types/retail-audit.types";

type Filters = {
  search: string;
  retailStoreId: number | null;
  date: string;
};

export function useRetailAudit() {
  const [districtStores, setDistrictStores] =
    useState<RetailAuditStore[]>([]);

  const [retailStores, setRetailStores] =
    useState<RetailAuditStore[]>([]);

  const [audits, setAudits] = useState<RetailAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false)

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [filters, setFilters] =
    useState<Filters>({
      search: "",
      retailStoreId: null,
      date: "",
    });

  /* -------------------------------------------------------------------------- */
  /*                           FETCH DISTRICT STORES                            */
  /* -------------------------------------------------------------------------- */

  const fetchDistrictStores =
    useCallback(async () => {
      try {
        const data =
          await getStores("district");

        const stores =
          Array.isArray(data)
            ? data
            : [];

        setDistrictStores(stores);

        return stores;
      } catch (err: any) {
        const message =
          err?.response?.data
            ?.message ||
          err?.message ||
          "Failed to load district stores";

        setError(message);

        setDistrictStores([]);

        throw err;
      }
    }, []);

  const fetchDistrictAudits =
    useCallback(
      async (
        storeCode: string
      ) => {
        try {
          setAuditLoading(true);

          const data =
            await getDistrictAudits(
              storeCode
            );

          const audits =
            Array.isArray(data)
              ? data
              : [];

          setAudits(audits);

          return audits;
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load audits";

          setError(message);
          setAudits([]);
        } finally {
          setAuditLoading(false);
        }
      },
      []
    );
  /* -------------------------------------------------------------------------- */
  /*                            FETCH RETAIL STORES                             */
  /* -------------------------------------------------------------------------- */

  const fetchRetailStores =
    useCallback(async () => {
      try {
        const data =
          await getStores("retail");

        const stores =
          Array.isArray(data)
            ? data
            : [];

        setRetailStores(stores);

        return stores;
      } catch (err: any) {
        console.error(
          "Failed to load retail stores",
          err
        );

        setRetailStores([]);

        throw err;
      }
    }, []);


  const fetchRetailStoreAudits =
  useCallback(async (storeCode: string) => {
    try {
      setAuditLoading(true);

      const data =
        await getRetailAudits(
          storeCode
        );

      const audits =
        Array.isArray(data)
          ? data
          : [];

      setAudits(audits);

      return audits;
    } finally {
      setAuditLoading(false);
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
          fetchDistrictStores(),
          fetchRetailStores(),
        ]);
      } catch (err) {
        console.error(
          "Store loading failed",
          err
        );
      } finally {
        setLoading(false);
      }
    }, [
      fetchDistrictStores,
      fetchRetailStores,
    ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* -------------------------------------------------------------------------- */
  /*                                 REFRESH                                    */
  /* -------------------------------------------------------------------------- */

  const refresh =
    useCallback(async () => {
      try {
        setRefreshing(true);

        await Promise.all([
          fetchDistrictStores(),
          fetchRetailStores(),
        ]);
      } finally {
        setRefreshing(false);
      }
    }, [
      fetchDistrictStores,
      fetchRetailStores,
    ]);

  /* -------------------------------------------------------------------------- */
  /*                                  FILTERS                                   */
  /* -------------------------------------------------------------------------- */

  const updateSearch =
    useCallback(
      (value: string) => {
        setFilters((prev) => ({
          ...prev,
          search: value,
        }));
      },
      []
    );

  const updateStore = useCallback(
    (value: number | null) => {
      setFilters((prev) => ({
        ...prev,
        retailStoreId: value,
      }));
    },
    []
  );

  const filteredAudits =
    useMemo(() => {
      let result = [...audits];

      result = filterAuditsByStore(
        result,
        filters.retailStoreId
      );

      result = filterAuditsByDate(
        result,
        filters.date
      );

      result = searchRetailAudits(
        result,
        filters.search
      );

      return result;
    }, [
      audits,
      filters.retailStoreId,
      filters.date,
      filters.search,
    ]);

  const updateDate =
    useCallback(
      (value: string) => {
        setFilters((prev) => ({
          ...prev,
          date: value,
        }));
      },
      []
    );

  const clearFilters =
    useCallback(() => {
      setFilters({
        search: "",
        retailStoreId:
          null,
        date: "",
      });
    }, []);

  /* -------------------------------------------------------------------------- */
  /*                        FILTER DISTRICT STORES                              */
  /* -------------------------------------------------------------------------- */

  const filteredDistrictStores =
    useMemo(() => {
      let result = [
        ...districtStores,
      ];

      if (
        filters.search.trim()
      ) {
        const search =
          filters.search.toLowerCase();

        result =
          result.filter(
            (store) =>
              store.store_name
                ?.toLowerCase()
                .includes(
                  search
                ) ||
              store.store_code
                ?.toLowerCase()
                .includes(
                  search
                )
          );
      }

      return result;
    }, [
      districtStores,
      filters.search,
    ]);

  return {
    districtStores,
    retailStores,
    audits,
    filteredDistrictStores,
    filteredAudits,
    loading,
    refreshing,
    auditLoading,
    error,

    filters,

    updateSearch,
    updateStore,
    updateDate,
    clearFilters,

    refresh,
    loadData,

    fetchDistrictAudits,
    fetchRetailStoreAudits,
  };
}

