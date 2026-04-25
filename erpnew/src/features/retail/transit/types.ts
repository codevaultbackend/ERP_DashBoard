export type TransitStatus =
  | "pending"
  | "approved"
  | "dispatched"
  | "in_transit"
  | "received"
  | "delivered"
  | "cancelled";

export type DriverDetails = {
  driver_name?: string | null;
  driver_phone?: string | null;
  vehicle_number?: string | null;
  tracking_number?: string | null;
  driver_photo_url?: string | null;
};

export type TransitMedia = {
  dispatch_image_url?: string | null;
  dispatch_video_url?: string | null;
  receive_image_url?: string | null;
};

export type TransitTransferItem = {
  id: number | string;
  item_name: string;
  category_name?: string;
  quantity: number;
  sku?: string;
  purity?: string;
  weight?: number | string;
  image?: string | null;
  article_code?: string;
  remarks?: string | null;
  rate?: number;
  gross_weight?: number;
  net_weight?: number;
};

export type TransitLocationPoint = {
  lat: number;
  lng: number;
  label?: string;
  timestamp?: string;
};

export type TransitTransfer = {
  id: number;
  transfer_no: string;
  tracking_number?: string;
  request_id?: number | string;

  status: TransitStatus | string;
  remarks?: string | null;

  from_organization_id?: number | string;
  from_organization_name?: string;
  to_organization_id?: number | string;
  to_organization_name?: string;

  from_role?: string;
  to_role?: string;

  transfer_date?: string;
  dispatch_date?: string;
  receive_date?: string;
  expected_delivery_date?: string;
  expected_delivery_time?: string;
  delivered_at?: string;

  created_at?: string;
  updated_at?: string;

  driver_details?: DriverDetails;
  media?: TransitMedia;

  transfer_items?: TransitTransferItem[];

  source_lat?: number | null;
  source_lng?: number | null;
  destination_lat?: number | null;
  destination_lng?: number | null;
  current_lat?: number | null;
  current_lng?: number | null;

  route_points?: TransitLocationPoint[];

  direction?: "incoming" | "outgoing";
};

export type TransitSummary = {
  in_transit: number;
  shipments: number;
  goods_receipt: number;
};

export type TransitListResponse = {
  success: boolean;
  message?: string;
  summary: TransitSummary;
  count?: number;
  data: TransitTransfer[];
};

export type TransitDetailResponse = {
  success: boolean;
  message?: string;
  data: TransitTransfer;
};