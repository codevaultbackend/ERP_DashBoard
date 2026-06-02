"use client";

import {
  useCallback,
  useState,
} from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://erp-backend-w3pb.onrender.com";

export interface ItemBatch {
  batch_id: number;
  batch_no: string;
  item_id: number;

  current_store_name: string;
  current_store_code: string;
  current_organization_level: string;

  current_total_qty: number;
  current_total_weight: number;

  created_at: string;
}

export function useItemBatchesByDate() {
  const [batches, setBatches] =
    useState<ItemBatch[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const fetchByDate =
    useCallback(
      async (
        itemId: number,
        date: string
      ) => {
        try {
          setLoading(true);
          setError(null);

          const token =
            localStorage.getItem(
              "token"
            ) ||
            localStorage.getItem(
              "accessToken"
            );

          const response =
            await fetch(
              `${API_BASE}/item-tracker/items/${itemId}/batches-by-date?date=${date}`,
              {
                headers: {
                  ...(token
                    ? {
                        Authorization: `Bearer ${token}`,
                      }
                    : {}),
                },
              }
            );

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result.message
            );
          }

          setBatches(
            result.data || []
          );

          return result.data || [];
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed"
          );

          setBatches([]);

          return [];
        } finally {
          setLoading(false);
        }
      },
      []
    );

  return {
    batches,
    loading,
    error,
    fetchByDate,
  };
}