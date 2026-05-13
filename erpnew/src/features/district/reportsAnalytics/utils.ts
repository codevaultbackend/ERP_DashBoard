export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function toNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function safePercent(value: unknown) {
  const num = toNumber(value);
  return Math.min(100, Math.max(0, num));
}

export function formatCurrency(value: unknown) {
  const num = toNumber(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}

export function formatCompactCurrency(value: unknown) {
  const num = toNumber(value);

  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  }

  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }

  if (Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(0)}K`;
  }

  return `₹${num.toFixed(0)}`;
}

export function getCategoryColor(index: number) {
  const colors = [
    "#7C3AED",
    "#2563EB",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#EC4899",
    "#14B8A6",
    "#6366F1",
  ];

  return colors[index % colors.length];
}

export function getMetalTypeColor(index: number) {
  const colors = ["#F2A900", "#FACC15", "#D0D5DD", "#98A2B3", "#64748B"];
  return colors[index % colors.length];
}

export function getRankColor(rank: number) {
  if (rank === 1) return "bg-[#F2A900] text-white";
  if (rank === 2) return "bg-[#9CA3AF] text-white";
  if (rank === 3) return "bg-[#F97316] text-white";
  return "bg-[#2F80ED] text-white";
}