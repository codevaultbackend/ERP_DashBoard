import type {
  ClientInvoiceHistoryRow,
  ClientInvoiceRow,
  LedgerCustomerDetailResponse,
  LedgerDashboardResponse,
  LedgerInvoicePaymentDetailResponse,
} from "./types";

/* -------------------------------------------------------------------------- */
/* SAFE VALUE HELPERS                                                          */
/* -------------------------------------------------------------------------- */

function isValidValue(value: unknown) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "undefined" &&
    value !== "null"
  );
}

export function toNumber(value: number | string | null | undefined) {
  if (typeof value === "string") {
    const cleaned = value
      .replace(/[₹,\s]/g, "")
      .replace(/L$/i, "");

    const hasLakhSuffix = /L$/i.test(value.trim());
    const num = Number(cleaned || 0);

    if (Number.isNaN(num)) return 0;

    return hasLakhSuffix ? num * 100000 : num;
  }

  const num = Number(value ?? 0);
  return Number.isNaN(num) ? 0 : num;
}

export function formatNumber(value: number | string | null | undefined) {
  const num = toNumber(value);

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * For table/list amounts according to your design:
 * 150000 => ₹1.5L
 * 100000 => ₹1L
 * 50000  => ₹50,000
 */
export function formatCurrency(value: number | string | null | undefined) {
  const amount = toNumber(value);

  if (amount >= 100000) {
    const lakh = amount / 100000;

    return `₹${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: lakh % 1 === 0 ? 0 : 1,
    }).format(lakh)}L`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * For payment history where full amount is better:
 * 50000 => ₹50,000
 */
export function formatCurrencyFull(value: number | string | null | undefined) {
  const amount = toNumber(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Your screenshot uses yyyy-mm-dd style dates.
 */
export function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10) || "—";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* -------------------------------------------------------------------------- */
/* CSV EXPORT                                                                  */
/* -------------------------------------------------------------------------- */

export function downloadCsv(
  filename: string,
  rows: Record<string, string | number | null | undefined>[]
) {
  if (typeof window === "undefined" || !rows.length) return;

  const headers = Object.keys(rows[0]);

  const escapeCell = (value: string | number | null | undefined) => {
    const cell = String(value ?? "");
    return `"${cell.replace(/"/g, '""')}"`;
  };

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCell(row[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------------------- */
/* LEDGER DASHBOARD CLIENT LIST                                                */
/* -------------------------------------------------------------------------- */

export function mapLedgerListToClients(response: LedgerDashboardResponse) {
  const clients = response?.data?.clients ?? [];

  return clients.map((client) => ({
    id: String(client.customer_id),
    customerId: String(client.customer_id),
    clientName: client.client_name?.trim() || "Unknown Client",
    phone: client.phone?.trim() || "—",
    totalDeals: toNumber(client.total_deals),
    totalAmount: formatCurrency(client.total_amount),
    receivedAmount: formatCurrency(client.received_amount),
    pendingAmount: formatCurrency(client.pending_amount),
  }));
}

export const mapLedgerClientsToUi = mapLedgerListToClients;

/* -------------------------------------------------------------------------- */
/* CUSTOMER LEDGER DETAIL                                                       */
/* -------------------------------------------------------------------------- */

function getRealInvoiceId(deal: any) {
  const value =
    deal?.invoice_id ??
    deal?.invoiceId ??
    deal?.reference_id ??
    deal?.referenceId ??
    deal?.invoice?.id ??
    deal?.raw?.invoice_id ??
    deal?.raw?.invoiceId ??
    deal?.raw?.reference_id ??
    deal?.raw?.referenceId ??
    null;

  return isValidValue(value) ? value : null;
}

export function mapCustomerLedgerToUi(
  response: LedgerCustomerDetailResponse
): {
  customer: LedgerCustomerDetailResponse["data"]["customer"] | null;
  summary: {
    totalAmount: string;
    receivedAmount: string;
    pendingAmount: string;
  };
  data: ClientInvoiceRow[];
} {
  const customer = response?.data?.customer ?? null;
  const summary = response?.data?.summary;
  const deals = response?.data?.deals ?? [];

  return {
    customer,
    summary: {
      totalAmount: formatCurrency(summary?.total_amount ?? 0),
      receivedAmount: formatCurrency(summary?.received_amount ?? 0),
      pendingAmount: formatCurrency(summary?.pending_amount ?? 0),
    },
    data: deals.map((deal: any, index: number) => {
      /**
       * IMPORTANT:
       * Payment history API needs invoices.id.
       * Do NOT use ledger_id as invoiceId.
       *
       * If your backend row is:
       * {
       *   ledger_id: 1,
       *   reference_id: 6
       * }
       *
       * invoiceId must be 6, not 1.
       */
      const realInvoiceId = getRealInvoiceId(deal);

      const pending = toNumber(deal?.pending_amount);
      const received = toNumber(deal?.received_amount);

      let status = "Pending";
      if (pending <= 0) status = "Paid";
      else if (received > 0) status = "Partially Paid";

      const invoiceNumber =
        deal?.invoice_number ||
        deal?.invoiceNumber ||
        `INV-${realInvoiceId ?? deal?.ledger_id ?? index + 1}`;

      return {
        id: String(realInvoiceId ?? deal?.ledger_id ?? index),
        invoiceId: realInvoiceId,
        invoice_id: realInvoiceId,
        reference_id: realInvoiceId,

        customerId: customer?.id ?? null,
        invoiceNumber,
        billId: invoiceNumber,

        date: formatDate(deal?.date ?? deal?.invoice_date),
        totalAmount: formatCurrency(deal?.total_amount),
        receivedAmount: formatCurrency(deal?.received_amount),
        pendingAmount: formatCurrency(deal?.pending_amount),
        status,

        storeCode: customer?.store_code ?? null,
        customerName: customer?.name || "Customer",
        customerPhone: customer?.phone || "—",
        customerAddress: customer?.address || "Address not available",

        history: [],
        raw: deal,
      } as ClientInvoiceRow & {
        raw: typeof deal;
        invoice_id: string | number | null;
        reference_id: string | number | null;
      };
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* PAYMENT HISTORY                                                              */
/* -------------------------------------------------------------------------- */

export function mapInvoiceHistoryToUi(
  response: LedgerInvoicePaymentDetailResponse
): ClientInvoiceHistoryRow[] {
  const rows =
    (Array.isArray(response?.data) ? response.data : null) ??
    ((response as any)?.data?.payments || []) ??
    ((response as any)?.payments || []);

  return rows.map((payment: any, index: number) => {
    const paymentId =
      payment?.id ??
      payment?.payment_id ??
      `${payment?.invoice_id ?? "payment"}-${index}`;

    return {
      id: String(paymentId),
      date: formatDate(
        payment?.payment_date ??
          payment?.date ??
          payment?.created_at ??
          payment?.createdAt
      ),
      receivedAmount: formatCurrencyFull(
        payment?.amount ??
          payment?.received_amount ??
          payment?.paid_amount ??
          payment?.payment_amount
      ),
      selfFinancer:
        payment?.financier ||
        payment?.self_financer ||
        payment?.payment_by ||
        "Self",
      paymentMethod:
        payment?.payment_method ||
        payment?.method ||
        payment?.mode ||
        "—",
      txnId:
        payment?.txn_id ||
        payment?.transaction_id ||
        payment?.reference_no ||
        payment?.utr_no ||
        "—",
      operator:
        payment?.operator ||
        payment?.created_by_name ||
        payment?.received_by_name ||
        "—",
    };
  });
}