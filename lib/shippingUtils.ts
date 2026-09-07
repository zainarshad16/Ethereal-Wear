/**
 * Utility to parse the free shipping threshold dynamically from the top announcement banner text
 * configured in /admin/settings (e.g., "FREE SHIPPING ON ALL ORDERS OVER RS. 1000").
 */
export function extractFreeShippingThreshold(bannerText?: string | null): number {
  if (!bannerText || typeof bannerText !== "string") {
    return 1000; // Default fallback threshold
  }

  // Regex matches patterns like:
  // "OVER RS. 1000", "OVER RS 1000", "OVER $1000", "OVER 1,000", "ABOVE RS. 1000"
  const match =
    bannerText.match(/(?:OVER|ABOVE|ORDERS\s+OVER)\s*(?:RS\.?|\$)?\s*([0-9,]+)/i) ||
    bannerText.match(/(?:RS\.?|\$)\s*([0-9,]+)/i) ||
    bannerText.match(/\b([0-9]{3,6})\b/);

  if (match && match[1]) {
    const parsed = parseFloat(match[1].replace(/,/g, ""));
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 1000;
}

export const STANDARD_SHIPPING_FEE = 500;
