"use client"

import { useState, useEffect } from "react"
import { Cookie } from "lucide-react"

const COOKIE_CONSENT_KEY = "subsnooze_cookie_consent"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay so it doesn't compete with initial load
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted")
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-md rounded-2xl border border-divider bg-surface p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">
              We use cookies
            </p>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              SubSnooze uses essential cookies for authentication and preferences.
              No tracking or advertising cookies.{" "}
              <a href="/privacy" className="text-primary underline">Learn more</a>
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={decline}
            className="flex-1 rounded-xl border border-divider py-2.5 text-sm font-medium text-text-primary hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
