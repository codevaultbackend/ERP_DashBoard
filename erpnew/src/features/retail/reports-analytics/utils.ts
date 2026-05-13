export function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const row = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  return row ? decodeURIComponent(row.split("=")[1] || "") : "";
}

export function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("access_token") ||
    getCookie("token") ||
    getCookie("accessToken") ||
    getCookie("access_token") ||
    getCookie("authToken") ||
    getCookie("jwt") ||
    ""
  );
}

export function safeNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[₹,%\s,]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatINR(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeNumber(value));
}

export function formatCompactINR(value: unknown) {
  const num = safeNumber(value);

  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;

  return formatINR(num);
}

export function formatNumber(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(safeNumber(value));
}

export function formatAxisCurrency(value: unknown) {
  const num = safeNumber(value);

  if (num >= 10000000) return `₹${Math.round(num / 10000000)}Cr`;
  if (num >= 100000) return `₹${Math.round(num / 100000)}L`;
  if (num >= 1000) return `₹${Math.round(num / 1000)}K`;

  return `₹${num}`;
}

export function cleanLabel(value: unknown, fallback = "-") {
  if (value === null || value === undefined || String(value).trim() === "") {
    return fallback;
  }

  return String(value).trim();
}

export function getNiceYAxis(maxValue: number) {
  const base = Math.max(1, safeNumber(maxValue));

  if (base <= 10) {
    return {
      yMax: 10,
      ticks: [0, 2.5, 5, 7.5, 10],
    };
  }

  if (base <= 100) {
    return {
      yMax: 100,
      ticks: [0, 25, 50, 75, 100],
    };
  }

  const magnitude = Math.pow(10, Math.floor(Math.log10(base)));
  const yMax = Math.ceil(base / magnitude) * magnitude;
  const step = yMax / 4;

  return {
    yMax,
    ticks: [0, step, step * 2, step * 3, yMax],
  };
}