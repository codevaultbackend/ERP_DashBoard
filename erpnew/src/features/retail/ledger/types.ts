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
  invoice: {
    invoice_id: number | string;
    invoice_number: string;
    customer_id: number | string | null;
    total_amount: string | number;
    received_amount: string | number;
    pending_amount: string | number;
    status: string;
    store_code: string | null;
  };
  count: number;
  total_paid: string;
  data: LedgerInvoicePayment[];
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
};