export type AuditIssue = "pass" | "missing_item" | "damage";
export type AuditStatus = "pending" | "pass" | "issue";

export type RetailStore = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  employeeCount: number;
  revenue: string;
  stockValue: string;
  address?: string;
  phoneNumber?: string | null;
  district?: string | null;
  state?: string | null;
};

export type Item = {
  id: string;
  name: string;
  code: string;
  quantity: string;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWt: string;
  stoneWt: string;
  grossWt: string;
  image: string;
  auditStatus?: AuditStatus;
};

export type Category = {
  id: string;
  name: string;
  code: string;
  quantity: string;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWt: string;
  stoneWt: string;
  grossWt: string;
  auditStatus: AuditStatus;
  items: Item[];
};

export type DistrictStoreManagementListResponse = {
  success: boolean;
  message?: string;
  data: {
    summary: {
      total_stores: number;
      active_stores: number;
      total_employees: number;
      total_stock_value: number;
      total_revenue: number;
    };
    stores: Array<{
      id: number | string;
      store_code: string | null;
      store_name: string | null;
      district_id: number | string | null;
      district: string | null;
      state: string | null;
      address: string | null;
      phone_number: string | null;
      is_active: boolean;
      employee_count: number;
      available_qty: number;
      available_weight: number;
      reserved_qty: number;
      reserved_weight: number;
      stock_value: number;
      revenue: number;
    }>;
  };
};

export type DistrictStoreDetailResponse = {
  success: boolean;
  message?: string;
  data: {
    store: {
      id: number | string;
      store_code: string | null;
      store_name: string | null;
      district_id: number | string | null;
      district: string | null;
      state: string | null;
      address: string | null;
      phone_number: string | null;
      is_active: boolean;
    };
    stock_summary: {
      available_qty: number;
      available_weight: number;
      reserved_qty: number;
      reserved_weight: number;
      transit_qty: number;
      transit_weight: number;
      damaged_qty: number;
      damaged_weight: number;
    };
    filters: {
      selected_category: string;
      search: string;
      categories: string[];
    };
    inventory: Array<{
      item_id: number | string;
      category: string | null;
      code: string | null;
      item_name: string | null;
      quantity: number;
      selling_price: number;
      making_charge: number;
      purity: string | null;
      net_weight: number;
      stone_weight: number;
      gross_weight: number;
      metal_type: string | null;
      current_status: string | null;
      image_url: string | null;
      stock: {
        available_qty: number;
        available_weight: number;
        reserved_qty: number;
        reserved_weight: number;
        transit_qty: number;
        transit_weight: number;
        damaged_qty: number;
        damaged_weight: number;
      };
      action: string;
    }>;
  };
};

export type DistrictStoreCategoryItemsResponse = {
  success: boolean;
  message?: string;
  data: {
    store_id: number | string;
    category: string;
    total_items: number;
    items: Array<{
      item_id: number | string;
      article_code: string | null;
      sku_code: string | null;
      item_name: string | null;
      category: string | null;
      metal_type: string | null;
      purity: string | null;
      gross_weight: number;
      net_weight: number;
      stone_weight: number;
      making_charge: number;
      sale_rate: number;
      purchase_rate: number;
      hsn_code: string | null;
      unit: string | null;
      current_status: string | null;
      image_url: string | null;
      stock: {
        available_qty: number;
        available_weight: number;
        reserved_qty: number;
        reserved_weight: number;
        transit_qty: number;
        transit_weight: number;
        damaged_qty: number;
        damaged_weight: number;
      };
    }>;
  };
};