// SubSnooze Pro pricing configuration
// Stripe Price IDs are set via environment variables so they can differ
// between test-mode and live-mode without code changes.

export const PRICING = {
  // ─── Free tier limits ───
  FREE_SUBSCRIPTION_LIMIT: 5,

  // ─── Pro tier ───
  PRO_PRICE_DISPLAY: "$39",
  PRO_PRICE_AMOUNT: 3900, // cents
  PRO_LABEL: "lifetime",

  // Features comparison (used in UpgradeModal + Pricing page)
  FREE_FEATURES: [
    "Track up to 5 subscriptions",
    "Push notifications",
    "Renewal reminders",
  ] as const,

  PRO_FEATURES: [
    "Unlimited subscriptions",
    "Push notifications",
    "CSV export",
  ] as const,
} as const

// Stripe Price ID for the one-time $39 lifetime purchase.
// Create this in the Stripe Dashboard → Products → Add product → One-time price.
export function getStripePriceId(): string {
  const id = process.env.STRIPE_PRICE_ID_PRO_LIFETIME
  if (!id) {
    throw new Error(
      "STRIPE_PRICE_ID_PRO_LIFETIME is not set. " +
      "Create a one-time price in Stripe Dashboard and add the price ID to .env.local."
    )
  }
  return id
}
