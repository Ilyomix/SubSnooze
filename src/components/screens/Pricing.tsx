"use client"

import { Check, Star, ArrowLeft } from "lucide-react"
import { Button, Card } from "@/components/ui"

interface PricingProps {
  onBack: () => void
  onUpgrade: () => void
}

const FREE_FEATURES = [
  "Track up to 5 subscriptions",
  "3-touch reminder system",
  "Cancel guidance with direct links",
  "CSV export",
]

const PRO_FEATURES = [
  "Unlimited subscriptions",
  "Priority push notifications",
  "Cancellation success tracking",
  "Annual savings report",
  "Family sharing (coming soon)",
]

export function Pricing({ onBack, onUpgrade }: PricingProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-3 bg-surface/80 px-6 backdrop-blur-sm">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ArrowLeft className="h-5 w-5 text-text-primary" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary">Pricing</h1>
      </header>

      <div className="flex flex-col gap-6 px-6 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Tagline */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary">Simple, fair pricing</h2>
          <p className="mt-2 text-[15px] text-text-secondary">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Free tier */}
        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Free</h3>
            <p className="text-sm text-text-tertiary">For getting started</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-text-primary">$0</span>
            <span className="text-sm text-text-tertiary">/month</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Pro tier */}
        <Card className="relative flex flex-col gap-4 ring-2 ring-primary">
          <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-primary px-3 py-1">
            <Star className="h-3 w-3 text-white" fill="currentColor" />
            <span className="text-xs font-semibold text-white">Recommended</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary">Pro</h3>
            <p className="text-sm text-text-tertiary">For power trackers</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-primary">$3.99</span>
            <span className="text-sm text-text-tertiary">/month</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
          <Button variant="primary" onClick={onUpgrade} className="w-full mt-2">
            Upgrade to Pro
          </Button>
        </Card>

        {/* Note */}
        <p className="text-center text-xs text-text-muted">
          Cancel anytime. No questions asked.
        </p>
      </div>
    </div>
  )
}
