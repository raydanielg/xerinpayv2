import type { Currency, Minor } from "@/lib/api/types";

/**
 * Money helpers.
 *
 * Amounts cross the wire as integer minor units. Converting to a float for
 * display is fine; converting for arithmetic is not — never add or multiply
 * these values after formatting.
 */

const ZERO_DECIMAL: ReadonlySet<string> = new Set(["UGX", "JPY", "KRW", "VND"]);

export function decimalsFor(currency: Currency): number {
  return ZERO_DECIMAL.has(currency) ? 0 : 2;
}

export function toMajor(amount: Minor, currency: Currency): number {
  return amount / 10 ** decimalsFor(currency);
}

export function formatMoney(
  amount: Minor | null | undefined,
  currency: Currency = "TZS",
  options: { compact?: boolean; showCode?: boolean } = {},
): string {
  if (amount === null || amount === undefined) return "—";
  const decimals = decimalsFor(currency);
  const value = toMajor(amount, currency);

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: options.compact ? 0 : decimals,
    maximumFractionDigits: options.compact ? 1 : decimals,
    notation: options.compact ? "compact" : "standard",
  }).format(value);

  return options.showCode === false ? formatted : `${currency} ${formatted}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(
  iso: string | null | undefined,
  style: "short" | "long" | "time" = "short",
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  if (style === "time") {
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  });
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso).getTime();
  if (Number.isNaN(date)) return "—";

  const diff = Date.now() - date;
  const minutes = Math.round(diff / 60_000);

  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(minutes) < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;

  return formatDate(iso);
}

/** Masks all but the last 4 characters — for phone numbers, PANs, key hints. */
export function mask(value: string | null | undefined, visible = 4): string {
  if (!value) return "—";
  if (value.length <= visible) return value;
  return `${"•".repeat(Math.min(value.length - visible, 8))}${value.slice(-visible)}`;
}
