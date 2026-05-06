export function chartINR(value: any) {
  const num = Number(value || 0);

  if (!Number.isFinite(num)) return "₹0";

  if (num >= 10000000) return `₹${Math.round(num / 10000000)}Cr`;
  if (num >= 100000) return `₹${Math.round(num / 100000)}L`;
  if (num >= 1000) return `₹${Math.round(num / 1000)}K`;

  return `₹${num}`;
}

export function shortLabel(value: any, max = 10) {
  const text = String(value || "");

  if (text.length <= max) return text;

  return `${text.slice(0, max)}...`;
}

export function safeChartData(data: any[]) {
  return Array.isArray(data) ? data : [];
}