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
  Video,
} from "lucide-react";
import stockTransferApi from "@/features/head-office/transit/stockTransferApi";

import { useEffect, useState } from "react";
import { startTransferLiveTracking } from "@/features/retail/request/api/live-tracking-manager";

interface Props {
  open: boolean;
  onClose: () => void;

  transferData: {
    districtId: number;
    items: any[];
  } | null;
}

export default function ApproveStockRequestModal({
  open,
  onClose,
  transferData,
}: Props) {
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

  const [loading, setLoading] = useState(false);

  const [approvedItems, setApprovedItems] =
    useState<any[]>([]);

    const createPreview = (
  file: File
) => {
  return URL.createObjectURL(file);
};


const handleDriverPhoto = (
  file?: File
) => {

  if (!file) return;

  setDriverPhoto(file);
  setDriverPreview(
    createPreview(file)
  );
};


const removeDriverPhoto = () => {
  setDriverPhoto(null);
  setDriverPreview(null);
};

  useEffect(() => {
    if (transferData?.items) {
      setApprovedItems(
        transferData.items.map((item) => ({
          ...item,
          approved_qty: item.qty,
        }))
      );
    }
  }, [transferData]);

  const totalWeight =
    transferData?.items?.reduce(
      (sum, item) =>
        sum + Number(item.weight || 0),
      0
    ) || 0;

  const validateForm = () => {
    const newErrors: Record<string, string> =
      {};

    if (!driverName.trim()) {
      newErrors.driverName =
        "Driver name is required";
    }

    if (!driverPhone.trim()) {
      newErrors.driverPhone =
        "Driver phone is required";
    } else if (
      !/^[6-9]\d{9}$/.test(driverPhone)
    ) {
      newErrors.driverPhone =
        "Enter valid 10 digit mobile number";
    }

    if (!vehicleNumber.trim()) {
      newErrors.vehicleNumber =
        "Vehicle number is required";
    }

    if (!trackingNumber.trim()) {
      newErrors.trackingNumber =
        "Tracking number is required";
    }

    if (!pickupAddress.trim()) {
      newErrors.pickupAddress =
        "Pickup address is required";
    }

    if (!deliveryAddress.trim()) {
      newErrors.deliveryAddress =
        "Delivery address is required";
    }

    if (!expectedDate) {
      newErrors.expectedDate =
        "Expected delivery date required";
    }

    if (!expectedTime) {
      newErrors.expectedTime =
        "Expected delivery time required";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

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

            items: approvedItems.map(
              (item) => ({
                ...item,
                qty: item.approved_qty,
              })
            ),

            driver_name: driverName,
            driver_phone: driverPhone,

            vehicle_number:
              vehicleNumber,

            tracking_number:
              trackingNumber,

            pickup_address:
              pickupAddress,

            delivery_address:
              deliveryAddress,

            expected_delivery_date:
              expectedDate,

            expected_delivery_time:
              expectedTime,

            additional_notes: notes,

            driver_photo:
              driverPhoto,

            dispatch_images:
              dispatchImages,

            dispatch_video:
              dispatchVideo,

            e_way_bill: ewayBill,
          }
        );

      const transferId =
        response?.data?.transfer_id;

      if (transferId) {
        await startTransferLiveTracking(
          transferId
        );
      }

      onClose();
    } catch (error) {
      console.error(error);
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
          max-w-7xl
          h-[95vh]
          sm:h-[92vh]
          rounded-3xl
          bg-white
          shadow-2xl
          flex
          flex-col
          overflow-hidden
        "
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
              Approve Stock Request
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-[768px]:p-2 space-y-5 pb-8">

          {/* REQUEST DETAILS */}

          <section className="rounded-3xl bg-[#F5F7FC] p-4 sm:p-6 max-[768px]:p-2">
            <h3 className="mb-5 text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900">
              Request Details
            </h3>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-4
                gap-5
              "
            >
              <div>
                <p className="text-sm text-slate-500">
                  Requester
                </p>

                <p className="font-semibold">
                  District #
                  {
                    transferData?.districtId
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Request ID
                </p>

                <p className="font-semibold">
                  REQ-
                  {
                    transferData?.districtId
                  }
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Priority
                </p>

                <p className="font-semibold text-orange-500">
                  HIGH
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Created
                </p>

                <p className="font-semibold">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-white p-4">
              <span className="font-medium">
                Notes:
              </span>{" "}
              Stock transfer request awaiting
              approval.
            </div>
          </section>

          {/* PRODUCTS */}

          <section className="rounded-3xl bg-indigo-50 p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Package className="text-violet-600" />

              <h3 className="text-xl sm:text-2xl font-semibold">
                Confirm Products &
                Quantities
              </h3>
            </div>

            <div
              className="
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-4
              "
            >
              {approvedItems.map(
                (item, index) => (
                  <div
                    key={index}
                    className="
                      rounded-3xl
                      bg-white
                      p-5
                      shadow-sm
                      border
                      border-slate-100
                    "
                  >
                    <h4
                      className="
                        mb-4
                        text-lg
                        font-semibold
                        truncate
                      "
                      title={
                        item.item_name
                      }
                    >
                      {item.item_name}
                    </h4>

                    <div
                      className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-4
                      "
                    >
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Requested Quantity
                        </label>

                        <input
                          value={item.qty}
                          disabled
                          className="
                            h-12
                            w-full
                            rounded-xl
                            bg-slate-100
                            px-4
                          "
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Approve Quantity *
                        </label>

                        <input
                          type="number"
                          min={0}
                          value={
                            item.approved_qty
                          }
                          onChange={(e) => {
                            const value =
                              Number(
                                e.target
                                  .value
                              );

                            setApprovedItems(
                              (prev) =>
                                prev.map(
                                  (
                                    p,
                                    i
                                  ) =>
                                    i ===
                                    index
                                      ? {
                                          ...p,
                                          approved_qty:
                                            value,
                                        }
                                      : p
                                )
                            );
                          }}
                          className="
                            h-12
                            w-full
                            rounded-xl
                            border
                            border-slate-200
                            px-4
                          "
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            {/* UPLOADS */}

            <div
              className="
                mt-6
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-4
                gap-4
              "
            >
              <UploadCard

title="Dispatch Images"

subtitle="Camera or Gallery"

uploaded={
dispatchImages.length > 0
}

fileName={
`${dispatchImages.length} images selected`
}

camera

multiple

onChange={(e)=>
setDispatchImages(
Array.from(
e.target.files || []
)
)
}

/>

              <UploadCard

title="Dispatch Video"

subtitle="Record or Upload"

uploaded={
!!dispatchVideo
}

fileName={
dispatchVideo?.name
}

camera

video

onChange={(e)=>
setDispatchVideo(
e.target.files?.[0] ||
null
)
}

/>

              <UploadCard
                title="Upload E-Way Bill"
                subtitle="PDF or Image"
                uploaded={!!ewayBill}
                fileName={ewayBill?.name}
                onChange={(e) =>
                  setEwayBill(
                    e.target.files?.[0] ||
                      null
                  )
                }
              />

              <div
                className="
                  flex
                  flex-col
                  justify-center
                  rounded-2xl
                  bg-white
                  p-5
                "
              >
                <p className="text-lg font-semibold">
                  Total Weight:
                </p>

                <p className="text-2xl xl:text-3xl text-violet-600">
                  {totalWeight.toFixed(2)}
                  g
                </p>
              </div>
            </div>
          </section>

          {/* DELIVERY PARTNER */}

          <section className="rounded-3xl bg-[#ECF7F0] p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <User className="text-green-600" />

              <h3 className="text-xl sm:text-2xl font-semibold">
                Delivery Partner Details
              </h3>
            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-3
                2xl:grid-cols-5
                gap-4
                items-start
              "
            >
              {/* DRIVER NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Driver Name *
                </label>

                <Input
                  value={driverName}
                  onChange={(e) =>
                    setDriverName(
                      e.target.value
                    )
                  }
                  placeholder="Enter Driver Name"
                  error={
                    errors.driverName
                  }
                />
              </div>

              {/* DRIVER PHONE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Driver Number *
                </label>

                <Input
                  value={driverPhone}
                  onChange={(e) =>
                    setDriverPhone(
                      e.target.value
                    )
                  }
                  placeholder="Driver Phone"
                  error={
                    errors.driverPhone
                  }
                />
              </div>

              {/* VEHICLE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Vehicle Number *
                </label>

                <Input
                  value={vehicleNumber}
                  onChange={(e) =>
                    setVehicleNumber(
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="DL01AB1234"
                  error={
                    errors.vehicleNumber
                  }
                />
              </div>

              {/* TRACKING */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tracking Number *
                </label>

                <Input
                  value={trackingNumber}
                  onChange={(e) =>
                    setTrackingNumber(
                      e.target.value
                    )
                  }
                  placeholder="TRK123456"
                  error={
                    errors.trackingNumber
                  }
                />
              </div>

              {/* DRIVER PHOTO */}

              <div>

<label className="mb-2 block text-sm font-medium">
 Driver Photo
</label>


<div className="
 rounded-2xl
 bg-white
 border
 border-slate-200
 p-4
">


{
driverPreview ? (

<div className="relative">

<img
src={driverPreview}
className="
h-32
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
"
>

<Trash2 size={16}/>

</button>


</div>


):(


<div className="
grid
grid-cols-2
gap-3
">


<label
className="
flex
h-12
items-center
justify-center
gap-2
rounded-xl
bg-green-600
text-white
cursor-pointer
text-sm
font-medium
"
>

<Camera size={18}/>

Camera


<input
hidden
type="file"
accept="image/*"
capture="environment"

onChange={(e)=>
handleDriverPhoto(
e.target.files?.[0]
)
}

/>

</label>



<label
className="
flex
h-12
items-center
justify-center
gap-2
rounded-xl
border
cursor-pointer
text-sm
font-medium
"
>

<Upload size={18}/>

Gallery


<input
hidden
type="file"
accept="image/*"

onChange={(e)=>
handleDriverPhoto(
e.target.files?.[0]
)
}

/>


</label>


</div>


)

}


</div>

</div>
            </div>
          </section>

          {/* ADDRESS + SCHEDULE */}

          <div
            className="
              grid
              grid-cols-1
              2xl:grid-cols-[1.5fr_1fr]
              gap-5
            "
          >
            {/* ADDRESS */}

            <section className="rounded-3xl bg-blue-50 p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" />

                <h3 className="text-xl sm:text-2xl font-semibold">
                  Pickup & Delivery
                  Addresses
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={pickupAddress}
                  onChange={(e) =>
                    setPickupAddress(
                      e.target.value
                    )
                  }
                  placeholder="Pickup Address"
                  error={
                    errors.pickupAddress
                  }
                />

                <Input
                  value={deliveryAddress}
                  onChange={(e) =>
                    setDeliveryAddress(
                      e.target.value
                    )
                  }
                  placeholder="Delivery Address"
                  error={
                    errors.deliveryAddress
                  }
                />
              </div>
            </section>

            {/* DELIVERY SCHEDULE */}

            <section className="rounded-3xl bg-yellow-50 p-4 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="text-orange-500" />

                <h3 className="text-xl sm:text-2xl font-semibold">
                  Delivery Schedule
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) =>
                    setExpectedDate(
                      e.target.value
                    )
                  }
                  error={
                    errors.expectedDate
                  }
                />

                <Input
                  type="time"
                  value={expectedTime}
                  onChange={(e) =>
                    setExpectedTime(
                      e.target.value
                    )
                  }
                  error={
                    errors.expectedTime
                  }
                />
              </div>
            </section>
          </div>
          {/* NOTES */}

          <div>
            <label className="mb-2 block font-medium">
              Additional Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              rows={4}
              placeholder="Any special instructions..."
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                p-4
                outline-none
                resize-none
                focus:border-green-500
                focus:ring-2
                focus:ring-green-100
              "
            />
          </div>

        </div>

        {/* FOOTER */}

        <div
          className="
            sticky
            bottom-0
            z-20
            bg-white
            border-t
            border-slate-200
            px-4
            sm:px-6
            py-4
            flex
            flex-col-reverse
            sm:flex-row
            items-stretch
            sm:items-center
            justify-end
            gap-3
          "
        >

          <button
            onClick={onClose}
            disabled={loading}
            className="
              h-12
              w-full
              sm:w-auto
              rounded-xl
              border
              border-slate-300
              px-6
              font-medium
              hover:bg-slate-50
            "
          >
            Cancel
          </button>


          <button
            onClick={handleDispatch}
            disabled={loading}
            className="
              flex
              h-12
              w-full
              sm:w-auto
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-green-600
              px-8
              font-medium
              text-white
              transition
              hover:bg-green-700
              disabled:opacity-50
            "
          >
            <CheckCircle2 className="h-5 w-5" />

            {loading
              ? "Dispatching..."
              : "Approve & Dispatch"}
          </button>

        </div>

      </div>
    </div>
  );
}


/* =====================================================
   UPLOAD CARD COMPONENT
===================================================== */

function UploadCard({

title,
subtitle,
uploaded,
fileName,
multiple=false,
camera=false,
video=false,
onChange,

}:{

title:string;
subtitle:string;
uploaded?:boolean;
fileName?:string;
multiple?:boolean;
camera?:boolean;
video?:boolean;

onChange:
(
e:React.ChangeEvent<HTMLInputElement>
)=>void;

}){


return (

<div
className={`
rounded-2xl
border-2
border-dashed
p-4
bg-white

${uploaded
?
"border-green-500 bg-green-50"
:
"border-slate-300"
}

`}
>


{
uploaded ?


<div className="
flex
flex-col
items-center
gap-2
">


<CheckCircle2
className="
text-green-600
h-8
w-8
"
/>


<p
className="
font-semibold
text-green-700
text-center
break-all
"
>
{fileName}
</p>


</div>


:

<>

<p className="
text-center
font-semibold
mb-3
">

{title}

</p>


<div className="
grid
grid-cols-2
gap-3
">


{
camera &&

<label
className="
h-11
flex
items-center
justify-center
gap-2
rounded-xl
bg-indigo-600
text-white
cursor-pointer
text-sm
"
>

<Camera size={16}/>

Camera


<input
hidden
type="file"

accept={
video
?
"video/*"
:
"image/*"
}

capture="environment"

multiple={multiple}

onChange={onChange}

/>

</label>

}




<label
className="
h-11
flex
items-center
justify-center
gap-2
rounded-xl
border
cursor-pointer
text-sm
"
>


<Upload size={16}/>

Upload


<input

hidden

type="file"

accept={
video
?
"video/*"
:
"image/*"
}

multiple={multiple}

onChange={onChange}

/>


</label>



</div>

</>


}



</div>

)

}



/* =====================================================
   INPUT COMPONENT
===================================================== */


function Input({
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
}) {

  return (
    <div className="w-full">

      <input
        {...props}

        className={`
          h-11
          w-full
          rounded-xl
          border
          px-4
          text-sm
          bg-white
          outline-none
          transition

          ${
            error
              ? "border-red-500 bg-red-50"
              : "border-slate-200"
          }

          focus:border-green-500
          focus:ring-2
          focus:ring-green-100

          ${className}
        `}
      />


      {
        error && (
          <p
            className="
              mt-1
              text-xs
              text-red-500
            "
          >
            {error}
          </p>
        )
      }

    </div>
  );
}





