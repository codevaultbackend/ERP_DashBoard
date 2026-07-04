import api from "@/lib/api";

export interface TransferItemPayload {
  // Existing Inventory
  item_id?: number;

  // New Inventory
  sku_code?: string;

  // Required
  qty: number;
  weight: number;
  rate: number;

  // Optional UI fields (ignored by backend if sent)
  item_name?: string;
  article_code?: string;
  category?: string;
  metal_type?: string;
  purity?: string;
  hsn_code?: string;

  gross_weight?: number;
  net_weight?: number;
  stone_weight?: number;
  stone_amount?: number;

  making_charge?: number;
  purchase_rate?: number;
  sale_rate?: number;

  subcategory?: string;
  details?: string;
  unit?: string;
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
    payload.items.forEach((item, index) => {
      if (!item.item_id && !item.sku_code) {
        throw new Error(
          `Item ${index + 1} must contain either item_id or sku_code`
        );
      }

      if (!item.qty || !item.weight || !item.rate) {
        throw new Error(
          `Item ${index + 1} is missing qty, weight or rate`
        );
      }
    });

    const itemsPayload = payload.items.map((item) => ({
      item_id: item.item_id,
      sku_code: item.sku_code,

      item_name: item.item_name,
      article_code: item.article_code,
      category: item.category,
      metal_type: item.metal_type,
      purity: item.purity,
      hsn_code: item.hsn_code,

      qty: Number(item.qty),
      weight: Number(item.weight),
      rate: Number(item.rate),

      gross_weight: item.gross_weight,
      net_weight: item.net_weight,
      stone_weight: item.stone_weight,
      stone_amount: item.stone_amount,

      making_charge: item.making_charge,
      purchase_rate: item.purchase_rate,
      sale_rate: item.sale_rate,

      subcategory: item.subcategory,
      details: item.details,
      unit: item.unit,
    }));

    formData.append(
      "items",
      JSON.stringify(itemsPayload)
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