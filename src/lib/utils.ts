import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Locale/currency-aware formatCurrency.
// Prefer useI18n().formatCurrency() in React components for reactive locale.
export function formatCurrency(
  amount: number,
  wholeOrOpts?: boolean | { whole?: boolean; currency?: string; locale?: string }
): string {
  const opts = typeof wholeOrOpts === "boolean" ? { whole: wholeOrOpts } : (wholeOrOpts ?? {})
  const currency = opts.currency ?? "USD"
  const locale = opts.locale ?? "en-US"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: opts.whole ? 0 : 2,
  }).format(amount)
}

// Legacy constants — kept for code that hasn't been migrated to useI18n yet
export const CURRENCY_CODE = "USD"
export const CURRENCY_SYMBOL = "$"
