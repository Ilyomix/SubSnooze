export const SUPPORTED_LOCALES = ["en", "fr"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Fran\u00e7ais",
}

export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "CHF",
  "JPY",
] as const
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]

export const DEFAULT_CURRENCY: CurrencyCode = "USD"

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "$ USD",
  EUR: "\u20AC EUR",
  GBP: "\u00A3 GBP",
  CAD: "$ CAD",
  AUD: "$ AUD",
  CHF: "CHF",
  JPY: "\u00A5 JPY",
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  CAD: "CA$",
  AUD: "A$",
  CHF: "CHF",
  JPY: "\u00A5",
}

// Map locale to default currency (auto-detect)
export const LOCALE_DEFAULT_CURRENCY: Record<Locale, CurrencyCode> = {
  en: "USD",
  fr: "EUR",
}
