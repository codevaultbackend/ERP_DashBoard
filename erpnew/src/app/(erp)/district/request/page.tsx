"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Flag, Search, SlidersHorizontal } from "lucide-react";

import RequestStatCards from "@/features/retail/request/components/RequestStatCards";
import RequestTopHeader from "@/features/retail/request/components/RequestTopHeader";
import LowStockAlert from "@/features/retail/request/components/LowStockAlert";
import EmptyStockRequests from "@/features/retail/request/components/EmptyStockRequests";
import StockRequestCard from "@/features/retail/request/components/StockRequestCard";
import DistrictRequestStockModal from "@/features/district/request/components/DistrictRequestStockModal";
import ApproveDispatchModal from "@/features/retail/request/components/ApproveDispatchModal";

import {
  getMyStockRequests,
  getReceivedStockRequests,
  type StockRequestApi,
} from "@/features/retail/request/api/request-api";
import TransferRequestModal from "@/features/district/request/components/TransferRequestModal";

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
  const [openTransferModal, setOpenTransferModal] = useState(false);

  const [selectedTransferRequest, setSelectedTransferRequest] =
    useState<StockRequestApi | null>(null);

  const [selectedRequestId, setSelectedRequestId] =
    useState<number | null>(null);

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

        <div className="rounded-3xl border border-[#E4E7EC] bg-white p-4 shadow-[0px_4px_14px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by request no, product, category, status..."
                className="h-12 w-full rounded-full border border-transparent bg-[#F5F6F8] pl-12 pr-4 text-sm text-[#111827] outline-none transition-all placeholder:text-[#98A2B3] focus:border-[#D0D5DD] focus:bg-white focus:ring-2 focus:ring-[#EAECF0]"
              />
            </div>

            {/* Filters */}
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:w-auto">

              {/* Status Filter */}
              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  className="h-12 w-full appearance-none rounded-full border border-transparent bg-[#F5F6F8] pl-11 pr-10 text-sm font-medium text-[#344054] outline-none transition-all focus:border-[#D0D5DD] focus:bg-white focus:ring-2 focus:ring-[#EAECF0] lg:min-w-[180px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="partially_approved">Partially Approved</option>
                  <option value="dispatch">Dispatch</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              </div>

              {/* Priority Filter */}
              <div className="relative">
                <Flag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />

                <select
                  value={priorityFilter}
                  onChange={(e) =>
                    setPriorityFilter(e.target.value as PriorityFilter)
                  }
                  className="h-12 w-full appearance-none rounded-full border border-transparent bg-[#F5F6F8] pl-11 pr-10 text-sm font-medium text-[#344054] outline-none transition-all focus:border-[#D0D5DD] focus:bg-white focus:ring-2 focus:ring-[#EAECF0] lg:min-w-[170px]"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              </div>

            </div>
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
                    onTransfer={() => {
                      setSelectedRequestId(item.requestId);
                      setOpenTransferModal(true);
                    }}
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

      <DistrictRequestStockModal
        open={openNewRequest}
        onClose={() => setOpenNewRequest(false)}
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
      <TransferRequestModal
        open={openTransferModal}
        requestId={selectedRequestId}
        onClose={() => {
          setOpenTransferModal(false);
          setSelectedRequestId(null);
        }}
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