"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  FileText,
  ImagePlus,
  LucideIcon,
  MapPin,
  Package2,
  Upload,
  UserRound,
  Video,
  X,
} from "lucide-react";
import {
  approveDispatchRequest,
  getRequestApiErrorMessage,
  type StockRequestApi,
} from "../api/request-api";
import {
  getCurrentBrowserPosition,
  startTransferLiveTracking,
} from "../api/live-tracking-manager";

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
  netWeight: number;
  rate: number;
};

type MediaTarget =
  | "driverPhoto"
  | "dispatchImages"
  | "dispatchVideo"
  | "ewayBill";

type MediaChooserState = {
  open: boolean;
  target: MediaTarget | null;
  title: string;
  allowCamera: boolean;
  allowVideoRecord: boolean;
  allowFileUpload: boolean;
};

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;

  const clean = String(value)
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  const num = Number(clean);
  return Number.isFinite(num) ? num : 0;
}

function safeText(value: unknown, fallback = "--") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function formatDate(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--";

  return date.toISOString().slice(0, 10);
}

function formatCurrency(value: number) {
  const safe = Number.isFinite(value) ? value : 0;

  return safe.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function isFilled(value: string) {
  return value.trim().length > 0;
}

function inputClass(active: boolean) {
  return [
    "h-[42px] w-full rounded-[12px] border px-4 font-erp text-[14px] font-normal leading-[20px] tracking-[-0.02em] outline-none transition placeholder:text-[#7C8293] disabled:cursor-not-allowed disabled:opacity-70",
    active
      ? "border-[#16A34A] bg-[#F0FDF4] text-[#14532D] shadow-[0_0_0_3px_rgba(34,197,94,0.10)]"
      : "border-transparent bg-[#F3F4F6] text-[#111827] focus:border-[#CBD5E1] focus:bg-white",
  ].join(" ");
}

function getCapturedFileName(prefix: string, extension: string) {
  return `${prefix}-${Date.now()}.${extension}`;
}

function dataUrlToFile(dataUrl: string, filename: string) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, { type: mime });
}

function getItemRate(itemData: any) {
  return (
    toNumber(itemData?.sale_rate) ||
    toNumber(itemData?.selling_price) ||
    toNumber(itemData?.sellingPrice) ||
    toNumber(itemData?.rate) ||
    toNumber(itemData?.purchase_rate) ||
    toNumber(itemData?.purchase_price) ||
    0
  );
}

function getItemGrossWeight(itemData: any) {
  return (
    toNumber(itemData?.gross_weight) ||
    toNumber(itemData?.grossWeight) ||
    toNumber(itemData?.net_weight) ||
    toNumber(itemData?.netWeight) ||
    0
  );
}

function getItemNetWeight(itemData: any) {
  return (
    toNumber(itemData?.net_weight) ||
    toNumber(itemData?.netWeight) ||
    toNumber(itemData?.gross_weight) ||
    toNumber(itemData?.grossWeight) ||
    0
  );
}

export default function ApproveDispatchModal({
  open,
  onClose,
  request,
  onSuccess,
}: Props) {
  const [mounted, setMounted] = useState(false);

  const driverPhotoRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);
  const ewayBillRef = useRef<HTMLInputElement | null>(null);

  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

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
  const [ewayBill, setEwayBill] = useState<File | null>(null);

  const [items, setItems] = useState<DispatchItemState[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [mediaChooser, setMediaChooser] = useState<MediaChooserState>({
    open: false,
    target: null,
    title: "",
    allowCamera: false,
    allowVideoRecord: false,
    allowFileUpload: true,
  });

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<MediaTarget | null>(null);
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [cameraError, setCameraError] = useState("");
  const [recording, setRecording] = useState(false);

  const alreadyDispatched =
    request?.transfer?.status === "in_transit" ||
    request?.transfer?.status === "received" ||
    request?.transfer?.status === "delivered";

  useEffect(() => {
    setMounted(true);
  }, []);

  const stopCameraStream = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    setRecording(false);
  };

  const closeCamera = () => {
    stopCameraStream();
    setCameraOpen(false);
    setCameraTarget(null);
    setCameraError("");
  };

  const closeMediaChooser = () => {
    setMediaChooser({
      open: false,
      target: null,
      title: "",
      allowCamera: false,
      allowVideoRecord: false,
      allowFileUpload: true,
    });
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, submitting, onClose]);

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
    setEwayBill(null);
    setError("");
    closeMediaChooser();
    closeCamera();

    setItems(
      (request.request_items || [])
        .map((row: any) => {
          const itemData = row?.item || {};

          const requestedQty = toNumber(
            row?.request_qty || row?.requested_qty || row?.qty
          );

          return {
            item_id: toNumber(row?.item_id || itemData?.id),
            name:
              itemData?.item_name ||
              itemData?.article_code ||
              itemData?.sku_code ||
              `Item ${row?.item_id || itemData?.id || ""}`,
            requested: requestedQty,
            approvedQty: String(
              toNumber(row?.approved_qty) || requestedQty || 0
            ),
            grossWeight: getItemGrossWeight(itemData),
            netWeight: getItemNetWeight(itemData),
            rate: getItemRate(itemData),
          };
        })
        .filter((item) => item.item_id > 0)
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  useEffect(() => {
    if (!open) {
      closeMediaChooser();
      closeCamera();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => stopCameraStream();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalWeight = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = toNumber(item.approvedQty);
      const weight = item.grossWeight || item.netWeight || 0;

      return sum + qty * weight;
    }, 0);
  }, [items]);

  const estimatedValue = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = toNumber(item.approvedQty);
      const weight = item.grossWeight || item.netWeight || 0;
      const rate = item.rate || 0;

      return sum + qty * weight * rate;
    }, 0);
  }, [items]);

  if (!open || !request || !mounted) return null;

  const updateApprovedQty = (index: number, value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, "");

    setItems((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              approvedQty: cleanValue,
            }
          : row
      )
    );
  };

  const openMediaChooser = (target: MediaTarget) => {
    if (alreadyDispatched) return;

    const config: Record<
      MediaTarget,
      Omit<MediaChooserState, "open" | "target">
    > = {
      dispatchImages: {
        title: "Dispatch Images",
        allowCamera: true,
        allowVideoRecord: false,
        allowFileUpload: true,
      },
      dispatchVideo: {
        title: "Dispatch Video",
        allowCamera: false,
        allowVideoRecord: true,
        allowFileUpload: true,
      },
      driverPhoto: {
        title: "Driver Photo",
        allowCamera: true,
        allowVideoRecord: false,
        allowFileUpload: true,
      },
      ewayBill: {
        title: "E-Way Bill",
        allowCamera: false,
        allowVideoRecord: false,
        allowFileUpload: true,
      },
    };

    setMediaChooser({
      open: true,
      target,
      ...config[target],
    });
  };

  const triggerUploadInput = (target: MediaTarget | null) => {
    closeMediaChooser();

    requestAnimationFrame(() => {
      if (target === "dispatchImages") imageRef.current?.click();
      if (target === "dispatchVideo") videoRef.current?.click();
      if (target === "driverPhoto") driverPhotoRef.current?.click();
      if (target === "ewayBill") ewayBillRef.current?.click();
    });
  };

  const openCameraForTarget = async (
    target: MediaTarget | null,
    mode: "photo" | "video"
  ) => {
    if (!target) return;

    try {
      closeMediaChooser();
      stopCameraStream();

      setCameraTarget(target);
      setCameraMode(mode);
      setCameraOpen(true);
      setCameraError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: mode === "video",
      });

      mediaStreamRef.current = stream;

      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          cameraVideoRef.current.play().catch(() => undefined);
        }
      }, 0);
    } catch (err: any) {
      setCameraError(
        err?.message || "Camera permission is required to capture media."
      );
    }
  };

  const saveCapturedPhoto = () => {
    if (!cameraVideoRef.current || !cameraTarget) return;

    const video = cameraVideoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const file = dataUrlToFile(
      canvas.toDataURL("image/jpeg", 0.92),
      getCapturedFileName("camera-photo", "jpg")
    );

    if (cameraTarget === "driverPhoto") {
      setDriverPhoto(file);
    }

    if (cameraTarget === "dispatchImages") {
      setDispatchImages((prev) => [...prev, file].slice(0, 3));
    }

    closeCamera();
  };

  const startVideoRecording = () => {
    const stream = mediaStreamRef.current;

    if (!stream || recording) return;

    recordedChunksRef.current = [];

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });

      const file = new File(
        [blob],
        getCapturedFileName("recorded-video", "webm"),
        {
          type: "video/webm",
        }
      );

      setDispatchVideo(file);
      closeCamera();
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const validateBeforeSubmit = () => {
    if (
      !driverName.trim() ||
      !driverPhone.trim() ||
      !vehicleNumber.trim() ||
      !pickupAddress.trim() ||
      !deliveryAddress.trim() ||
      !expectedDate.trim()
    ) {
      return "Please fill all required fields before dispatch.";
    }

    const validItems = items.filter((item) => {
      const qty = toNumber(item.approvedQty);
      return item.item_id > 0 && qty > 0;
    });

    if (!validItems.length) {
      return "Please approve at least one item quantity.";
    }

    const overApproved = items.find(
      (item) => toNumber(item.approvedQty) > item.requested
    );

    if (overApproved) {
      return `${overApproved.name}: approve quantity cannot be greater than requested quantity.`;
    }

    if (dispatchImages.length > 3) {
      return "Maximum 3 dispatch images are allowed.";
    }

    return "";
  };

  async function handleSubmit() {
    if (alreadyDispatched || submitting) return;

    const validationMessage = validateBeforeSubmit();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      let currentPositionAllowed = true;

      try {
        await getCurrentBrowserPosition();
      } catch {
        currentPositionAllowed = false;
      }

      const dispatchResponse = await approveDispatchRequest({
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
        dispatch_images: dispatchImages.slice(0, 3),
        dispatch_video: dispatchVideo,
        e_way_bill: ewayBill,
        items: items
          .filter((item) => toNumber(item.approvedQty) > 0)
          .map((item) => ({
            item_id: item.item_id,
            qty: toNumber(item.approvedQty),
            approved_qty: toNumber(item.approvedQty),
            weight: item.grossWeight || item.netWeight || 0,
            rate: item.rate || 0,
          })),
      });

      const transferId =
        dispatchResponse?.data?.transfer_id ||
        dispatchResponse?.data?.transfer?.id ||
        dispatchResponse?.transfer_id ||
        dispatchResponse?.transfer?.id ||
        request?.transfer?.id;

      if (transferId && currentPositionAllowed) {
        try {
          await startTransferLiveTracking(transferId);
        } catch {
          // dispatch success should not fail only because live tracking start failed
        }
      }

      onClose();
      await onSuccess?.();
    } catch (err) {
      setError(getRequestApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const modal = (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/35 px-3 py-4 font-erp backdrop-blur-[1px] sm:px-5 sm:py-7">
      <div className="mx-auto flex min-h-[calc(100svh-32px)] w-full max-w-[1040px] items-start sm:min-h-[calc(100svh-56px)]">
        <div className="relative my-auto w-full overflow-hidden rounded-[24px] bg-white shadow-[0px_24px_70px_rgba(15,23,42,0.28)] sm:rounded-[32px]">
          <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-transparent bg-white px-5 pb-3 pt-5 sm:px-6 sm:pb-4 sm:pt-6">
            <div className="flex min-w-0 items-center gap-3">
              <CheckCircle2 className="h-[24px] w-[24px] shrink-0 text-[#00B949] sm:h-[26px] sm:w-[26px]" />

              <h2 className="truncate text-[22px] font-semibold leading-[28px] tracking-[-0.04em] text-[#111111] sm:text-[26px] sm:leading-[32px]">
                Approve Stock Request
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-5 w-5 text-[#1F2937]" />
            </button>
          </div>

          <div className="dashboard-hidden-scroll max-h-[calc(100svh-118px)] overflow-y-auto px-5 pb-5 sm:max-h-[calc(100svh-145px)] sm:px-6 sm:pb-6">
            {alreadyDispatched ? (
              <div className="mb-4 rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[14px] font-medium text-[#15803D]">
                This stock request is already dispatched.
              </div>
            ) : null}

            {error ? (
              <div className="mb-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <section className="rounded-[20px] bg-gradient-to-r from-[#EEF6FF] to-[#FCF3FF] px-4 py-4">
              <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.03em] text-[#111827]">
                Request Details
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-4">
                <Info
                  label="Requester"
                  value={
                    request.from_store_name ||
                    request.from_store_code ||
                    "Store"
                  }
                />

                <Info
                  label="Request ID"
                  value={request.request_no || `req${request.id}`}
                />

                <Info
                  label="Priority"
                  value={request.priority || "medium"}
                  danger
                />

                <Info
                  label="Created"
                  value={formatDate(
                    request.created_at || (request as any).createdAt
                  )}
                />
              </div>

              <div className="mt-4 max-w-[475px] rounded-[14px] bg-white px-4 py-3 text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-[#425066]">
                <span className="font-semibold text-[#374151]">Notes:</span>{" "}
                {request.notes || request.remarks || "No notes available"}
              </div>
            </section>

            <section className="mt-5 rounded-[20px] bg-gradient-to-r from-[#FFF4FF] to-[#EFF7FF] px-4 py-5">
              <div className="flex items-center gap-2">
                <Package2 className="h-5 w-5 text-[#9A28FF]" />
                <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.03em] text-[#111827]">
                  Confirm Products & Quantities
                </h3>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {items.map((item, index) => (
                  <div
                    key={`${item.item_id}-${index}`}
                    className="rounded-[18px] bg-white px-4 py-4"
                  >
                    <h4 className="truncate text-[16px] font-medium leading-[22px] tracking-[-0.02em] text-[#111827]">
                      {item.name}
                    </h4>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Requested Quantity</Label>
                        <input
                          value={item.requested}
                          readOnly
                          className="h-[42px] w-full rounded-[12px] border border-transparent bg-[#F3F4F6] px-4 text-[14px] leading-[20px] tracking-[-0.02em] text-[#7C8293] outline-none"
                        />
                      </div>

                      <div>
                        <Label>Approve Quantity *</Label>
                        <input
                          type="text"
                          inputMode="decimal"
                          disabled={alreadyDispatched}
                          value={item.approvedQty}
                          onChange={(e) =>
                            updateApprovedQty(index, e.target.value)
                          }
                          className={inputClass(toNumber(item.approvedQty) > 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.05fr_1.05fr_140px_1fr]">
                <UploadBox
                  icon={ImagePlus}
                  title={
                    dispatchImages.length
                      ? `${dispatchImages.length} image(s) selected`
                      : "Drag and drop image here"
                  }
                  subtitle="or click to browse from computer"
                  active={dispatchImages.length > 0}
                  onClick={() => openMediaChooser("dispatchImages")}
                />

                <UploadBox
                  icon={Video}
                  title={
                    dispatchVideo
                      ? dispatchVideo.name
                      : "Drag and drop video here"
                  }
                  subtitle="or click to browse from computer"
                  active={!!dispatchVideo}
                  onClick={() => openMediaChooser("dispatchVideo")}
                />

                <UploadBox
                  icon={FileText}
                  title={ewayBill ? "Uploaded" : "Upload E-Way Bill"}
                  subtitle=""
                  active={!!ewayBill}
                  compact
                  onClick={() => openMediaChooser("ewayBill")}
                />

                <div className="rounded-[18px] bg-white px-4 py-4">
                  <SummaryRow
                    label="Total Weight:"
                    value={`${totalWeight.toFixed(2)}g`}
                    valueClass="text-[#9A28FF]"
                  />

                  <div className="mt-3">
                    <SummaryRow
                      label="Estimated Value:"
                      value={`₹${formatCurrency(estimatedValue)}`}
                      valueClass="text-[#00A83D]"
                    />
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
                  setDispatchImages(
                    Array.from(e.target.files || []).slice(0, 3)
                  )
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

              <input
                ref={ewayBillRef}
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                disabled={alreadyDispatched}
                onChange={(e) => setEwayBill(e.target.files?.[0] || null)}
              />
            </section>

            <section className="mt-5 rounded-[20px] bg-[#ECFFF4] px-4 py-4">
              <div className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-[#00A83D]" />
                <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.03em] text-[#111827]">
                  Delivery Partner Details
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_120px]">
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
                  setValue={(value) => setVehicleNumber(value.toUpperCase())}
                  placeholder="DL01AB1234"
                  disabled={alreadyDispatched}
                />

                <InputBox
                  label="Tracking Number"
                  value={trackingNumber}
                  setValue={setTrackingNumber}
                  placeholder="Auto-generated if empty"
                  disabled={alreadyDispatched}
                />

                <div>
                  <Label>Driver’s Photo</Label>

                  <button
                    type="button"
                    disabled={alreadyDispatched}
                    onClick={() => openMediaChooser("driverPhoto")}
                    className={[
                      "flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] text-[14px] font-medium leading-[20px] tracking-[-0.02em] transition disabled:cursor-not-allowed disabled:opacity-70",
                      driverPhoto
                        ? "bg-[#DCFCE7] text-[#15803D]"
                        : "bg-[#F3F4F6] text-[#667085]",
                    ].join(" ")}
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

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.08fr_1fr]">
              <section className="rounded-[20px] bg-[#EEF4FF] px-4 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#2563FF]" />
                  <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.03em] text-[#111827]">
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

              <section className="rounded-[20px] bg-[#FFFBEA] px-4 py-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-[#FF4B00]" />

                  <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.03em] text-[#111827]">
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

            <div className="sticky bottom-0 z-10 mt-5 grid grid-cols-1 gap-4 border-t border-transparent bg-white pb-1 pt-4 lg:grid-cols-[520px_1fr] lg:items-end">
              <div>
                <label className="mb-2 block text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-black">
                  Additional Notes
                </label>

                <textarea
                  value={additionalNotes}
                  disabled={alreadyDispatched}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  className="h-[78px] w-full resize-none rounded-[18px] border border-[#D1D5DB] bg-white px-4 py-3 text-[16px] font-normal leading-[22px] tracking-[-0.02em] text-[#111827] outline-none placeholder:text-[#7C8293] focus:border-[#CBD5E1] disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="h-[40px] rounded-[12px] border border-[#E5E7EB] bg-white px-5 text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-black transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                {!alreadyDispatched ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex h-[40px] items-center justify-center gap-2 rounded-[12px] bg-[#00A83D] px-5 text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-white transition hover:bg-[#009236] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {submitting ? "Dispatching..." : "Approve & Dispatch"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {mediaChooser.open ? (
          <MediaChooser
            state={mediaChooser}
            onClose={closeMediaChooser}
            onUpload={() => triggerUploadInput(mediaChooser.target)}
            onCamera={() => openCameraForTarget(mediaChooser.target, "photo")}
            onVideo={() => openCameraForTarget(mediaChooser.target, "video")}
          />
        ) : null}

        {cameraOpen ? (
          <CameraModal
            mode={cameraMode}
            cameraError={cameraError}
            recording={recording}
            videoRef={cameraVideoRef}
            onClose={closeCamera}
            onCapturePhoto={saveCapturedPhoto}
            onStartRecording={startVideoRecording}
            onStopRecording={stopVideoRecording}
          />
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
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
    <p className="text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-[#556274]">
      {label} :{" "}
      <span
        className={[
          "font-semibold",
          danger ? "uppercase text-[#FF3700]" : "text-[#111827]",
        ].join(" ")}
      >
        {safeText(value)}
      </span>
    </p>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-black">
      {children}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[16px] font-semibold leading-[22px] tracking-[-0.03em] text-[#111827]">
        {label}
      </span>

      <span
        className={[
          "text-right text-[18px] font-bold leading-[24px] tracking-[-0.03em]",
          valueClass,
        ].join(" ")}
      >
        {value}
      </span>
    </div>
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
      <Label>{label}</Label>

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
  compact,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
  active?: boolean;
  compact?: boolean;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-w-0 items-center rounded-[18px] border bg-white text-left transition",
        compact ? "justify-center gap-2 px-3 py-4" : "gap-4 px-4 py-5",
        active
          ? "border-[#16A34A] bg-[#F0FDF4] text-[#15803D]"
          : "border-[#E5E7EB] text-[#344054] hover:border-[#CBD5E1]",
      ].join(" ")}
    >
      <Icon
        className={[
          "shrink-0 rounded-full p-2",
          compact ? "h-8 w-8" : "h-10 w-10",
          active
            ? "bg-[#DCFCE7] text-[#16A34A]"
            : "bg-[#F1F5F9] text-[#7D95B2]",
        ].join(" ")}
      />

      <div className={compact ? "min-w-0" : "min-w-0 flex-1"}>
        <p className="truncate text-[13px] font-semibold leading-[18px] tracking-[-0.02em]">
          {title}
        </p>

        {subtitle ? (
          <p className="mt-1 truncate text-[11px] font-normal leading-[16px] tracking-[-0.02em] text-[#98A2B3]">
            {subtitle}
          </p>
        ) : null}
      </div>
    </button>
  );
}

function MediaChooser({
  state,
  onClose,
  onUpload,
  onCamera,
  onVideo,
}: {
  state: MediaChooserState;
  onClose: () => void;
  onUpload: () => void;
  onCamera: () => void;
  onVideo: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 px-4 font-erp backdrop-blur-[1px]">
      <div className="w-full max-w-[420px] rounded-[24px] bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.25)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.03em] text-[#111827]">
              {state.title}
            </h3>

            <p className="mt-1 text-[13px] leading-[18px] tracking-[-0.02em] text-[#667085]">
              Choose how you want to add media.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition hover:bg-[#F3F4F6]"
          >
            <X className="h-5 w-5 text-[#1F2937]" />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {state.allowFileUpload ? (
            <MediaOption
              icon={Upload}
              title="Upload from device"
              onClick={onUpload}
              className="bg-[#F3F4F6] hover:bg-[#E5E7EB]"
            />
          ) : null}

          {state.allowCamera ? (
            <MediaOption
              icon={Camera}
              title="Click picture with camera"
              onClick={onCamera}
              className="bg-[#EEF4FF] hover:bg-[#DBEAFE]"
            />
          ) : null}

          {state.allowVideoRecord ? (
            <MediaOption
              icon={Video}
              title="Record video with camera"
              onClick={onVideo}
              className="bg-[#F5F3FF] hover:bg-[#EDE9FE]"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MediaOption({
  icon: Icon,
  title,
  onClick,
  className,
}: {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-[48px] items-center gap-3 rounded-[14px] px-4 text-left text-[14px] font-semibold leading-[20px] tracking-[-0.02em] text-[#111827] transition",
        className,
      ].join(" ")}
    >
      <Icon className="h-5 w-5 text-[#667085]" />
      {title}
    </button>
  );
}

function CameraModal({
  mode,
  cameraError,
  recording,
  videoRef,
  onClose,
  onCapturePhoto,
  onStartRecording,
  onStopRecording,
}: {
  mode: "photo" | "video";
  cameraError: string;
  recording: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  onCapturePhoto: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/70 px-4 font-erp backdrop-blur-[2px]">
      <div className="w-full max-w-[620px] overflow-hidden rounded-[24px] bg-white shadow-[0_18px_42px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <h3 className="text-[18px] font-semibold leading-[24px] tracking-[-0.03em] text-[#111827]">
              {mode === "photo" ? "Click Picture" : "Record Video"}
            </h3>

            <p className="text-[13px] leading-[18px] tracking-[-0.02em] text-[#667085]">
              Allow camera permission to capture media.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition hover:bg-[#F3F4F6]"
          >
            <X className="h-5 w-5 text-[#1F2937]" />
          </button>
        </div>

        <div className="bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-[300px] w-full object-cover sm:h-[360px]"
          />
        </div>

        {cameraError ? (
          <div className="mx-5 mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
            {cameraError}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-[38px] rounded-[12px] border border-[#E5E7EB] bg-white px-5 text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-black transition hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>

          {mode === "photo" ? (
            <button
              type="button"
              onClick={onCapturePhoto}
              className="flex h-[38px] items-center justify-center gap-2 rounded-[12px] bg-[#00A83D] px-5 text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-white transition hover:bg-[#009236]"
            >
              <Camera className="h-4 w-4" />
              Capture Photo
            </button>
          ) : (
            <button
              type="button"
              onClick={recording ? onStopRecording : onStartRecording}
              className={[
                "flex h-[38px] items-center justify-center gap-2 rounded-[12px] px-5 text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-white transition",
                recording
                  ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                  : "bg-[#9A28FF] hover:bg-[#7E22CE]",
              ].join(" ")}
            >
              <Video className="h-4 w-4" />
              {recording ? "Stop & Save" : "Start Recording"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}