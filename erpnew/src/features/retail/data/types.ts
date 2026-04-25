export type LedgerClientRow = {
  id: string;
  clientName: string;
  totalDeals: number;
  totalAmount: string;
  receivedAmount: string;
  pendingAmount: string;
};

export type ClientInvoiceRow = {
  id: string;
  invoiceNumber: string;
  date: string;
  totalAmount: string;
  receivedAmount: string;
  pendingAmount: string;
  customerName: string;
  history: PaymentHistoryRow[];
};

export type PaymentHistoryRow = {
  id: string;
  date: string;
  receivedAmount: string;
  selfFinancer: string;
  paymentMethod: string;
  txnId: string;
  operator: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  code: string;
  purity: string;
  weight: string;
  unitRate: string;
  value: string;
};