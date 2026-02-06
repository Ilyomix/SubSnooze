"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Card } from "@/components/ui"
import { Skeleton } from "@/components/ui/Skeleton"

interface ChangelogProps {
  onBack: () => void
}

const CHANGELOG = [
  {
    version: "1.1.0",
    date: "February 2026",
    changes: [
      "Dark mode support (light, dark, auto)",
      "Marketing landing page",
      "Phone number editing in Settings",
      "Quick chain-add: add multiple subscriptions in a row",
      "Confetti animation on successful cancellation",
      "FAQ page",
      "Tablet and desktop responsive layout",
      "Haptic feedback on key actions",
      "Alphabetical service browsing",
      "Ripple effect on buttons",
      "CORS security headers",
    ],
  },
  {
    version: "1.0.0",
    date: "January 2026",
    changes: [
      "ADHD-friendly subscription tracking",
      "Smart reminder presets (Aggressive, Relaxed, Minimal)",
      "Push and email notifications",
      "3-step onboarding flow",
      "Cancellation flow with direct links",
      "'Decide Later' button for when you're not ready",
      "PWA with offline support",
      "CSV data export",
      "Cookie consent banner (RGPD)",
      "Password change and account deletion",
      "Pricing page (Free/Pro tiers)",
      "Pull-to-refresh and scroll restoration",
      "Accessibility: skip links, ARIA live, keyboard navigation",
    ],
  },
]

export function Changelog({ onBack }: ChangelogProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-surface/80 px-6 backdrop-blur-sm pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5 text-text-primary" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10">
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <h1 className="text-lg font-semibold text-text-primary">What&apos;s New</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex flex-col gap-6 px-6 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {!ready ? (
          <>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-surface shadow-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-[88%]" />
                  <Skeleton className="h-4 w-[76%]" />
                  <Skeleton className="h-4 w-[82%]" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {CHANGELOG.map((release) => (
              <Card key={release.version} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-text-primary">v{release.version}</span>
                  <span className="text-xs text-text-tertiary">{release.date}</span>
                </div>
                <ul className="space-y-2">
                  {release.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                      {change}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
