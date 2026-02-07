// Runtime validation of required environment variables.
// Import this in layout.tsx or page.tsx to catch missing config early.

const requiredPublicVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const

const requiredServerVars = [
  "SUPABASE_SERVICE_ROLE_KEY",
] as const

const optionalVarsWithWarning = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID_PRO_LIFETIME",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_POSTHOG_KEY",
] as const

const PLACEHOLDER_PATTERNS = ["placeholder", "your_", "your-", "example", "xxx"]

function looksLikePlaceholder(value: string): boolean {
  const lower = value.toLowerCase()
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p))
}

export function validateEnv() {
  const missing: string[] = []
  const invalid: string[] = []
  const warnings: string[] = []

  // Check required public vars (available at build time)
  for (const key of requiredPublicVars) {
    const val = process.env[key]
    if (!val) {
      missing.push(key)
    } else if (looksLikePlaceholder(val)) {
      invalid.push(`${key} (contains placeholder value: "${val}")`)
    }
  }

  // Check required server vars (only on server)
  if (typeof window === "undefined") {
    for (const key of requiredServerVars) {
      const val = process.env[key]
      if (!val) {
        missing.push(key)
      } else if (looksLikePlaceholder(val)) {
        invalid.push(`${key} (contains placeholder value)`)
      }
    }
  }

  // Check optional vars that affect features
  for (const key of optionalVarsWithWarning) {
    if (!process.env[key]) {
      warnings.push(key)
    }
  }

  if (missing.length > 0) {
    console.error(
      `[SubSnooze] Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCopy .env.local.example to .env.local and fill in the values.`
    )
  }

  if (invalid.length > 0) {
    console.error(
      `[SubSnooze] Environment variables contain placeholder values:\n${invalid.map((k) => `  - ${k}`).join("\n")}\n\nReplace these with real values from your Supabase/Stripe/etc. dashboard.`
    )
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      `[SubSnooze] Optional environment variables not set (some features disabled):\n${warnings.map((k) => `  - ${k}`).join("\n")}`
    )
  }
}
