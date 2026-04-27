export const formatAZN = (value: number | string | null | undefined): string => {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (!isFinite(n)) return "0 ₼";
  return new Intl.NumberFormat("az-AZ", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(n) + " ₼";
};

export const calcDiscount = (price: number, oldPrice?: number | null): number => {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};
