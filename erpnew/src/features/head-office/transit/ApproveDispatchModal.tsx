"use client";

import {
  X,
  CheckCircle2,
  Package,
  User,
  MapPin,
  Calendar,
  Camera,
  Upload,
  Trash2,
  ImageIcon,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import stockTransferApi from "@/features/head-office/transit/stockTransferApi";
import { startTransferLiveTracking } from "@/features/retail/request/api/live-tracking-manager";

interface Props {
  open: boolean;
  onClose: () => void;

  transferData: {
    districtId: number;
    items: any[];
    requestId?: string;
    requesterName?: string;
    notes?: string;
    priority?: string;
    createdAt?: string;
  } | null;
}

export default function ApproveStockRequestModal({
  open,
  onClose,
  transferData,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [expectedDate, setExpectedDate] = useState("");
  const [expectedTime, setExpectedTime] = useState("");

  const [notes, setNotes] = useState("");

  const [driverPhoto, setDriverPhoto] =
    useState<File | null>(null);

  const [driverPreview, setDriverPreview] =
    useState<string | null>(null);

  const [dispatchImages, setDispatchImages] =
    useState<File[]>([]);

  const [dispatchVideo, setDispatchVideo] =
    useState<File | null>(null);

  const [ewayBill, setEwayBill] =
    useState<File | null>(null);

  const [approvedItems, setApprovedItems] =
    useState<any[]>([]);

  /**
   * -----------------------
   * LOAD ITEMS
   * -----------------------
   */

  useEffect(() => {
    if (!transferData?.items) {
      setApprovedItems([]);
      return;
    }

    setApprovedItems(
      transferData.items.map((item) => ({
        ...item,
        approved_qty:
          item.approved_qty ??
          item.qty,
      }))
    );
  }, [transferData]);

  /**
   * -----------------------
   * RESET MODAL
   * -----------------------
   */

  useEffect(() => {
    if (!open) {
      setErrors({});

      setDriverName("");
      setDriverPhone("");
      setVehicleNumber("");
      setTrackingNumber("");

      setPickupAddress("");
      setDeliveryAddress("");

      setExpectedDate("");
      setExpectedTime("");

      setNotes("");

      setDriverPhoto(null);

      if (driverPreview) {
        URL.revokeObjectURL(driverPreview);
      }

      setDriverPreview(null);

      setDispatchImages([]);
      setDispatchVideo(null);
      setEwayBill(null);

      setApprovedItems([]);
    }
  }, [open]);

  /**
   * -----------------------
   * TOTAL WEIGHT
   * -----------------------
   */

  const totalWeight = useMemo(() => {
    return approvedItems.reduce(
      (sum, item) =>
        sum +
        Number(item.weight || 0) *
        Number(item.approved_qty || 0),
      0
    );
  }, [approvedItems]);

  /**
   * -----------------------
   * DRIVER PHOTO
   * -----------------------
   */

  const handleDriverPhoto = (
    file?: File
  ) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image allowed");
      return;
    }

    if (driverPreview) {
      URL.revokeObjectURL(driverPreview);
    }

    setDriverPhoto(file);

    setDriverPreview(
      URL.createObjectURL(file)
    );
  };

  const removeDriverPhoto = () => {
    if (driverPreview) {
      URL.revokeObjectURL(driverPreview);
    }

    setDriverPhoto(null);
    setDriverPreview(null);
  };

  /**
   * -----------------------
   * FORM VALIDATION
   * -----------------------
   */

  const validateForm = () => {
    const newErrors: Record<string, string> =
      {};

    if (!driverName.trim()) {
      newErrors.driverName =
        "Driver name is required";
    }

    if (
      !/^[6-9]\d{9}$/.test(
        driverPhone.trim()
      )
    ) {
      newErrors.driverPhone =
        "Enter valid mobile number";
    }

    if (!vehicleNumber.trim()) {
      newErrors.vehicleNumber =
        "Vehicle number required";
    }

    if (!trackingNumber.trim()) {
      newErrors.trackingNumber =
        "Tracking number required";
    }

    if (!pickupAddress.trim()) {
      newErrors.pickupAddress =
        "Pickup address required";
    }

    if (!deliveryAddress.trim()) {
      newErrors.deliveryAddress =
        "Delivery address required";
    }

    if (!expectedDate) {
      newErrors.expectedDate =
        "Delivery date required";
    } else {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const selected =
        new Date(expectedDate);

      selected.setHours(0, 0, 0, 0);

      if (selected < today) {
        newErrors.expectedDate =
          "Past date not allowed";
      }
    }

    if (!expectedTime) {
      newErrors.expectedTime =
        "Delivery time required";
    }

    approvedItems.forEach(
      (item, index) => {

        const qty =
          Number(item.approved_qty);

        if (
          qty <= 0 ||
          qty > Number(item.qty)
        ) {
          newErrors[
            `qty_${index}`
          ] =
            `Qty must be between 1 and ${item.qty}`;
        }
      }
    );

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  /**
   * -----------------------
   * DISPATCH
   * -----------------------
   */

  const handleDispatch = async () => {

    if (!transferData) return;

    if (!validateForm()) return;

    try {

      setLoading(true);

      const response =
        await stockTransferApi.dispatchNewItemTransfer(
          {

            to_organization_id:
              transferData.districtId,

            driver_name:
              driverName,

            driver_phone:
              driverPhone,

            vehicle_number:
              vehicleNumber,

            pickup_address:
              pickupAddress,

            delivery_address:
              deliveryAddress,

            expected_delivery_date:
              expectedDate,

            expected_delivery_time:
              expectedTime,

            additional_notes:
              notes,

            remarks:
              `Tracking Number : ${trackingNumber}`,

            /**
             * IMPORTANT
             * Preserve all backend fields.
             */

            items:
              approvedItems.map(
                (item) => ({

                  ...item,

                  qty:
                    Number(
                      item.approved_qty
                    ),

                })
              ),

            driver_photo:
              driverPhoto,

            dispatch_images:
              dispatchImages,

            dispatch_video:
              dispatchVideo,

            e_way_bill:
              ewayBill,

          }
        );

      const transferId =
        response.data?.transfer_id;

      if (transferId) {

        await startTransferLiveTracking(
          transferId
        );

      }

      onClose();

    } catch (error: any) {

      alert(
        error.message ||
        "Dispatch Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">

      <div
        className="
relative
w-full
max-w-[984px]
h-[95vh]
overflow-hidden
rounded-[30px]
bg-white
shadow-[0_20px_60px_rgba(0,0,0,.18)]
flex
flex-col
"
      >

        {/* ================= HEADER ================= */}

        <div
          className="
flex
items-center
justify-between
border-b
border-slate-100
px-8
max-[768px]:!px-4
py-6
"
        >

          <div className="flex items-center gap-4 max-[768px]:gap-">

            <div
              className="
flex
h-11
w-11
items-center
justify-center
rounded-full
bg-green-50
"
            >

              <CheckCircle2
                className="h-7 w-7 text-green-600"
              />

            </div>

            <div>

              <h2
                className="
text-[24px]
max-[768px]:text-[18px]
font-[600]
text-slate-900
"
              >

                Approve Stock Request

              </h2>

            </div>

          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="
rounded-full
p-2
transition
hover:bg-slate-100
"
          >

            <X className="h-6 w-6" />

          </button>

        </div>

        {/* ================= BODY ================= */}

        <div
          className="
flex-1
overflow-y-auto
px-3
py-3
space-y-3
"
        >

          {/* ================================================= */}
          {/* REQUEST DETAILS */}
          {/* ================================================= */}

          <section
            className="
rounded-[28px]
bg-gradient-to-r
from-[#EEF4FF]
to-[#F8F2FF]
p-6
"
          >

            <h3
              className="
mb-5
text-[18px]
font-semibold
text-[#101828]
"
            >

              Request Details

            </h3>

            <div
              className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-8
text-[14px] font-[400]
"
            >

              <div className="flex gap-1.5 items-center">

                <p className="text-sm text-slate-500">

                  Requester :

                </p>

                <p
                  className="
mt-1
font-semibold
text-slate-900
"
                >

                  {
                    transferData?.requesterName
                    ??
                    `District #${transferData?.districtId}`
                  }

                </p>

              </div>

              <div className="flex gap-1.5 items-center">

                <p className="text-sm text-slate-500">

                  Request ID

                </p>

                <p className="mt-1 font-semibold">

                  {
                    transferData?.requestId
                    ??

                    `REQ-${transferData?.districtId}`
                  }

                </p>

              </div>

              <div className="flex gap-1.5 items-center">

                <p className="text-sm text-slate-500">

                  Priority

                </p>

                <p
                  className="
mt-1
font-semibold
text-orange-500
uppercase
"
                >

                  {
                    transferData?.priority
                    ??

                    "HIGH"
                  }

                </p>

              </div>

              <div className="flex gap-1.5 items-center">

                <p className="text-sm text-slate-500">

                  Created

                </p>

                <p className="mt-1 font-semibold">

                  {
                    transferData?.createdAt
                    ??

                    new Date().toLocaleDateString()
                  }

                </p>

              </div>

            </div>

            <div
              className="
mt-6
rounded-2xl
bg-white
px-5
py-4
text-[14px] font-[400]
text-[#364153]
"
            >

              <span
                className="
font-semibold

"
              >

                Notes:

              </span>

              {" "}

              {
                transferData?.notes
                ??

                "Stock transfer request awaiting approval."
              }

            </div>

          </section>

          {/* ================================================= */}
          {/* PRODUCTS */}
          {/* ================================================= */}

          <section
            className="
rounded-[28px]
bg-gradient-to-r
from-[#F6F0FF]
to-[#EEF6FF]
p-6
"
          >

            <div
              className="
mb-6
flex
items-center
gap-3
"
            >

              <div
                className="
flex
h-10
w-10
items-center
justify-center
rounded-full
bg-violet-100
"
              >

                <Package
                  className="
h-5
w-5
text-violet-700
"
                />

              </div>

              <h3
                className="
text-[18px]
font-[600]
text-[#101828]
font-semibold
"
              >

                Confirm Products & Quantities

              </h3>

            </div>

            <div
              className="
grid
grid-cols-1
xl:grid-cols-2
gap-5
"
            >

              {
                approvedItems.map(
                  (item, index) => (
                    <div
                      key={
                        item.sku_code ??
                        item.item_id ??
                        index
                      }
                      className="
rounded-[24px]
bg-white
border
border-slate-100
p-6
shadow-sm
"
                    >

                      <h4
                        className="
truncate
text-[16px]
font-[500]
text-[#101828]
"
                      >

                        {item.item_name}

                      </h4>

                      <div
                        className="
mt-5
grid
grid-cols-2
gap-5
"
                      >

                        <div>

                          <label
                            className="
mb-2
block
text-sm
font-medium
text-[#0A0A0A]
"
                          >

                            Requested Quantity

                          </label>

                          <input
                            disabled
                            value={item.qty}
                            className="
h-9
w-full
rounded-xl
bg-slate-100
px-4
font-medium
"
                          />

                        </div>

                        <div>

                          <label
                            className="
mb-2
block
text-sm
font-medium
"
                          >

                            Approve Quantity *

                          </label>

                          <input
                            type="number"
                            min={1}
                            max={item.qty}
                            value={item.approved_qty}
                            onChange={(e) => {

                              const value = Math.max(
                                1,
                                Math.min(
                                  Number(e.target.value),
                                  Number(item.qty)
                                )
                              );

                              setApprovedItems(prev =>

                                prev.map((p, i) =>

                                  i === index

                                    ?

                                    {
                                      ...p,
                                      approved_qty: value
                                    }

                                    : p

                                )

                              );

                            }}
                            className={`
h-9
w-full
rounded-xl
border
px-4
outline-none
bg-slate-100
${errors[`qty_${index}`]

                                ?

                                "border-red-500 bg-red-50"

                                :

                                "border-slate-200"

                              }

focus:border-green-500
`}
                          />

                          {
                            errors[`qty_${index}`] &&

                            <p
                              className="
mt-1
text-xs
text-red-500
"
                            >

                              {
                                errors[`qty_${index}`]
                              }

                            </p>

                          }

                        </div>

                      </div>

                    </div>

                  ))}
            </div>

            {/* ================================================= */}
            {/* UPLOADS */}
            {/* ================================================= */}

            <div
              className="
mt-6
grid
grid-cols-1
sm:grid-cols-2
xl:grid-cols-4
gap-5
"
            >

              <UploadCard
                title="Dispatch Images"
                subtitle="Drag and Drop Images"
                camera
                multiple
                uploaded={dispatchImages.length > 0}
                fileName={`${dispatchImages.length} Images`}
                onChange={(e) => {

                  const files = Array.from(
                    e.target.files ?? []
                  );

                  setDispatchImages(files);

                }}
              />

              <UploadCard
                title="Dispatch Video"
                subtitle="Record or Upload"
                camera
                video
                uploaded={!!dispatchVideo}
                fileName={dispatchVideo?.name}
                onChange={(e) => {

                  setDispatchVideo(

                    e.target.files?.[0] ??

                    null

                  );

                }}
              />

              <UploadCard
                title="Upload E-Way Bill"
                subtitle="Upload PDF or Image"
                uploadOnly
                uploaded={!!ewayBill}
                fileName={ewayBill?.name}
                onChange={(e) => {
                  setEwayBill(
                    e.target.files?.[0] ?? null
                  );
                }}
              />

              <div
                className="
rounded-[24px]
bg-white
p-6
flex
flex-col
justify-center
max-h-[80px]
"
              >

                <p
                  className="
text-[16px]
font-semibold
text-[#101828]
leading-[24px]
"
                >

                  Total Weight

                </p>

                <p
                  className="
mt-2
text-[18px]
font-[700]
text-[#9810FA]
"
                >

                  {
                    totalWeight.toFixed(2)
                  }g

                </p>

              </div>

            </div>

          </section>
          {/* ================================================= */}
          {/* DELIVERY PARTNER DETAILS */}
          {/* ================================================= */}

          <section
            className="
rounded-[28px]
bg-gradient-to-r
from-[#EEFCEF]
to-[#F2FFF9]
p-6
"
          >

            <div className="mb-6 flex items-center gap-3">

              <div
                className="
flex
h-10
w-10
items-center
justify-center
rounded-full
bg-green-100
"
              >

                <User
                  className="
h-5
w-5
text-green-700
"
                />

              </div>

              <h3
                className="
   text-[18px]   font-[600]   text-[#101828]   font-semibold   
"
              >

                Delivery Partner Details

              </h3>

            </div>

            <div
              className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-5
gap-5
items-start
"
            >

              {/* Driver */}

              <div>

                <label className="mb-2 block text-sm font-medium whitespace-nowrap">

                  Driver Name *

                </label>

                <Input
                  value={driverName}
                  placeholder="Enter driver name"
                  error={errors.driverName}
                  onChange={(e) =>
                    setDriverName(e.target.value)
                  }
                />

              </div>

              {/* Phone */}

              <div>

                <label className="mb-2 block text-sm font-medium whitespace-nowrap">

                  Driver Phone *

                </label>

                <Input
                  value={driverPhone}
                  placeholder="10 digit"
                  error={errors.driverPhone}
                  onChange={(e) =>
                    setDriverPhone(
                      e.target.value.replace(/[^\d]/g, "")
                    )
                  }
                />

              </div>

              {/* Vehicle */}

              <div>

                <label className="mb-2 block text-sm font-medium whitespace-nowrap">

                  Vehicle Number *

                </label>

                <Input
                  value={vehicleNumber}
                  placeholder="DL01AB1234"
                  error={errors.vehicleNumber}
                  onChange={(e) =>
                    setVehicleNumber(
                      e.target.value.toUpperCase()
                    )
                  }
                />

              </div>

              {/* Tracking */}

              <div>

                <label className="mb-2 block text-sm font-medium whitespace-nowrap">

                  Tracking Number *

                </label>

                <Input
                  value={trackingNumber}
                  placeholder="TRK-XXXXXXXX"
                  error={errors.trackingNumber}
                  onChange={(e) =>
                    setTrackingNumber(e.target.value)
                  }
                />

              </div>

              {/* Driver Photo */}

              <div>

                <label className="mb-2 block text-sm font-medium whitespace-nowrap">

                  Driver Photo

                </label>

                <div
                  className="
rounded-2xl
border
border-slate-200
bg-white
p-4
"
                >

                  {

                    driverPreview ?

                      <div className="relative">

                        <img

                          src={driverPreview}

                          alt="Driver"

                          className="
h-[130px]
w-full
rounded-xl
object-cover
"
                        />

                        <button

                          type="button"

                          onClick={removeDriverPhoto}

                          className="
absolute
right-2
top-2
rounded-full
bg-red-500
p-2
text-white
shadow
"

                        >

                          <Trash2
                            size={16}
                          />

                        </button>

                      </div>

                      :

                      <div
                        className="
grid
grid-cols-1
gap-3
"
                      >

                        <label
                          className="
flex
h-9
cursor-pointer
items-center
justify-center
gap-2
rounded-xl
bg-green-600
text-white
text-sm
font-medium
"
                        >

                          <Camera size={17} />

                          Camera

                          <input

                            hidden

                            type="file"

                            capture="environment"

                            accept="image/*"

                            onChange={(e) =>

                              handleDriverPhoto(
                                e.target.files?.[0]
                              )

                            }

                          />

                        </label>

                        <label
                          className="
flex
h-9
cursor-pointer
items-center
justify-center
gap-2
rounded-xl
border
text-sm
font-medium
"
                        >

                          <Upload size={17} />

                          Gallery

                          <input

                            hidden

                            type="file"

                            accept="image/*"

                            onChange={(e) =>

                              handleDriverPhoto(
                                e.target.files?.[0]
                              )

                            }

                          />

                        </label>

                      </div>

                  }

                </div>

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* ADDRESS + DELIVERY */}
          {/* ================================================= */}

          <div
            className="
grid
grid-cols-1
2xl:grid-cols-[1.55fr_1fr]
gap-6
"
          >

            {/* ADDRESS */}

            <section
              className="
rounded-[28px]
bg-gradient-to-r
from-[#EEF4FF]
to-[#F7FBFF]
p-6
"
            >

              <div className="mb-5 flex items-center gap-3">

                <div
                  className="
flex
h-10
w-10
items-center
justify-center
rounded-full
bg-blue-100
"
                >

                  <MapPin
                    className="
h-5
w-5
text-blue-700
"
                  />

                </div>

                <h3
                  className="
   text-[18px]   font-[600]   text-[#101828]   font-semibold      
"
                >

                  Pickup & Delivery Addresses

                </h3>

              </div>

              <div
                className="
grid
grid-cols-1
md:grid-cols-2
gap-5
"
              >

                <div>

                  <label className="mb-2 block text-[11px] font-medium whitespace-nowrap">

                    Pickup Address *

                  </label>

                  <Input
                    value={pickupAddress}
                    error={errors.pickupAddress}
                    placeholder="Head Office Warehouse"
                    onChange={(e) =>
                      setPickupAddress(e.target.value)
                    }
                  />

                </div>

                <div>

                  <label className="mb-2 block text-[11px] font-medium whitespace-nowrap">

                    Delivery Address *

                  </label>

                  <Input
                    value={deliveryAddress}
                    error={errors.deliveryAddress}
                    placeholder="District Store"
                    onChange={(e) =>
                      setDeliveryAddress(e.target.value)
                    }
                  />

                </div>

              </div>

            </section>

            {/* DELIVERY */}

            <section
              className="
rounded-[28px]
bg-gradient-to-r
from-[#FFF7E4]
to-[#FFFDF3]
p-6
"
            >

              <div className="mb-5 flex items-center gap-3">

                <div
                  className="
flex
h-10
w-10
items-center
justify-center
rounded-full
bg-orange-100
"
                >

                  <Calendar
                    className="
h-5
w-5
text-orange-600
"
                  />

                </div>

                <h3
                  className="
      text-[18px]   font-[600]   text-[#101828]   font-semibold               
"
                >

                  Delivery Schedule

                </h3>

              </div>

              <div
                className="
grid
grid-cols-1
md:grid-cols-2
gap-5
"
              >

                <div>

                  <label className="mb-2 block text-[11px] font-medium ">

                    Expected Delivery Date *

                  </label>

                  <Input
                    type="date"
                    value={expectedDate}
                    error={errors.expectedDate}
                    onChange={(e) =>
                      setExpectedDate(e.target.value)
                    }
                  />

                </div>

                <div>

                  <label className="mb-2 block text-[11px]  font-medium whitespace-nowrap ml-2">

                    Expected Time *

                  </label>

                  <Input
                    type="time"
                    value={expectedTime}
                    error={errors.expectedTime}
                    onChange={(e) =>
                      setExpectedTime(e.target.value)
                    }
                  />

                </div>

              </div>

            </section>

          </div>

          {/* ================================================= */}
          {/* NOTES */}
          {/* ================================================= */}

          <section>

            <label
              className="
   text-[18px]   font-[600]   text-[#101828]   font-semibold    !mb-2
"
            >

              Additional Notes

            </label>

            <textarea

              rows={5}

              value={notes}

              onChange={(e) =>
                setNotes(e.target.value)
              }

              placeholder="Any special instruction..."

              className="
w-full
resize-none
rounded-[22px]
border
border-slate-200
bg-white
p-5
outline-none
transition
mt-[10px]
focus:border-green-500
focus:ring-4
focus:ring-green-100
"
            />

          </section>

        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div
          className="
sticky
bottom-0
border-t
border-slate-200
bg-white
px-8
max-[768px]:!px-4

py-5
"
        >

          <div
            className="
flex
flex-col-reverse
gap-3
sm:flex-row
sm:justify-end
"
          >

            <button

              type="button"

              disabled={loading}

              onClick={onClose}

              className="
h-12
rounded-xl
border
border-slate-300
px-7
font-medium
transition
hover:bg-slate-50
"

            >

              Cancel

            </button>

            <button

              type="button"

              disabled={loading}

              onClick={handleDispatch}

              className="
flex
h-12
items-center
justify-center
gap-2
rounded-xl
bg-green-600
px-8
max-[768px]:!px-4

font-semibold
text-white
transition

hover:bg-green-700

disabled:cursor-not-allowed
disabled:opacity-60
"

            >

              <CheckCircle2
                className="h-5 w-5"
              />

              {

                loading

                  ?

                  "Dispatching..."

                  :

                  "Approve & Dispatch"

              }

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
/* =====================================================
   UPLOAD CARD COMPONENT
===================================================== */


interface UploadCardProps {
  title: string;
  subtitle?: string;
  uploaded?: boolean;
  fileName?: string;
  multiple?: boolean;
  camera?: boolean;
  video?: boolean;
  uploadOnly?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

function UploadCard({
  title,
  subtitle,
  uploaded = false,
  fileName,
  multiple = false,
  camera = false,
  video = false,
  uploadOnly = false,
  onChange,
}: UploadCardProps) {
  return (
    <div
      className={`
        overflow-hidden
        rounded-2xl
        border
        bg-white
        shadow-sm
        transition-all
        duration-300

        ${uploaded
          ? "border-emerald-200 ring-1 ring-emerald-100"
          : "border-slate-200 hover:border-green-400 hover:shadow-md"
        }
      `}
    >
      {/* Header */}

      <div
        className={`
          flex
          items-center
          gap-3
          border-b
          px-4
          py-3

          ${uploaded
            ? "border-emerald-100 bg-emerald-50"
            : "border-slate-100 bg-slate-50"
          }
        `}
      >
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl

            ${uploaded
              ? "bg-emerald-100"
              : "bg-green-100"
            }
          `}
        >
          {uploaded ? (
            <CheckCircle2
              size={20}
              className="text-emerald-600"
            />
          ) : (
            <Upload
              size={18}
              className="text-green-700"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-slate-900">
            {title}
          </h4>

          <p
            className={`truncate text-xs ${uploaded
              ? "text-emerald-700"
              : "text-slate-500"
              }`}
          >
            {uploaded
              ? fileName
              : subtitle}
          </p>
        </div>
      </div>

      {/* Body */}

      <div className="p-4">

        {!uploaded ? (
          <>

            <p className="mb-3 text-xs text-slate-400">
              {video
                ? "Supported: MP4, MOV"
                : "Supported: JPG, PNG, PDF"}
            </p>

            <div
              className={`
                grid
                gap-3

                ${camera && !uploadOnly
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1"
                }
              `}
            >

              {camera && !uploadOnly && (
                <label
                  className="
                    flex
                    h-11
                    cursor-pointer
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-green-600
                    text-sm
                    font-medium
                    text-white
                    transition-all

                    hover:bg-green-700
                    hover:shadow
                    active:scale-[0.98]
                  "
                >
                  <Camera size={17} />

                  Camera

                  <input
                    hidden
                    type="file"
                    capture="environment"
                    accept={
                      video
                        ? "video/*"
                        : "image/*"
                    }
                    multiple={multiple}
                    onChange={onChange}
                  />
                </label>
              )}

              <label
                className="
                  flex
                  h-11
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  text-sm
                  font-medium
                  text-slate-700
                  transition-all

                  hover:border-green-500
                  hover:bg-green-50
                  hover:shadow
                  active:scale-[0.98]
                "
              >
                <Upload size={17} />

                {uploadOnly
                  ? "Choose File"
                  : "Upload"}

                <input
                  hidden
                  type="file"
                  accept={
                    video
                      ? "video/*"
                      : "image/*,.pdf"
                  }
                  multiple={multiple}
                  onChange={onChange}
                />
              </label>

            </div>

          </>
        ) : (
          <div className="space-y-3">

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">

              <div className="flex items-center gap-2">

                <CheckCircle2
                  size={18}
                  className="text-emerald-600"
                />

                <span className="truncate text-sm font-medium text-emerald-700">
                  {fileName}
                </span>

              </div>

            </div>

            <label
              className="
                flex
                h-10
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                border
                border-slate-300
                bg-white
                text-sm
                font-medium
                text-slate-700
                transition-all

                hover:border-green-500
                hover:bg-green-50
              "
            >
              Replace File

              <input
                hidden
                type="file"
                accept={
                  video
                    ? "video/*"
                    : "image/*,.pdf"
                }
                multiple={multiple}
                onChange={onChange}
              />
            </label>

          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   INPUT COMPONENT
===================================================== */

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

function Input({
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">

      <input
        {...props}
        autoComplete="off"
        className={`
          h-12
          w-full
          rounded-xl
          border
          bg-white
          px-4
          text-sm
          outline-none
          transition-all

          ${error
            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : "border-slate-300 focus:border-green-500 focus:ring-4 focus:ring-green-100"
          }

          placeholder:text-slate-400

          disabled:bg-slate-100
          disabled:text-slate-500

          ${className}
        `}
      />

      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}