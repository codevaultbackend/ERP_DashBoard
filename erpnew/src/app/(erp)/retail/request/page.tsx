"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RequestTopHeader from "@/features/retail/request/components/RequestTopHeader";
import RequestStatCards from "@/features/retail/request/components/RequestStatCards";
import LowStockAlert from "@/features/retail/request/components/LowStockAlert";
import EmptyStockRequests from "@/features/retail/request/components/EmptyStockRequests";
import StockRequestCard from "@/features/retail/request/components/StockRequestCard";
import RequestStockModal from "@/features/retail/request/components/RequestStockModal";
import ApproveDispatchModal from "@/features/retail/request/components/ApproveDispatchModal";
import {
  getMyStockRequests,
  getReceivedStockRequests,
  type StockRequestApi,
} from "@/features/retail/request/api/request-api";

function getStoreIdFromLocalStorage(): string | number {
  if (typeof window === "undefined") return "";

  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return "";

    const user = JSON.parse(rawUser);

    return (
      user?.store_id ||
      user?.storeId ||
      user?.retail_store_id ||
      user?.branch_id ||
      user?.organization_id ||
      ""
    );
  } catch {
    return "";
  }
}

export type RequestCardProduct = {
  name: string;
  qty: number;
};

export type RequestCardData = {
  id: string;
  requestId: number;
  priority: string;
  created: string;
  status: "approved" | "dispatch" | "pending";
  notes?: string;
  products: RequestCardProduct[];
  raw: StockRequestApi;
};

function formatDate(value?: string) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCardStatus(
  req: StockRequestApi,
  type: "mine" | "received"
): RequestCardData["status"] {
  const status = String(req.status || "").toLowerCase();

  if (
    status.includes("dispatch") ||
    status.includes("dispatched") ||
    status.includes("transit")
  ) {
    return "dispatch";
  }

  if (status.includes("approved")) {
    return type === "received" ? "dispatch" : "approved";
  }

  return "pending";
}

function mapRequestToCard(
  req: StockRequestApi,
  type: "mine" | "received"
): RequestCardData {
  return {
    id: req.request_no || `req${req.id}`,
    requestId: Number(req.id),
    priority: req.priority || "medium",
    created: formatDate(req.created_at),
    status: getCardStatus(req, type),
    notes: req.notes || "",
    raw: req,
    products: Array.isArray(req.request_items)
      ? req.request_items.map((item) => ({
          name:
            item?.item?.item_name ||
            item?.item?.article_code ||
            item?.item?.sku_code ||
            `Item ${item.item_id}`,
          qty: Number(item.request_qty || item.qty || 0),
        }))
      : [],
  };
}

export default function RetailRequestPage() {
  const [loading, setLoading] = useState(true);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const [openNewRequest, setOpenNewRequest] = useState(false);
  const [openApproveModal, setOpenApproveModal] = useState(false);

  const [selectedDispatchRequest, setSelectedDispatchRequest] =
    useState<StockRequestApi | null>(null);

  const [storeId, setStoreId] = useState<string | number>("");
  const [myRequests, setMyRequests] = useState<StockRequestApi[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<StockRequestApi[]>(
    []
  );
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    setStoreId(getStoreIdFromLocalStorage());
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const [mineRes, receivedRes] = await Promise.all([
        getMyStockRequests(),
        getReceivedStockRequests(),
      ]);

      setMyRequests(Array.isArray(mineRes?.data) ? mineRes.data : []);
      setReceivedRequests(
        Array.isArray(receivedRes?.data) ? receivedRes.data : []
      );
    } catch (err: any) {
      setPageError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load stock requests"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const myRequestCards = useMemo(
    () => myRequests.map((req) => mapRequestToCard(req, "mine")),
    [myRequests]
  );

  const receivedRequestCards = useMemo(
    () => receivedRequests.map((req) => mapRequestToCard(req, "received")),
    [receivedRequests]
  );

  return (
    <div className="min-h-screen bg-erp-page font-erp">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="space-y-6">
          <RequestTopHeader onOpenNewRequest={() => setOpenNewRequest(true)} />

          <RequestStatCards
            totalRequests={450}
            approvedRequests={20}
            lowStock={24}
            transitGoods={150}
          />

          <LowStockAlert onRequestStock={() => setOpenNewRequest(true)} />

          {pageError ? (
            <div className="rounded-erp-xl border border-red-200 bg-red-50 px-5 py-4 text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-red-700">
              {pageError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="min-w-0">
              <h2 className="erp-section-title mb-5">My Stock Requests</h2>

              {loading ? (
                <div className="h-[270px] rounded-erp-xl border border-erp-border bg-erp-card p-6 shadow-erp-card">
                  <div className="h-full animate-pulse rounded-erp-lg bg-erp-border-soft" />
                </div>
              ) : myRequestCards.length === 0 ? (
                <EmptyStockRequests onCreate={() => setOpenNewRequest(true)} />
              ) : (
                <div className="space-y-4">
                  {myRequestCards.map((item) => (
                    <StockRequestCard
                      key={item.requestId}
                      item={item}
                      compact={false}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="min-w-0">
              <h2 className="erp-section-title mb-5">Received Requests</h2>

              {loading ? (
                <div className="h-[270px] rounded-erp-xl border border-erp-border bg-erp-card p-6 shadow-erp-card">
                  <div className="h-full animate-pulse rounded-erp-lg bg-erp-border-soft" />
                </div>
              ) : receivedRequestCards.length === 0 ? (
                <div className="flex h-[270px] items-center justify-center rounded-erp-xl border border-erp-border bg-erp-card text-[15px] font-medium leading-[22px] tracking-[-0.02em] text-erp-muted shadow-erp-card">
                  No received requests yet
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedRequestCards.map((item) => (
                    <StockRequestCard
                      key={item.requestId}
                      item={item}
                      compact={false}
                      onDispatch={() => {
                        setSelectedDispatchRequest(item.raw);
                        setOpenApproveModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <RequestStockModal
        open={openNewRequest}
        onClose={() => setOpenNewRequest(false)}
        storeId={storeId}
        submitting={submittingRequest}
        setSubmitting={setSubmittingRequest}
        onSuccess={async () => {
          await loadAll();
          setOpenNewRequest(false);
        }}
      />

      <ApproveDispatchModal
        open={openApproveModal}
        onClose={() => {
          setOpenApproveModal(false);
          setSelectedDispatchRequest(null);
        }}
        request={selectedDispatchRequest}
        onSuccess={async () => {
          await loadAll();
          setOpenApproveModal(false);
          setSelectedDispatchRequest(null);
        }}
      />
    </div>
  );
}