import posthog from "posthog-js"
import { hasAnalyticsConsent } from "./provider"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

function isEnabled(): boolean {
  return Boolean(POSTHOG_KEY) && typeof window !== "undefined" && hasAnalyticsConsent()
}

// ---- Identity ----

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (!isEnabled()) return
  posthog.identify(userId, traits)
}

export function resetUser() {
  if (!isEnabled()) return
  posthog.reset()
}

// ---- Core Events ----

export function trackSignup(method: "email" | "google") {
  if (!isEnabled()) return
  posthog.capture("signup", { method })
}

export function trackLogin(method: "email" | "google") {
  if (!isEnabled()) return
  posthog.capture("login", { method })
}

export function trackAddSubscription(data: {
  name: string
  billingCycle: string
  price: number
}) {
  if (!isEnabled()) return
  posthog.capture("add_subscription", {
    subscription_name: data.name,
    billing_cycle: data.billingCycle,
    price_range: getPriceRange(data.price),
  })
}

export function trackCancelSubscription(data: {
  name: string
  monthlyPrice: number
}) {
  if (!isEnabled()) return
  posthog.capture("cancel_subscription", {
    subscription_name: data.name,
    monthly_savings: data.monthlyPrice,
  })
}

export function trackDeleteSubscription(name: string) {
  if (!isEnabled()) return
  posthog.capture("delete_subscription", { subscription_name: name })
}

export function trackRestoreSubscription(name: string) {
  if (!isEnabled()) return
  posthog.capture("restore_subscription", { subscription_name: name })
}

export function trackUpgradeClick() {
  if (!isEnabled()) return
  posthog.capture("upgrade_click")
}

export function trackUpgradeComplete() {
  if (!isEnabled()) return
  posthog.capture("upgrade_complete", { plan: "pro_lifetime" })
}

export function trackExportCSV(count: number) {
  if (!isEnabled()) return
  posthog.capture("export_csv", { subscription_count: count })
}

export function trackOnboardingComplete() {
  if (!isEnabled()) return
  posthog.capture("onboarding_complete")
}

export function trackNotificationPermission(granted: boolean) {
  if (!isEnabled()) return
  posthog.capture("notification_permission", { granted })
}

// ---- Screen Views (SPA) ----

export function trackScreenView(screen: string) {
  if (!isEnabled()) return
  posthog.capture("$pageview", {
    $current_url: `${window.location.origin}/${screen}`,
    screen_name: screen,
  })
}

// ---- Helpers ----

function getPriceRange(price: number): string {
  if (price <= 5) return "0-5"
  if (price <= 15) return "5-15"
  if (price <= 30) return "15-30"
  if (price <= 50) return "30-50"
  return "50+"
}
