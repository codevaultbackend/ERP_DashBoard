"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  trackingApi,
  BatchTrackingResponse,
} from "../lib/tracking";

interface UseBatchTrackingReturn {
  data: BatchTrackingResponse["data"] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBatchTracking(
  batchId?: number
): UseBatchTrackingReturn {
  const [data, setData] =
    useState<
      BatchTrackingResponse["data"] | null
    >(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const requestIdRef =
    useRef(0);

  const fetchTracking =
    useCallback(async () => {
      console.log(
        "🔍 useBatchTracking called",
        {
          batchId,
        }
      );

      /**
       * IMPORTANT:
       * Initial render pe batchId undefined
       * hona normal hai.
       *
       * Isko error nahi banana.
       */
      if (
        batchId === undefined ||
        batchId === null ||
        Number.isNaN(batchId)
      ) {
        console.warn(
          "⏳ Waiting for valid batchId",
          batchId
        );

        setLoading(false);
        setError(null);
        setData(null);

        return;
      }

      const requestId =
        ++requestIdRef.current;

      try {
        setLoading(true);
        setError(null);

        console.log(
          "🚀 Calling Tracking API",
          {
            batchId,
            requestId,
          }
        );

        const response =
          await trackingApi.getBatchFinalDestinations(
            batchId
          );

        console.log(
          "✅ Tracking API Response",
          response
        );

        if (
          requestId !==
          requestIdRef.current
        ) {
          console.warn(
            "⚠️ Stale response ignored"
          );

          return;
        }

        if (!response) {
          throw new Error(
            "No response received from API"
          );
        }

        if (
          response.success ===
          false
        ) {
          throw new Error(
            response.message ||
              "Tracking API returned success=false"
          );
        }

        if (!response.data) {
          throw new Error(
            "Tracking API returned empty data"
          );
        }

        console.log(
          "📦 Batch:",
          response.data.batch
        );

        console.log(
          "📍 Destinations:",
          response.data
            .final_destinations
            ?.length ?? 0
        );

        console.log(
          "🚚 Movements:",
          response.data
            .movement_history
            ?.length ?? 0
        );

        setData(response.data);
      } catch (err) {
        console.error(
          "❌ Tracking API Error",
          err
        );

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch tracking data";

        setError(message);
        setData(null);
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setLoading(false);
        }

        console.log(
          "🏁 Tracking Request Completed"
        );
      }
    }, [batchId]);

  useEffect(() => {
    console.log(
      "🔄 Batch ID Changed:",
      batchId
    );

    fetchTracking();
  }, [
    batchId,
    fetchTracking,
  ]);

  return {
    data,
    loading,
    error,
    refetch: fetchTracking,
  };
}
