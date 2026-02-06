"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Mail, ExternalLink, Heart, Shield, Info } from "lucide-react"
import { Card } from "@/components/ui"
import { Skeleton } from "@/components/ui/Skeleton"

interface AboutProps {
  onBack: () => void
}

export function About({ onBack }: AboutProps) {
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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10">
            <Info className="h-4 w-4 text-sky-600" />
          </div>
          <h1 className="text-lg font-semibold text-text-primary">About</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl">
        {!ready ? (
          <div className="flex flex-col gap-6 px-6 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-6 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))]">
            {/* Brand */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-text-primary">SubSnooze</h2>
                <p className="text-sm text-text-tertiary">Version 1.0.0</p>
              </div>
              <p className="max-w-[280px] text-center text-[15px] text-text-secondary">
                The ADHD-friendly subscription tracker. Stop paying the ADHD tax on subscriptions.
              </p>
            </div>

            {/* Mission */}
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Heart className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-text-primary">Our mission</h3>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                We believe nobody should feel guilty about forgetting a subscription renewal. SubSnooze is designed for how your brain actually works — with gentle reminders, minimal decisions, and zero shame.
              </p>
            </Card>

            {/* Privacy */}
            <Card className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-text-primary">Privacy first</h3>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">
                Your data stays yours. We never sell your subscription data, never share with third parties, and you can export or delete everything at any time.
              </p>
            </Card>

            {/* Contact / Support */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[13px] font-medium text-text-secondary">Support</h3>
              <Card padding="none" className="overflow-hidden">
                <a
                  href="mailto:support@subsnooze.com"
                  className="flex items-center justify-between px-[18px] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10">
                      <Mail className="h-4 w-4 text-sky-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-text-primary">Email us</span>
                      <span className="text-xs text-text-tertiary">support@subsnooze.com</span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-text-muted" />
                </a>
              </Card>
            </div>

            {/* Legal links */}
            <div className="flex flex-col gap-3">
              <h3 className="text-[13px] font-medium text-text-secondary">Legal</h3>
              <Card padding="none" className="overflow-hidden">
                <a
                  href="/cgu"
                  className="flex items-center justify-between px-[18px] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span className="text-[15px] font-medium text-text-primary">Terms of Service</span>
                  <ExternalLink className="h-4 w-4 text-text-muted" />
                </a>
                <div className="h-px bg-divider" />
                <a
                  href="/privacy"
                  className="flex items-center justify-between px-[18px] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span className="text-[15px] font-medium text-text-primary">Privacy Policy</span>
                  <ExternalLink className="h-4 w-4 text-text-muted" />
                </a>
              </Card>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-text-muted">
              Made with care for the ADHD community.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
