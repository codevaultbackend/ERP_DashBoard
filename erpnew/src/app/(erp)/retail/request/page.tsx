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
    return user?.store_id || user?.storeId || user?.organization_id || "";
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
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mapRequestToCard(
  req: StockRequestApi,
  type: "mine" | "received"
): RequestCardData {
  const normalizedStatus = String(req.status || "").toLowerCase();

  let status: "approved" | "dispatch" | "pending" = "pending";

  if (type === "received") {
    status = "dispatch";
  } else if (normalizedStatus === "approved") {
    status = "approved";
  } else {
    status = "pending";
  }

  return {
    id: req.request_no || `req${req.id}`,
    requestId: req.id,
    priority: req.priority || "medium",
    created: formatDate(req.created_at),
    status,
    notes: req.notes || "",
    raw: req,
    products: Array.isArray(req.request_items)
      ? req.request_items.map((item) => ({
          name:
            item?.item?.item_name ||
            item?.item?.article_code ||
            item?.item?.sku_code ||
            `Item ${item.item_id}`,
          qty: Number(item.request_qty || 0),
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

  const [myRequests, setMyRequests] = useState<StockRequestApi[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<StockRequestApi[]>([]);
  const [pageError, setPageError] = useState("");

  const storeId = useMemo(() => getStoreIdFromLocalStorage(), []);

  const loadAll = useCallback(async () => {
    try {
      setPageError("");

      const [mineRes, receivedRes] = await Promise.all([
        getMyStockRequests(),
        getReceivedStockRequests(),
      ]);

      const mineRows = Array.isArray(mineRes?.data) ? mineRes.data : [];
      const receivedRows = Array.isArray(receivedRes?.data)
        ? receivedRes.data
        : [];

      setMyRequests(mineRows);
      setReceivedRequests(receivedRows);
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
    <div className="min-h-screen ">
      <div className="mx-auto w-full max-w-[1600px] ">
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
            <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
              {pageError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
            <section className="min-w-0">
              {loading ? (
                <div>
                  <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.03em] text-[#172033] sm:text-[26px]">
                    My Stock Requests
                  </h2>
                  <div className="rounded-[30px] border border-[#E4E7EC] bg-white p-6">
                    <div className="h-[240px] animate-pulse rounded-[18px] bg-[#F2F4F7]" />
                  </div>
                </div>
              ) : myRequestCards.length === 0 ? (
                <EmptyStockRequests onCreate={() => setOpenNewRequest(true)} />
              ) : (
                <div>
                  <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.03em] text-[#172033] sm:text-[26px]">
                    My Stock Requests
                  </h2>

                  <div className="space-y-4">
                    {myRequestCards.map((item) => (
                      <StockRequestCard
                        key={item.requestId}
                        item={item}
                        compact={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="min-w-0">
              <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.03em] text-[#172033] sm:text-[26px]">
                Received Requests
              </h2>

              {loading ? (
                <div className="rounded-[30px] border border-[#E4E7EC] bg-white p-6">
                  <div className="h-[240px] animate-pulse rounded-[18px] bg-[#F2F4F7]" />
                </div>
              ) : receivedRequestCards.length === 0 ? (
                <div className="rounded-[30px] border border-[#E4E7EC] bg-[#FCFCFD] px-5 py-12 text-center text-[16px] text-[#556274] shadow-[0px_4px_14px_rgba(15,23,42,0.035)]">
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
        onSuccess={loadAll}
      />

      <ApproveDispatchModal
        open={openApproveModal}
        onClose={() => {
          setOpenApproveModal(false);
          setSelectedDispatchRequest(null);
        }}
        request={selectedDispatchRequest}
        onSuccess={loadAll}
      />
    </div>
  );
}