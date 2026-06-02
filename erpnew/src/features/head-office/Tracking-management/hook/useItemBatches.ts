"use client";

import {
  useCallback,
  useEffect,
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

interface BatchApiResponse {
  success?: boolean;
  message?: string;
  data?: ItemBatch[];
}

export function useItemBatches(
  itemId?: number
) {
  const [batches, setBatches] =
    useState<ItemBatch[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const fetchBatches =
    useCallback(async () => {
      console.log(
        "🔍 useItemBatches called",
        {
          itemId,
        }
      );

      if (
        !itemId ||
        Number.isNaN(itemId)
      ) {
        console.warn(
          "❌ Invalid itemId",
          itemId
        );

        setBatches([]);
        setError(
          "Invalid Item ID"
        );

        return;
      }

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

        console.log(
          "🔑 Token Found:",
          !!token
        );

        const url = `${API_BASE}/item-tracker/items/${itemId}/batches`;

        console.log(
          "🚀 Fetching Batches:",
          url
        );

        const response =
          await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
            cache: "no-store",
          });

        console.log(
          "📡 Response Status:",
          response.status
        );

        console.log(
          "📡 Response OK:",
          response.ok
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        console.log(
          "📡 Content-Type:",
          contentType
        );

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "❌ Non JSON Response:",
            text
          );

          throw new Error(
            "Server returned invalid response"
          );
        }

        const result: BatchApiResponse =
          await response.json();

        console.log(
          "✅ Batches API Response:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result.message ||
              `Request Failed (${response.status})`
          );
        }

        if (
          result.success ===
          false
        ) {
          throw new Error(
            result.message ||
              "API returned success=false"
          );
        }

        const batchData =
          Array.isArray(
            result.data
          )
            ? result.data
            : [];

        console.log(
          "📦 Batches Count:",
          batchData.length
        );

        console.log(
          "📦 Batches Data:",
          batchData
        );

        setBatches(batchData);
      } catch (err) {
        console.error(
          "❌ Batch Fetch Error:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch batches";

        setError(message);
        setBatches([]);
      } finally {
        setLoading(false);

        console.log(
          "🏁 Batch Fetch Completed"
        );
      }
    }, [itemId]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  return {
    batches,
    loading,
    error,
    refetch: fetchBatches,
  };
}