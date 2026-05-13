export type LedgerPaymentMethod =
  | "CASH"
  | "CARD"
  | "UPI"
  | "BANK"
  | "CHEQUE"
  | string;

export type LedgerDashboardClient = {
  customer_id: number | string;
  client_name: string | null;
  phone: string | null;
  address?: string | null;
  store_code: string | null;
  total_deals: number;
  total_amount: number | string;
  received_amount: number | string;
  pending_amount: number | string;
};

export type LedgerDashboardSummary = {
  total_sales: number | string;
  loss: number | string;
  goods_receipt: number | string;
};

export type LedgerDashboardResponse = {
  success: boolean;
  message?: string;
  data: {
    summary: LedgerDashboardSummary;
    clients: LedgerDashboardClient[];
  };
};

export type LedgerDeal = {
  ledger_id: number | string;
  invoice_number: string;
  date: string | null;
  total_amount: number | string;
  received_amount: number | string;
  pending_amount: number | string;
  reference_type: string;
  reference_id: number | string | null;
  action?: string;
};

export type LedgerCustomerDetailResponse = {
  success: boolean;
  message?: string;
  data: {
    customer: {
      id: number | string;
      name: string;
      phone: string | null;
      address?: string | null;
      pan_card_number?: string | null;
      store_code?: string | null;
    };
    summary: {
      total_amount: number | string;
      received_amount: number | string;
      pending_amount: number | string;
    };
    deals: LedgerDeal[];
  };
};

export type LedgerClientRow = {
  id: string;
  customerId: string;
  clientName: string;
  phone: string;
  totalDeals: number;
  totalAmount: string;
  receivedAmount: string;
  pendingAmount: string;

  /**
   * Optional custom route.
   * Retail/district old flow will ignore this.
   * Head office can pass /headoffice/ledger/:storeCode safely.
   */
  href?: string;

  raw?: any;
};

export type LedgerInvoicePayment = {
  id: number | string;
  invoice_id: number | string;
  amount: string;
  payment_method: LedgerPaymentMethod;
  financier: string | null;
  txn_id: string | null;
  operator: string | null;
  payment_date: string | null;
  store_code: string | null;
  createdAt: string | null;
};

export type LedgerInvoicePaymentDetailResponse = {
  success: boolean;
  message?: string;
  invoice?: {
    invoice_id: number | string;
    invoice_number: string;
    customer_id: number | string | null;
    total_amount: string | number;
    received_amount: string | number;
    pending_amount: string | number;
    status: string;
    store_code: string | null;
  };
  count?: number;
  total_paid?: string | number;
  data?: LedgerInvoicePayment[] | any[];
  payments?: LedgerInvoicePayment[] | any[];
};

export type ClientInvoiceHistoryRow = {
  id: string;
  date: string;
  receivedAmount: string;
  selfFinancer: string;
  paymentMethod: string;
  txnId: string;
  operator: string;
};

export type ClientInvoiceRow = {
  id: string;
  invoiceId: string | number;
  customerId: string | number | null;
  invoiceNumber: string;
  billId?: string | null;
  date: string;
  totalAmount: string;
  receivedAmount: string;
  pendingAmount: string;
  status: string;
  storeCode: string | null;
  customerName?: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  history: ClientInvoiceHistoryRow[];
  raw?: any;
};

/* -------------------------------------------------------------------------- */
/* HEAD OFFICE LEDGER TYPES                                                    */
/* -------------------------------------------------------------------------- */

export type HeadLedgerDashboardMetric = {
  value: number | string;
  change?: number | string;
};

export type HeadLedgerStoreApiRow = {
  id: string | number;
  store_code: string;
  store_name: string;
  organization_level: string;
  store_manager: string | null;
  total_deals: string | number;
  total_amount: string | number;
  received_amount: string | number;
  pending_amount: string | number;
};

export type HeadLedgerStoresResponse = {
  success: boolean;
  message?: string;
  data?: {
    dashboard?: {
      totalSales?: HeadLedgerDashboardMetric;
      loss?: HeadLedgerDashboardMetric;
      totalProfit?: HeadLedgerDashboardMetric;
      totalRevenue?: HeadLedgerDashboardMetric;
      collectableAmount?: HeadLedgerDashboardMetric;
    };

    /**
     * Real backend shape:
     * GET /headledger/stores
     * response.data.ledger = store list
     */
    ledger?: HeadLedgerStoreApiRow[];
  };
};

export type HeadStoreCustomerApiRow = {
  customer_id?: string | number;
  customerId?: string | number;
  client_id?: string | number;
  clientId?: string | number;
  id?: string | number;

  client_name?: string;
  clientName?: string;
  customer_name?: string;
  customerName?: string;
  name?: string;

  phone?: string | null;
  mobile?: string | null;
  customer_phone?: string | null;

  total_deals?: string | number;
  totalDeals?: string | number;
  total_invoices?: string | number;
  invoice_count?: string | number;
  bill_count?: string | number;

  total_amount?: string | number;
  totalAmount?: string | number;
  total_sales?: string | number;

  received_amount?: string | number;
  receivedAmount?: string | number;
  total_received?: string | number;

  pending_amount?: string | number;
  pendingAmount?: string | number;
  collectable_amount?: string | number;
  due_amount?: string | number;

  [key: string]: any;
};

export type HeadStoreCustomersResponse = {
  success: boolean;
  message?: string;

  /**
   * Real backend shape:
   * GET /headstore/store/:store_code/customers
   * response.data = customer array
   */
  data?: HeadStoreCustomerApiRow[] | any;

  store?: any;
  summary?: any;
  customers?: HeadStoreCustomerApiRow[];
  clients?: HeadStoreCustomerApiRow[];
  rows?: HeadStoreCustomerApiRow[];
};

export type HeadCustomerInvoicesResponse = {
  success: boolean;
  message?: string;
  data?: any;
  customer?: any;
  summary?: any;
  invoices?: any[];
  deals?: any[];
  rows?: any[];
};

export type HeadLedgerStoreRow = {
  id: string;
  storeCode: string;
  storeName: string;
  storeManager: string;
  organizationLevel: string;
  totalDeals: number;
  totalAmount: string;
  receivedAmount: string;
  pendingAmount: string;
  href: string;
  raw?: any;
};

export type HeadLedgerCustomerRow = {
  id: string;
  customerId: string;
  clientName: string;

  /**
   * Optional because head customer table design does not always show phone.
   */
  phone?: string;

  totalDeals: number;
  totalAmount: string;
  receivedAmount: string;
  pendingAmount: string;
  href: string;
  raw?: any;
};

export type HeadLedgerSummary = {
  totalSales: string;
  loss: string;
  totalProfit: string;
  totalRevenue: string;
  collectableAmount: string;
};