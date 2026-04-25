"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Upload,
  UserRound,
  X,
  Package2,
} from "lucide-react";
import {
  approveDispatchRequest,
  type StockRequestApi,
} from "../api/request-api";

type Props = {
  open: boolean;
  onClose: () => void;
  request: StockRequestApi | null;
  onSuccess?: () => Promise<void> | void;
};

type DispatchItemState = {
  item_id: number;
  name: string;
  requested: number;
  approvedQty: string;
  grossWeight: number;
};

export default function ApproveDispatchModal({
  open,
  onClose,
  request,
  onSuccess,
}: Props) {
  const [remarks, setRemarks] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [expectedTime, setExpectedTime] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [items, setItems] = useState<DispatchItemState[]>([]);

  useEffect(() => {
    if (!request) {
      setItems([]);
      return;
    }

    const mapped: DispatchItemState[] = (request.request_items || []).map((item) => ({
      item_id: item.item_id,
      name:
        item?.item?.item_name ||
        item?.item?.article_code ||
        item?.item?.sku_code ||
        `Item ${item.item_id}`,
      requested: Number(item.request_qty || 0),
      approvedQty: String(item.approved_qty || item.request_qty || 0),
      grossWeight: Number(item?.item?.gross_weight || 0),
    }));

    setItems(mapped);
  }, [request]);

  const totalWeight = useMemo(() => {
    const total = items.reduce((sum, item) => {
      return sum + Number(item.approvedQty || 0) * Number(item.grossWeight || 0);
    }, 0);

    return `${total.toFixed(2)}g`;
  }, [items]);

  if (!open || !request) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      await approveDispatchRequest({
        requestId: request.id,
        remarks,
        driver_name: driverName,
        driver_phone: driverPhone,
        vehicle_number: vehicleNumber,
        tracking_number: trackingNumber,
        pickup_address: pickupAddress,
        delivery_address: deliveryAddress,
        expected_delivery_date: expectedDate,
        expected_delivery_time: expectedTime,
        additional_notes: additionalNotes,
        items: items.map((item) => ({
          item_id: item.item_id,
          qty: Number(item.approvedQty || 0),
          weight: Number(item.grossWeight || 0),
        })),
      });

      await onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to approve dispatch"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(17,24,39,0.30)] p-3 sm:p-4">
      <div className="max-h-[94vh] w-full max-w-[1120px] overflow-y-auto rounded-[24px] bg-white p-4 shadow-[0px_20px_60px_rgba(0,0,0,0.18)] sm:rounded-[28px] sm:p-6 lg:rounded-[34px] lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-[24px] w-[24px] text-[#19B34C] sm:h-[28px] sm:w-[28px]" />
            <h3 className="text-[20px] font-semibold tracking-[-0.04em] text-[#111111] sm:text-[24px] lg:text-[28px]">
              Approve Stock Request
            </h3>
          </div>

          <button type="button" onClick={onClose}>
            <X className="h-[22px] w-[22px] text-[#555]" />
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 rounded-[20px] bg-[#F5F6FF] p-4 sm:rounded-[24px] sm:p-5">
          <h4 className="text-[18px] font-semibold text-[#172033]">Request Details</h4>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <p className="text-[15px] text-[#556274] sm:text-[16px]">
              Requester :{" "}
              <span className="font-medium text-[#111827]">
                {request.from_store_name || request.from_store_code || "Store"}
              </span>
            </p>
            <p className="text-[15px] text-[#556274] sm:text-[16px]">
              Request ID :{" "}
              <span className="font-medium text-[#111827]">
                {request.request_no || `req${request.id}`}
              </span>
            </p>
            <p className="text-[15px] text-[#556274] sm:text-[16px]">
              Priority :{" "}
              <span className="font-medium uppercase text-[#F15A24]">
                {request.priority}
              </span>
            </p>
            <p className="text-[15px] text-[#556274] sm:text-[16px]">
              Created :{" "}
              <span className="font-medium text-[#111827]">
                {request.created_at?.slice(0, 10) || "--"}
              </span>
            </p>
          </div>

          <div className="mt-4 rounded-[16px] bg-white px-4 py-4 text-[15px] text-[#556274] sm:text-[16px]">
            <span className="font-semibold text-[#374151]">Notes:</span>{" "}
            {request.notes || "No notes available"}
          </div>
        </div>

        <div className="mt-5 rounded-[20px] bg-[#F6F8FF] p-4 sm:rounded-[24px] sm:p-5">
          <div className="flex items-center gap-2">
            <Package2 className="h-[20px] w-[20px] text-[#8F35E8]" />
            <h4 className="text-[18px] font-semibold text-[#172033]">
              Confirm Products & Quantities
            </h4>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <div key={item.item_id} className="rounded-[18px] bg-white p-4 sm:rounded-[20px]">
                <h5 className="text-[16px] font-medium text-[#172033] sm:text-[17px]">
                  {item.name}
                </h5>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                      Requested Quantity
                    </label>
                    <input
                      value={item.requested}
                      readOnly
                      className="h-[46px] w-full rounded-[12px] bg-[#F5F5F7] px-4 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                      Approve Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.approvedQty}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((p) =>
                            p.item_id === item.item_id
                              ? { ...p, approvedQty: e.target.value }
                              : p
                          )
                        )
                      }
                      className="h-[46px] w-full rounded-[12px] bg-[#F5F5F7] px-4 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[18px] bg-white p-4 sm:rounded-[20px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[16px] font-semibold text-[#2C3444] sm:text-[18px]">
                Total Weight:
              </span>
              <span className="text-[18px] font-semibold text-[#A020F0] sm:text-[20px]">
                {totalWeight}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[20px] bg-[#EDF9F0] p-4 sm:rounded-[24px] sm:p-5">
          <div className="flex items-center gap-2">
            <UserRound className="h-[20px] w-[20px] text-[#19A447]" />
            <h4 className="text-[18px] font-semibold text-[#172033]">
              Delivery Partner Details
            </h4>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                Driver Name *
              </label>
              <input
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Enter driver name"
                className="h-[46px] w-full rounded-[12px] bg-white px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                Driver Phone *
              </label>
              <input
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="h-[46px] w-full rounded-[12px] bg-white px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                Vehicle Number *
              </label>
              <input
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="DL01AB1234"
                className="h-[46px] w-full rounded-[12px] bg-white px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                Tracking Number
              </label>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Auto-generated if empty"
                className="h-[46px] w-full rounded-[12px] bg-white px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                Driver’s Photo
              </label>
              <button
                type="button"
                className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-white px-4 text-[15px] font-medium text-[#667085]"
              >
                <Upload className="h-[16px] w-[16px]" />
                Upload
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-[20px] bg-[#EEF4FF] p-4 sm:rounded-[24px] sm:p-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-[20px] w-[20px] text-[#2667FF]" />
              <h4 className="text-[18px] font-semibold text-[#172033]">
                Pickup & Delivery Addresses
              </h4>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                  Pickup Address *
                </label>
                <input
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Head Office Warehouse, Main"
                  className="h-[46px] w-full rounded-[12px] bg-white px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                  Delivery Address *
                </label>
                <input
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="District store address"
                  className="h-[46px] w-full rounded-[12px] bg-white px-4 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[20px] bg-[#FFF8E7] p-4 sm:rounded-[24px] sm:p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-[20px] w-[20px] text-[#F97316]" />
              <h4 className="text-[18px] font-semibold text-[#172033]">
                Delivery Schedule
              </h4>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                  Expected Delivery Date *
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="h-[46px] w-full rounded-[12px] bg-white px-4 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-medium text-[#111111] sm:text-[15px]">
                  Expected Time
                </label>
                <input
                  type="time"
                  value={expectedTime}
                  onChange={(e) => setExpectedTime(e.target.value)}
                  className="h-[46px] w-full rounded-[12px] bg-white px-4 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-[15px] font-medium text-[#111111] sm:text-[16px]">
            Additional Notes
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any special instructions..."
            className="min-h-[90px] w-full resize-none rounded-[18px] border border-[#D7DBE4] px-4 py-4 outline-none"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-[50px] rounded-[14px] border border-[#D7DBE4] bg-white px-8 text-[16px] font-medium text-[#111111]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[14px] bg-[#10A34A] px-8 text-[16px] font-medium text-white disabled:opacity-60"
          >
            <CheckCircle2 className="h-[18px] w-[18px]" />
            {submitting ? "Submitting..." : "Approve & Dispatch"}
          </button>
        </div>
      </div>
    </div>
  );
}