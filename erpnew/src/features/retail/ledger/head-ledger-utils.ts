import type {
  ClientInvoiceHistoryRow,
  ClientInvoiceRow,
  HeadCustomerInvoicesResponse,
  HeadLedgerCustomerRow,
  HeadLedgerStoreRow,
  HeadLedgerStoresResponse,
  HeadLedgerSummary,
  HeadStoreCustomersResponse,
  LedgerInvoicePaymentDetailResponse,
} from "./types";

const HEAD_LEDGER_FRONTEND_BASE = "/head-office/ledger";

export function headLedgerToNumber(value: unknown) {
  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const num = Number(cleaned || 0);
    return Number.isFinite(num) ? num : 0;
  }

  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

export function headLedgerCurrency(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(headLedgerToNumber(value));
}

export function headLedgerDate(value: unknown) {
  if (!value) return "—";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function firstValue(...values: unknown[]) {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      value !== "null" &&
      value !== "undefined"
    ) {
      return value;
    }
  }

  return null;
}

function getArrayFromResponse<T = any>(response: any, keys: string[]): T[] {
  for (const key of keys) {
    const direct = response?.[key];
    const nested = response?.data?.[key];

    if (Array.isArray(direct)) return direct;
    if (Array.isArray(nested)) return nested;
  }

  if (Array.isArray(response?.data)) return response.data;

  return [];
}

/* -------------------------------------------------------------------------- */
/* HEAD OFFICE STORE LIST                                                       */
/* GET /headledger/stores                                                       */
/* Real backend shape: response.data.dashboard + response.data.ledger           */
/* -------------------------------------------------------------------------- */

export function mapHeadStoresToLedgerRows(
  response: HeadLedgerStoresResponse | any
): {
  rows: HeadLedgerStoreRow[];
  summary: HeadLedgerSummary;
} {
  const dashboard = response?.data?.dashboard || {};

  const ledger = Array.isArray(response?.data?.ledger)
    ? response.data.ledger
    : Array.isArray(response?.ledger)
      ? response.ledger
      : [];

  const rows = ledger
    .map((store: any) => {
      const storeCode = String(
        firstValue(store.store_code, store.storeCode, store.code) || ""
      ).trim();

      if (!storeCode) return null;

      return {
        id: String(firstValue(store.id, storeCode)),
        storeCode,
        storeName: String(
          firstValue(
            store.store_name,
            store.storeName,
            store.name,
            storeCode
          ) || "Unknown Store"
        ),
        storeManager: String(
          firstValue(
            store.store_manager,
            store.storeManager,
            store.manager_name,
            store.managerName,
            store.manager
          ) || "—"
        ),
        organizationLevel: String(
          firstValue(
            store.organization_level,
            store.organizationLevel,
            store.level
          ) || "—"
        ),
        totalDeals: headLedgerToNumber(
          firstValue(
            store.total_deals,
            store.totalDeals,
            store.total_invoices,
            store.invoice_count,
            store.bill_count
          )
        ),
        totalAmount: headLedgerCurrency(
          firstValue(store.total_amount, store.totalAmount, store.total_sales)
        ),
        receivedAmount: headLedgerCurrency(
          firstValue(
            store.received_amount,
            store.receivedAmount,
            store.total_received,
            store.paid_amount
          )
        ),
        pendingAmount: headLedgerCurrency(
          firstValue(
            store.pending_amount,
            store.pendingAmount,
            store.collectable_amount,
            store.due_amount
          )
        ),
        href: `${HEAD_LEDGER_FRONTEND_BASE}/${encodeURIComponent(storeCode)}`,
        raw: store,
      } satisfies HeadLedgerStoreRow;
    })
    .filter(Boolean) as HeadLedgerStoreRow[];

  return {
    summary: {
      totalSales: headLedgerCurrency(dashboard?.totalSales?.value ?? 0),
      loss: headLedgerCurrency(dashboard?.loss?.value ?? 0),
      totalProfit: headLedgerCurrency(dashboard?.totalProfit?.value ?? 0),
      totalRevenue: headLedgerCurrency(dashboard?.totalRevenue?.value ?? 0),
      collectableAmount: headLedgerCurrency(
        dashboard?.collectableAmount?.value ?? 0
      ),
    },
    rows,
  };
}

/* -------------------------------------------------------------------------- */
/* HEAD OFFICE STORE CUSTOMERS                                                  */
/* GET /headstore/store/:store_code/customers                                   */
/* Backend can return response.data = []                                        */
/* -------------------------------------------------------------------------- */

export function mapHeadStoreCustomersToLedgerRows(
  response: HeadStoreCustomersResponse | any,
  storeCode: string
): {
  rows: HeadLedgerCustomerRow[];
  store: any;
  summary: any;
} {
  const customers = getArrayFromResponse<any>(response, [
    "customers",
    "clients",
    "rows",
    "ledger",
    "customerLedger",
    "customerLedgers",
    "data",
  ]);

  const rows = customers
    .map((customer: any) => {
      const customerId = String(
        firstValue(
          customer.customer_id,
          customer.customerId,
          customer.client_id,
          customer.clientId,
          customer.id
        ) || ""
      ).trim();

      if (!customerId) return null;

      return {
        id: customerId,
        customerId,
        clientName: String(
          firstValue(
            customer.client_name,
            customer.clientName,
            customer.customer_name,
            customer.customerName,
            customer.name
          ) || "Unknown Customer"
        ),
        phone: String(
          firstValue(customer.phone, customer.mobile, customer.customer_phone) ||
            "—"
        ),
        totalDeals: headLedgerToNumber(
          firstValue(
            customer.total_deals,
            customer.totalDeals,
            customer.total_invoices,
            customer.invoice_count,
            customer.bill_count
          )
        ),
        totalAmount: headLedgerCurrency(
          firstValue(customer.total_amount, customer.totalAmount, customer.total_sales)
        ),
        receivedAmount: headLedgerCurrency(
          firstValue(
            customer.received_amount,
            customer.receivedAmount,
            customer.total_received,
            customer.paid_amount
          )
        ),
        pendingAmount: headLedgerCurrency(
          firstValue(
            customer.pending_amount,
            customer.pendingAmount,
            customer.collectable_amount,
            customer.due_amount
          )
        ),
        href: `${HEAD_LEDGER_FRONTEND_BASE}/${encodeURIComponent(
          storeCode
        )}/${encodeURIComponent(customerId)}`,
        raw: customer,
      } satisfies HeadLedgerCustomerRow;
    })
    .filter(Boolean) as HeadLedgerCustomerRow[];

  return {
    store: response?.data?.store || response?.store || null,
    summary: response?.data?.summary || response?.summary || {},
    rows,
  };
}

/* -------------------------------------------------------------------------- */
/* HEAD OFFICE CUSTOMER INVOICE LIST                                            */
/* -------------------------------------------------------------------------- */

export function mapHeadCustomerInvoicesToUi(
  response: HeadCustomerInvoicesResponse | any
): {
  customer: any;
  summary: any;
  data: ClientInvoiceRow[];
} {
  const customer = response?.data?.customer || response?.customer || null;

  const invoices = getArrayFromResponse<any>(response, [
    "invoices",
    "deals",
    "rows",
    "ledger",
    "invoiceLedger",
    "invoiceLedgers",
    "data",
  ]);

  return {
    customer,
    summary: response?.data?.summary || response?.summary || {},

    data: invoices.map((invoice: any, index: number) => {
      const invoiceId =
        firstValue(
          invoice.invoice_id,
          invoice.invoiceId,
          invoice.id,
          invoice.reference_id,
          invoice.referenceId
        ) || index;

      const pending = headLedgerToNumber(
        firstValue(invoice.pending_amount, invoice.pendingAmount)
      );

      const received = headLedgerToNumber(
        firstValue(invoice.received_amount, invoice.receivedAmount)
      );

      let status = String(invoice.status || "Pending");

      if (!invoice.status) {
        if (pending <= 0) status = "Paid";
        else if (received > 0) status = "Partially Paid";
      }

      return {
        id: String(invoiceId),
        invoiceId,
        customerId:
          firstValue(customer?.id, customer?.customer_id, invoice.customer_id) ||
          null,
        invoiceNumber: String(
          firstValue(
            invoice.invoice_number,
            invoice.invoiceNumber,
            invoice.bill_number,
            invoice.billNumber,
            invoice.invoiceNo
          ) || `INV-${invoiceId}`
        ),
        billId:
          String(
            firstValue(invoice.bill_number, invoice.invoice_number) || ""
          ) || null,
        date: headLedgerDate(
          firstValue(
            invoice.date,
            invoice.invoice_date,
            invoice.invoiceDate,
            invoice.created_at,
            invoice.createdAt
          )
        ),
        totalAmount: headLedgerCurrency(
          firstValue(invoice.total_amount, invoice.totalAmount)
        ),
        receivedAmount: headLedgerCurrency(
          firstValue(
            invoice.received_amount,
            invoice.receivedAmount,
            invoice.total_received,
            invoice.paid_amount
          )
        ),
        pendingAmount: headLedgerCurrency(
          firstValue(
            invoice.pending_amount,
            invoice.pendingAmount,
            invoice.total_pending,
            invoice.due_amount
          )
        ),
        status,
        storeCode:
          (firstValue(invoice.store_code, customer?.store_code) as string) ||
          null,
        customerName: String(
          firstValue(
            customer?.name,
            customer?.client_name,
            customer?.customer_name,
            invoice.customer_name
          ) || "Customer"
        ),
        customerPhone: String(firstValue(customer?.phone, invoice.phone) || "—"),
        customerAddress: String(
          firstValue(customer?.address, invoice.address) ||
            "Address not available"
        ),
        history: [],
        raw: invoice,
      } satisfies ClientInvoiceRow;
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* HEAD OFFICE INVOICE PAYMENT HISTORY                                          */
/* -------------------------------------------------------------------------- */

export function mapHeadInvoicePaymentsToHistory(
  response: LedgerInvoicePaymentDetailResponse | any
): ClientInvoiceHistoryRow[] {
  const payments = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.payments)
      ? response.payments
      : Array.isArray(response?.data?.payments)
        ? response.data.payments
        : Array.isArray(response?.data?.rows)
          ? response.data.rows
          : [];

  return payments.map((payment: any, index: number) => ({
    id: String(payment.id || payment.payment_id || index),

    date: headLedgerDate(
      firstValue(
        payment.payment_date,
        payment.paid_at,
        payment.created_at,
        payment.createdAt,
        payment.date
      )
    ),

    receivedAmount: headLedgerCurrency(
      firstValue(
        payment.amount,
        payment.received_amount,
        payment.receivedAmount,
        payment.paid_amount,
        payment.payment_amount
      )
    ),

    selfFinancer: String(
      firstValue(
        payment.financier,
        payment.self_financer,
        payment.financer,
        payment.finance_by
      ) || "—"
    ),

    paymentMethod: String(
      firstValue(
        payment.payment_method,
        payment.paymentMethod,
        payment.method,
        payment.mode,
        payment.paymentMode
      ) || "—"
    ),

    txnId: String(
      firstValue(
        payment.txn_id,
        payment.txnId,
        payment.transaction_id,
        payment.transactionId,
        payment.utr,
        payment.reference_no
      ) || "—"
    ),

    operator: String(
      firstValue(
        payment.operator,
        payment.created_by_name,
        payment.created_by,
        payment.user_name,
        payment.userName
      ) || "—"
    ),
  }));
}

export const mapLedgerInvoicePaymentsToHistory =
  mapHeadInvoicePaymentsToHistory;

export const mapPaymentHistoryToUi = mapHeadInvoicePaymentsToHistory;