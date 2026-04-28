"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import RequestStatCards from "@/features/retail/request/components/RequestStatCards";
import RequestTopHeader from "@/features/retail/request/components/RequestTopHeader";
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

export type RequestCardProduct = {
  name: string;
  qty: number;
  approvedQty?: number;
};

export type RequestCardData = {
  id: string;
  requestId: number;
  priority: string;
  created: string;
  status:
  | "approved"
  | "dispatch"
  | "pending"
  | "partially_approved"
  | "rejected"
  | "completed";
  category?: string;
  notes?: string;
  products: RequestCardProduct[];
  raw: StockRequestApi;
};

type StatusFilter =
  | "all"
  | "pending"
  | "approved"
  | "partially_approved"
  | "rejected"
  | "completed"
  | "dispatch";

type PriorityFilter = "all" | "low" | "medium" | "high";

function getStoreIdFromLocalStorage(): string | number {
  if (typeof window === "undefined") return "";

  try {
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;

    return (
      user?.store_id ||
      user?.storeId ||
      user?.organization_id ||
      localStorage.getItem("store_id") ||
      localStorage.getItem("organization_id") ||
      ""
    );
  } catch {
    return localStorage.getItem("store_id") || "";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeStatus(req: StockRequestApi, type: "mine" | "received") {
  const status = String(req.status || "pending").toLowerCase();

  if (type === "received") {
    if (req.transfer?.status === "in_transit") return "dispatch";
    if (status === "approved" || status === "partially_approved") return "dispatch";
  }

  if (
    status === "approved" ||
    status === "pending" ||
    status === "partially_approved" ||
    status === "rejected" ||
    status === "completed"
  ) {
    return status;
  }

  return "pending";
}

function mapRequestToCard(
  req: StockRequestApi,
  type: "mine" | "received"
): RequestCardData {
  return {
    id: req.request_no || `req${req.id}`,
    requestId: req.id,
    priority: req.priority || "medium",
    created: formatDate(req.created_at || (req as any).createdAt),
    status: normalizeStatus(req, type),
    category: req.category || "",
    notes: req.notes || req.remarks || "",
    raw: req,
    products: Array.isArray(req.request_items)
      ? req.request_items.map((item) => ({
        name:
          item?.item?.item_name ||
          item?.item?.article_code ||
          item?.item?.sku_code ||
          `Item ${item.item_id}`,
        qty: Number(item.request_qty || 0),
        approvedQty: Number(item.approved_qty || 0),
      }))
      : [],
  };
}

function filterCards(
  cards: RequestCardData[],
  search: string,
  status: StatusFilter,
  priority: PriorityFilter
) {
  const query = search.trim().toLowerCase();

  return cards.filter((card) => {
    const text = [
      card.id,
      card.priority,
      card.status,
      card.category,
      card.notes,
      ...card.products.map((p) => p.name),
    ]
      .join(" ")
      .toLowerCase();

    const matchSearch = !query || text.includes(query);
    const matchStatus = status === "all" || card.status === status;
    const matchPriority = priority === "all" || card.priority === priority;

    return matchSearch && matchStatus && matchPriority;
  });
}

export default function DistrictRequestPage() {
  const [openNewRequest, setOpenNewRequest] = useState(false);
  const [openApproveDispatch, setOpenApproveDispatch] = useState(false);
  const [selectedDispatchRequest, setSelectedDispatchRequest] =
    useState<StockRequestApi | null>(null);

  const [loading, setLoading] = useState(true);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [pageError, setPageError] = useState("");

  const [myRequests, setMyRequests] = useState<StockRequestApi[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<StockRequestApi[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  const storeId = useMemo(() => getStoreIdFromLocalStorage(), []);

  const loadAllRequests = useCallback(async () => {
    try {
      setLoading(true);
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
    loadAllRequests();
  }, [loadAllRequests]);

  const myRequestCards = useMemo(
    () => myRequests.map((req) => mapRequestToCard(req, "mine")),
    [myRequests]
  );

  const receivedRequestCards = useMemo(
    () => receivedRequests.map((req) => mapRequestToCard(req, "received")),
    [receivedRequests]
  );

  const filteredMyRequests = useMemo(
    () => filterCards(myRequestCards, search, statusFilter, priorityFilter),
    [myRequestCards, search, statusFilter, priorityFilter]
  );

  const filteredReceivedRequests = useMemo(
    () =>
      filterCards(receivedRequestCards, search, statusFilter, priorityFilter),
    [receivedRequestCards, search, statusFilter, priorityFilter]
  );

  const approvedRequests = myRequests.filter((req) =>
    ["approved", "completed", "partially_approved"].includes(
      String(req.status || "").toLowerCase()
    )
  ).length;

  const transitGoods = myRequests.reduce((sum, req) => {
    if (req.transfer?.status !== "in_transit") return sum;

    return (
      sum +
      (req.request_items || []).reduce(
        (total, item) => total + Number(item.request_qty || 0),
        0
      )
    );
  }, 0);

  const lowStock = 0;

  return (
    <>
      <div className="space-y-5">
        <RequestTopHeader onOpenNewRequest={() => setOpenNewRequest(true)} />

        <RequestStatCards
          totalRequests={myRequests.length}
          approvedRequests={approvedRequests}
          lowStock={lowStock}
          transitGoods={transitGoods}
        />

        <LowStockAlert
          count={lowStock}
          onRequestStock={() => setOpenNewRequest(true)}
        />

        <div className="flex flex-col gap-3 rounded-[24px] border border-[#E4E7EC] bg-white p-4 shadow-[0px_4px_14px_rgba(15,23,42,0.035)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-[44px] flex-1 items-center gap-3 rounded-full bg-[#F5F6F8] px-4">
            <Search className="h-5 w-5 text-[#98A2B3]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by request no, product, category, status..."
              className="w-full bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#98A2B3]"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 rounded-full bg-[#F5F6F8] px-4">
              <SlidersHorizontal className="h-4 w-4 text-[#667085]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-[44px] bg-transparent text-[14px] outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="partially_approved">Partially Approved</option>
                <option value="dispatch">Dispatch</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              className="h-[44px] rounded-full bg-[#F5F6F8] px-4 text-[14px] outline-none"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {pageError ? (
          <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
            {pageError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="min-w-0">
            {loading ? (
              <RequestSkeleton title="My Stock Requests" />
            ) : filteredMyRequests.length > 0 ? (
              <div>
                <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.03em] text-[#172033] sm:text-[26px]">
                  My Stock Requests
                </h2>

                <div className="max-h-[680px] space-y-4 overflow-y-auto pr-1">
                  {filteredMyRequests.map((item) => (
                    <StockRequestCard key={item.requestId} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyStockRequests onCreate={() => setOpenNewRequest(true)} />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.03em] text-[#172033] sm:text-[26px]">
              Received Requests
            </h2>

            {loading ? (
              <div className="rounded-[24px] border border-[#E4E7EC] bg-white p-4 sm:rounded-[30px] sm:p-6">
                <div className="h-[240px] animate-pulse rounded-[18px] bg-[#F2F4F7]" />
              </div>
            ) : filteredReceivedRequests.length > 0 ? (
              <div className="max-h-[680px] space-y-4 overflow-y-auto pr-1">
                {filteredReceivedRequests.map((item) => (
                 <StockRequestCard
  key={item.requestId}
  item={item}
  onDispatch={() => {
    const alreadyDispatched =
      item.raw?.transfer?.status === "in_transit" ||
      item.raw?.transfer?.status === "received" ||
      item.status === "dispatch";

    if (alreadyDispatched) return;

    setSelectedDispatchRequest(item.raw);
    setOpenApproveDispatch(true);
  }}
/>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-[#E4E7EC] bg-[#FCFCFD] px-5 py-10 text-center text-[16px] text-[#556274] shadow-[0px_4px_14px_rgba(15,23,42,0.035)] sm:rounded-[30px] sm:py-12">
                No received requests found
              </div>
            )}
          </div>
        </div>
      </div>

      <RequestStockModal
        open={openNewRequest}
        onClose={() => setOpenNewRequest(false)}
        storeId={storeId}
        submitting={submittingRequest}
        setSubmitting={setSubmittingRequest}
        onSuccess={loadAllRequests}
      />

      <ApproveDispatchModal
        open={openApproveDispatch}
        onClose={() => {
          setOpenApproveDispatch(false);
          setSelectedDispatchRequest(null);
        }}
        request={selectedDispatchRequest}
        onSuccess={loadAllRequests}
      />
    </>
  );
}

function RequestSkeleton({ title }: { title: string }) {
  return (
    <div>
      <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.03em] text-[#172033] sm:text-[26px]">
        {title}
      </h2>
      <div className="rounded-[24px] border border-[#E4E7EC] bg-white p-4 sm:rounded-[30px] sm:p-6">
        <div className="h-[240px] animate-pulse rounded-[18px] bg-[#F2F4F7]" />
      </div>
    </div>
  );
}