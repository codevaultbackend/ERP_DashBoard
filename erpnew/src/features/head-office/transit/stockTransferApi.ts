import api from "@/lib/api";

export interface TransferItemPayload {
  item_id?: number;

  item_name: string;
  category: string;
  metal_type: string;

  qty: number;

  weight?: number;
  rate?: number;

  purity?: string;
  hsn_code?: string;

  article_code?: string;
  sku_code?: string;
}

export interface DispatchTransferPayload {
  to_organization_id: number | string;

  driver_name: string;
  driver_phone: string;
  vehicle_number: string;

  pickup_address: string;
  delivery_address: string;

  expected_delivery_date?: string;
  expected_delivery_time?: string;

  additional_notes?: string;
  remarks?: string;

  items: TransferItemPayload[];

  driver_photo?: File | null;
  dispatch_images?: File[];
  dispatch_video?: File | null;
  e_way_bill?: File | null;
}

export interface DispatchTransferResponse {
  success: boolean;
  message: string;
  data?: {
    transfer_id: number;
    transfer_no: string;
    status: string;
  };
}

class StockTransferApi {
  async dispatchNewItemTransfer(
    payload: DispatchTransferPayload
  ): Promise<DispatchTransferResponse> {
    const formData = new FormData();

    formData.append(
      "to_organization_id",
      String(payload.to_organization_id)
    );

    formData.append(
      "driver_name",
      payload.driver_name
    );

    formData.append(
      "driver_phone",
      payload.driver_phone
    );

    formData.append(
      "vehicle_number",
      payload.vehicle_number
    );

    formData.append(
      "pickup_address",
      payload.pickup_address
    );

    formData.append(
      "delivery_address",
      payload.delivery_address
    );

    if (payload.expected_delivery_date) {
      formData.append(
        "expected_delivery_date",
        payload.expected_delivery_date
      );
    }

    if (payload.expected_delivery_time) {
      formData.append(
        "expected_delivery_time",
        payload.expected_delivery_time
      );
    }

    if (payload.additional_notes) {
      formData.append(
        "additional_notes",
        payload.additional_notes
      );
    }

    if (payload.remarks) {
      formData.append(
        "remarks",
        payload.remarks
      );
    }

    formData.append(
      "items",
      JSON.stringify(payload.items)
    );

    if (payload.driver_photo) {
      formData.append(
        "driver_photo",
        payload.driver_photo
      );
    }

    if (payload.dispatch_video) {
      formData.append(
        "dispatch_video",
        payload.dispatch_video
      );
    }

    if (payload.e_way_bill) {
      formData.append(
        "e_way_bill",
        payload.e_way_bill
      );
    }

    if (
      payload.dispatch_images &&
      payload.dispatch_images.length
    ) {
      payload.dispatch_images.forEach((file) => {
        formData.append(
          "dispatch_images",
          file
        );
      });
    }

    const response = await api.post(
      "/request/stock-transfer/new-item-dispatch",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return response.data;
  }
}

export const stockTransferApi =
  new StockTransferApi();

export default stockTransferApi;