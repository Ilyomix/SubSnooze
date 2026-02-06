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

export function validateEnv() {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required public vars (available at build time)
  for (const key of requiredPublicVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  // Check required server vars (only on server)
  if (typeof window === "undefined") {
    for (const key of requiredServerVars) {
      if (!process.env[key]) {
        missing.push(key)
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

  if (warnings.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      `[SubSnooze] Optional environment variables not set (some features disabled):\n${warnings.map((k) => `  - ${k}`).join("\n")}`
    )
  }
}
