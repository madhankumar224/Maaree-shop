/**
 * Format a number as Indian Rupees (₹).
 * Examples: formatPrice(1000) → "₹1,000", formatPrice(29.99) → "₹30"
 */
export function formatPrice(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}
