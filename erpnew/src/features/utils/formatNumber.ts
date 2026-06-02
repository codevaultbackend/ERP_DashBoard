export const formatNumber = (
  value: number | string | null | undefined,
  digits = 2
): string => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  const cleanedValue = String(value)
    .replace(/[₹,\s]/g, "")
    .trim();

  const num = Number(cleanedValue);

  if (Number.isNaN(num)) {
    return "0";
  }

  const abs = Math.abs(num);

  const formatValue = (n: number) =>
    Number(n.toFixed(digits)).toString();

  if (abs >= 10000000) {
    return `${formatValue(num / 10000000)}Cr`;
  }

  if (abs >= 100000) {
    return `${formatValue(num / 100000)}L`;
  }

  if (abs >= 1000) {
    return `${formatValue(num / 1000)}K`;
  }

  return formatValue(num);
};