export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatWeight(value: number) {
  return `${value.toFixed(2)}g`;
}