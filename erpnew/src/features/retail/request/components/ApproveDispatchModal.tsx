"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ImagePlus,
  MapPin,
  Package2,
  Truck,
  Upload,
  UserRound,
  Video,
  X,
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
  rate: number;
};

function formatDate(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toISOString().slice(0, 10);
}

function isFilled(value: string) {
  return value.trim().length > 0;
}

function inputClass(active: boolean) {
  return [
    "h-[42px] w-full rounded-[12px] border px-4 text-[14px] outline-none transition placeholder:text-[#98A2B3]",
    active
      ? "border-[#16A34A] bg-[#F0FDF4] text-[#14532D] shadow-[0_0_0_3px_rgba(34,197,94,0.10)]"
      : "border-transparent bg-[#F3F4F6] text-[#111827] focus:border-[#CBD5E1]",
  ].join(" ");
}

export default function ApproveDispatchModal({
  open,
  onClose,
  request,
  onSuccess,
}: Props) {
  const driverPhotoRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);

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

  const [driverPhoto, setDriverPhoto] = useState<File | null>(null);
  const [dispatchImages, setDispatchImages] = useState<File[]>([]);
  const [dispatchVideo, setDispatchVideo] = useState<File | null>(null);

  const [items, setItems] = useState<DispatchItemState[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const alreadyDispatched =
    request?.transfer?.status === "in_transit" ||
    request?.transfer?.status === "received";

  useEffect(() => {
    if (!request) return;

    setRemarks("");
    setDriverName("");
    setDriverPhone("");
    setVehicleNumber("");
    setTrackingNumber("");
    setPickupAddress("");
    setDeliveryAddress("");
    setExpectedDate("");
    setExpectedTime("");
    setAdditionalNotes("");
    setDriverPhoto(null);
    setDispatchImages([]);
    setDispatchVideo(null);
    setError("");

    setItems(
      (request.request_items || []).map((item) => ({
        item_id: Number(item.item_id),
        name:
          item?.item?.item_name ||
          item?.item?.article_code ||
          item?.item?.sku_code ||
          `Item ${item.item_id}`,
        requested: Number(item.request_qty || 0),
        approvedQty: String(item.approved_qty || item.request_qty || 0),
        grossWeight: Number(
          item?.item?.gross_weight || item?.item?.net_weight || 0
        ),
        rate: Number(
          (item?.item as any)?.sale_rate ||
            (item?.item as any)?.purchase_rate ||
            0
        ),
      }))
    );
  }, [request]);

  const totalWeight = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.approvedQty || 0) * item.grossWeight,
      0
    );
  }, [items]);

  const estimatedValue = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + Number(item.approvedQty || 0) * item.grossWeight * item.rate,
      0
    );
  }, [items]);

  if (!open || !request) return null;

  async function handleSubmit() {
    if (alreadyDispatched || submitting) return;

    if (
      !driverName ||
      !driverPhone ||
      !vehicleNumber ||
      !pickupAddress ||
      !deliveryAddress ||
      !expectedDate
    ) {
      setError("Please fill all required fields before dispatch.");
      return;
    }

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
        driver_photo: driverPhoto,
        dispatch_images: dispatchImages,
        dispatch_video: dispatchVideo,
        items: items.map((item) => ({
          item_id: item.item_id,
          qty: Number(item.approvedQty || 0),
          weight: item.grossWeight,
          rate: item.rate,
        })),
      });

      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to approve dispatch"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-black/35 px-3 py-5 backdrop-blur-[2px]">
      <div className="w-full max-w-[1040px] overflow-hidden rounded-[32px] bg-white shadow-[0px_22px_60px_rgba(15,23,42,0.28)]">
        <div className="sticky top-0 z-10 border-b border-[#EEF2F7] bg-white/95 px-5 py-5 backdrop-blur sm:px-6 lg:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#E8F8EE]">
                <CheckCircle2 className="h-[22px] w-[22px] text-[#00A83D]" />
              </div>

              <div>
                <h2 className="text-[22px] font-semibold leading-none text-[#111111] sm:text-[27px]">
                  Approve Stock Request
                </h2>
                <p className="mt-2 text-[13px] text-[#667085]">
                  Verify quantity, delivery partner, and schedule before
                  dispatch.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 transition hover:bg-[#F3F4F6]"
            >
              <X className="h-5 w-5 text-[#333]" />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-130px)] overflow-y-auto px-5 pb-6 pt-5 sm:px-6 lg:px-7">
          {alreadyDispatched && (
            <div className="mb-4 flex items-center gap-3 rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[14px] font-medium text-[#15803D]">
              <Truck className="h-5 w-5" />
              This stock request is already dispatched.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-[24px] bg-gradient-to-r from-[#EEF6FF] to-[#FCF3FF] p-4 sm:p-5">
            <h3 className="text-[18px] font-semibold text-[#111827]">
              Request Details
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Info
                label="Requester"
                value={request.from_store_name || request.from_store_code || "Store"}
              />
              <Info
                label="Request ID"
                value={request.request_no || `req${request.id}`}
              />
              <Info label="Priority" value={request.priority || "medium"} danger />
              <Info
                label="Created"
                value={formatDate(request.created_at || (request as any).createdAt)}
              />
            </div>

            <div className="mt-4 max-w-[520px] rounded-[16px] bg-white px-4 py-3 text-[14px] text-[#425066] shadow-sm">
              <span className="font-semibold text-[#374151]">Notes:</span>{" "}
              {request.notes || request.remarks || "No notes available"}
            </div>
          </section>

          <section className="mt-5 rounded-[24px] bg-gradient-to-r from-[#FFF4FF] to-[#EFF7FF] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-[#9A28FF]" />
              <h3 className="text-[18px] font-semibold text-[#111827]">
                Confirm Products & Quantities
              </h3>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {items.map((item) => {
                const approved = Number(item.approvedQty || 0) > 0;

                return (
                  <div
                    key={item.item_id}
                    className="rounded-[20px] border border-[#E5E7EB] bg-white p-4"
                  >
                    <h4 className="truncate text-[16px] font-semibold text-[#172033]">
                      {item.name}
                    </h4>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[13px] font-medium text-black">
                          Requested Quantity
                        </label>
                        <input
                          value={item.requested}
                          readOnly
                          className="h-[40px] w-full rounded-[12px] bg-[#F3F4F6] px-4 text-[#6B7280] outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[13px] font-medium text-black">
                          Approve Quantity *
                        </label>
                        <input
                          type="number"
                          min={0}
                          disabled={alreadyDispatched}
                          value={item.approvedQty}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((row) =>
                                row.item_id === item.item_id
                                  ? { ...row, approvedQty: e.target.value }
                                  : row
                              )
                            )
                          }
                          className={inputClass(approved)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_240px]">
              <UploadBox
                icon={ImagePlus}
                title={
                  dispatchImages.length
                    ? `${dispatchImages.length} image(s) selected`
                    : "Upload dispatch images"
                }
                subtitle="Click to browse from computer"
                active={dispatchImages.length > 0}
                onClick={() => imageRef.current?.click()}
              />

              <UploadBox
                icon={Video}
                title={dispatchVideo ? dispatchVideo.name : "Upload dispatch video"}
                subtitle="Click to browse from computer"
                active={!!dispatchVideo}
                onClick={() => videoRef.current?.click()}
              />

              <div className="rounded-[20px] bg-white px-5 py-4 shadow-sm lg:col-span-2 2xl:col-span-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] font-semibold text-[#172033] sm:text-[15px]">
                    Total Weight:
                  </span>
                  <span className="text-[18px] font-bold text-[#9A28FF] sm:text-[20px]">
                    {totalWeight.toFixed(2)}g
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[14px] font-semibold text-[#172033] sm:text-[15px]">
                    Estimated Value:
                  </span>
                  <span className="text-[17px] font-bold text-[#00A83D] sm:text-[18px]">
                    ₹{Number(estimatedValue || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={alreadyDispatched}
              onChange={(e) =>
                setDispatchImages(Array.from(e.target.files || []))
              }
            />

            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              className="hidden"
              disabled={alreadyDispatched}
              onChange={(e) => setDispatchVideo(e.target.files?.[0] || null)}
            />
          </section>

          <section className="mt-5 rounded-[24px] bg-[#ECFFF4] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-[#00A83D]" />
              <h3 className="text-[18px] font-semibold text-[#111827]">
                Delivery Partner Details
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_130px]">
              <InputBox
                label="Driver Name *"
                value={driverName}
                setValue={setDriverName}
                placeholder="Enter driver name"
                disabled={alreadyDispatched}
              />
              <InputBox
                label="Driver Phone *"
                value={driverPhone}
                setValue={setDriverPhone}
                placeholder="+91 XXXXX XXXXX"
                disabled={alreadyDispatched}
              />
              <InputBox
                label="Vehicle Number *"
                value={vehicleNumber}
                setValue={setVehicleNumber}
                placeholder="DL01AB1234"
                disabled={alreadyDispatched}
              />
              <InputBox
                label="Tracking Number"
                value={trackingNumber}
                setValue={setTrackingNumber}
                placeholder="Auto-generated"
                disabled={alreadyDispatched}
              />

              <div>
                <label className="mb-2 block text-[13px] font-medium text-black">
                  Driver’s Photo
                </label>
                <button
                  type="button"
                  disabled={alreadyDispatched}
                  onClick={() => driverPhotoRef.current?.click()}
                  className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#F3F4F6] text-[14px] text-[#667085]"
                >
                  <Upload className="h-4 w-4" />
                  {driverPhoto ? "Uploaded" : "Upload"}
                </button>
                <input
                  ref={driverPhotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={alreadyDispatched}
                  onChange={(e) => setDriverPhoto(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </section>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-[24px] bg-[#EEF4FF] p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#2563FF]" />
                <h3 className="text-[18px] font-semibold text-[#111827]">
                  Pickup & Delivery Addresses
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputBox
                  label="Pickup Address *"
                  value={pickupAddress}
                  setValue={setPickupAddress}
                  placeholder="Head Office Warehouse, Main"
                  disabled={alreadyDispatched}
                />
                <InputBox
                  label="Delivery Address *"
                  value={deliveryAddress}
                  setValue={setDeliveryAddress}
                  placeholder="District store address"
                  disabled={alreadyDispatched}
                />
              </div>
            </section>

            <section className="rounded-[24px] bg-[#FFFBEA] p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-[#FF4B00]" />
                <h3 className="text-[18px] font-semibold text-[#111827]">
                  Delivery Schedule
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputBox
                  type="date"
                  label="Expected Delivery Date *"
                  value={expectedDate}
                  setValue={setExpectedDate}
                  disabled={alreadyDispatched}
                />
                <InputBox
                  type="time"
                  label="Expected Time"
                  value={expectedTime}
                  setValue={setExpectedTime}
                  disabled={alreadyDispatched}
                />
              </div>
            </section>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-[15px] font-medium text-black">
                Additional Notes
              </label>
              <textarea
                value={additionalNotes}
                disabled={alreadyDispatched}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any special instructions..."
                className="h-[84px] w-full resize-none rounded-[18px] border border-[#D1D5DB] bg-white px-4 py-3 outline-none lg:max-w-[520px]"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="h-[42px] rounded-[12px] border border-[#E5E7EB] px-6 text-[15px] font-medium text-black transition hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>

              {!alreadyDispatched && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex h-[42px] items-center justify-center gap-2 rounded-[12px] bg-[#00A83D] px-6 text-[15px] font-medium text-white transition hover:bg-[#009236] disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? "Dispatching..." : "Approve & Dispatch"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <p className="text-[14px] text-[#556274]">
      {label} :{" "}
      <span
        className={[
          "font-semibold",
          danger ? "uppercase text-[#FF3700]" : "text-[#111827]",
        ].join(" ")}
      >
        {value}
      </span>
    </p>
  );
}

function InputBox({
  label,
  value,
  setValue,
  placeholder,
  type = "text",
  disabled,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-medium text-black">
        {label}
      </label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={inputClass(isFilled(value))}
      />
    </div>
  );
}

function UploadBox({
  title,
  subtitle,
  onClick,
  active,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
  active?: boolean;
  icon: any;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-w-0 items-center gap-4 rounded-[18px] border px-4 py-5 text-left transition",
        active
          ? "border-[#16A34A] bg-[#F0FDF4] text-[#15803D]"
          : "border-[#E5E7EB] bg-white text-[#344054] hover:border-[#CBD5E1]",
      ].join(" ")}
    >
      <Icon
        className={[
          "h-10 w-10 shrink-0 rounded-full p-2",
          active
            ? "bg-[#DCFCE7] text-[#16A34A]"
            : "bg-[#F1F5F9] text-[#7D95B2]",
        ].join(" ")}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold sm:text-[14px]">
          {title}
        </p>
        <p className="mt-1 truncate text-[11px] text-[#98A2B3] sm:text-[12px]">
          {subtitle}
        </p>
      </div>
    </button>
  );
}