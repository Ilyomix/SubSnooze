"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { Locale, CurrencyCode } from "./config"
import {
  DEFAULT_LOCALE,
  DEFAULT_CURRENCY,
  SUPPORTED_LOCALES,
  SUPPORTED_CURRENCIES,
} from "./config"

// ─── Message loading ───────────────────────────────────────
type Messages = Record<string, string | Record<string, string>>

const messageCache: Partial<Record<Locale, Messages>> = {}

async function loadMessages(locale: Locale): Promise<Messages> {
  if (messageCache[locale]) return messageCache[locale]!
  const mod = await import(`@/messages/${locale}.json`)
  messageCache[locale] = mod.default
  return mod.default
}

// ─── Context value ─────────────────────────────────────────
interface I18nContextValue {
  locale: Locale
  currency: CurrencyCode
  setLocale: (locale: Locale) => void
  setCurrency: (currency: CurrencyCode) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatCurrency: (amount: number, opts?: { whole?: boolean; currency?: string }) => string
  formatDate: (date: Date, style?: "short" | "medium" | "long") => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

// ─── Storage helpers ───────────────────────────────────────
const LOCALE_KEY = "subsnooze_locale"
const CURRENCY_KEY = "subsnooze_currency"

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE
  const stored = localStorage.getItem(LOCALE_KEY)
  if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) return stored as Locale
  // Auto-detect from browser
  const browserLang = navigator.language.split("-")[0]
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) return browserLang as Locale
  return DEFAULT_LOCALE
}

function getStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return DEFAULT_CURRENCY
  const stored = localStorage.getItem(CURRENCY_KEY)
  if (stored && SUPPORTED_CURRENCIES.includes(stored as CurrencyCode)) return stored as CurrencyCode
  return DEFAULT_CURRENCY
}

// ─── Provider ──────────────────────────────────────────────
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale)
  const [currency, setCurrencyState] = useState<CurrencyCode>(getStoredCurrency)
  const [messages, setMessages] = useState<Messages>({})
  const [ready, setReady] = useState(false)

  // Load messages on locale change
  useEffect(() => {
    loadMessages(locale).then((msgs) => {
      setMessages(msgs)
      setReady(true)
    })
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_KEY, newLocale)
    document.documentElement.lang = newLocale
  }, [])

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency)
    localStorage.setItem(CURRENCY_KEY, newCurrency)
  }, [])

  // Translation function with interpolation
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Support nested keys like "dashboard.greeting"
      const parts = key.split(".")
      let value: unknown = messages
      for (const part of parts) {
        if (value && typeof value === "object" && part in value) {
          value = (value as Record<string, unknown>)[part]
        } else {
          // Fallback: return the key itself
          return key
        }
      }

      if (typeof value !== "string") return key

      if (!params) return value

      // First resolve ICU plural patterns: {var, plural, one {text} other {texts}}
      let result = value.replace(
        /\{(\w+),\s*plural,\s*((?:[^{}]|\{[^{}]*\})*)\}/g,
        (_match: string, variable: string, formsStr: string) => {
          const count = Number(params[variable] ?? 0)
          const forms: Record<string, string> = {}
          const formRegex = /(?:=(\d+)|(\w+))\s*\{([^{}]*)\}/g
          let m: RegExpExecArray | null
          while ((m = formRegex.exec(formsStr)) !== null) {
            const k = m[1] !== undefined ? `=${m[1]}` : m[2]
            forms[k] = m[3]
          }
          if (forms[`=${count}`] !== undefined) return forms[`=${count}`]
          const category =
            locale === "fr"
              ? count === 0 || count === 1
                ? "one"
                : "other"
              : count === 1
                ? "one"
                : "other"
          return forms[category] ?? forms["other"] ?? ""
        }
      )

      // Then replace simple {param} placeholders
      result = result.replace(/\{(\w+)\}/g, (_, name) =>
        params[name] !== undefined ? String(params[name]) : `{${name}}`
      )

      return result
    },
    [messages, locale]
  )

  // Currency formatting
  const formatCurrencyFn = useCallback(
    (amount: number, opts?: { whole?: boolean; currency?: string }): string => {
      const cur = opts?.currency ?? currency
      const localeTag = locale === "fr" ? "fr-FR" : "en-US"
      return new Intl.NumberFormat(localeTag, {
        style: "currency",
        currency: cur,
        maximumFractionDigits: opts?.whole ? 0 : 2,
      }).format(amount)
    },
    [locale, currency]
  )

  // Date formatting
  const formatDate = useCallback(
    (date: Date, style: "short" | "medium" | "long" = "medium"): string => {
      const localeTag = locale === "fr" ? "fr-FR" : "en-US"
      const options: Intl.DateTimeFormatOptions =
        style === "short"
          ? { month: "short", day: "numeric" }
          : style === "long"
            ? { month: "long", day: "numeric", year: "numeric" }
            : { month: "short", day: "numeric", year: "numeric" }
      return date.toLocaleDateString(localeTag, options)
    },
    [locale]
  )

  // Don't render children until messages are loaded to avoid flash of keys
  if (!ready) return null

  return (
    <I18nContext.Provider
      value={{
        locale,
        currency,
        setLocale,
        setCurrency,
        t,
        formatCurrency: formatCurrencyFn,
        formatDate,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

// ─── Hook ──────────────────────────────────────────────────
export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
