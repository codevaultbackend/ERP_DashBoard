import type {
  ClientInvoiceHistoryRow,
  ClientInvoiceRow,
  LedgerCustomerDetailResponse,
  LedgerDashboardResponse,
} from "./types";

export function toNumber(value: number | string | null | undefined) {
  const num = Number(value ?? 0);
  return Number.isNaN(num) ? 0 : num;
}

export function formatCurrency(value: number | string | null | undefined) {
  const amount = toNumber(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number | string | null | undefined) {
  const num = toNumber(value);

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

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
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
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

/**
 * Backward-compatible alias for old imports used in page.tsx
 */
export const mapLedgerClientsToUi = mapLedgerListToClients;

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
    data: deals.map((deal) => {
      const pending = toNumber(deal.pending_amount);
      const received = toNumber(deal.received_amount);

      let status = "Pending";
      if (pending <= 0) status = "Paid";
      else if (received > 0) status = "Partially Paid";

      return {
        id: String(deal.ledger_id),
        invoiceId: deal.ledger_id,
        customerId: customer?.id ?? null,
        invoiceNumber: deal.invoice_number || `INV-${deal.ledger_id}`,
        billId: deal.invoice_number || null,
        date: formatDate(deal.date),
        totalAmount: formatCurrency(deal.total_amount),
        receivedAmount: formatCurrency(deal.received_amount),
        pendingAmount: formatCurrency(deal.pending_amount),
        status,
        storeCode: customer?.store_code ?? null,
        customerName: customer?.name || "Customer",
        customerPhone: customer?.phone || "—",
        customerAddress: customer?.address || "Address not available",
        history: [],
      };
    }),
  };
}

export function mapInvoiceHistoryToUi(): ClientInvoiceHistoryRow[] {
  return [];
}