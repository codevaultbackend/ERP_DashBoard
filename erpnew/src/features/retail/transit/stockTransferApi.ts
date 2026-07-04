import api from "@/lib/api";

export interface TransferItemPayload {
  item_id?: number;

  item_name: string;
  category?: string;
  metal_type?: string;

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
    const response = await api.post<DispatchTransferResponse>(
      "/request/district-to-retail/direct-transfer",
      {
        to_organization_id: Number(payload.to_organization_id),

        driver_name: payload.driver_name,
        driver_phone: payload.driver_phone,
        vehicle_number: payload.vehicle_number,

        pickup_address: payload.pickup_address,
        delivery_address: payload.delivery_address,

        expected_delivery_date:
          payload.expected_delivery_date,

        expected_delivery_time:
          payload.expected_delivery_time,

        additional_notes:
          payload.additional_notes,

        remarks: payload.remarks,

        items: payload.items.map((item) => ({
          item_id: item.item_id,

          item_name: item.item_name,

          category: item.category,

          metal_type: item.metal_type,

          qty: Number(item.qty),

          weight:
            item.weight !== undefined
              ? Number(item.weight)
              : undefined,

          rate:
            item.rate !== undefined
              ? Number(item.rate)
              : undefined,

          purity: item.purity,

          hsn_code: item.hsn_code,

          article_code: item.article_code,

          sku_code: item.sku_code,
        })),
      }
    );

    return response.data;
  }
}

export const stockTransferApi = new StockTransferApi();

export default stockTransferApi;