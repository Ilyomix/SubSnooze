"use client"

import { useState } from "react"

const COOKIE_CONSENT_KEY = "subsnooze:cookie_consent"

function getInitialVisibility() {
  if (typeof window === "undefined") return false
  return !localStorage.getItem(COOKIE_CONSENT_KEY)
}

export function CookieBanner() {
  const [visible, setVisible] = useState(getInitialVisibility)

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
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-divider bg-surface px-6 py-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-lg flex-col gap-3">
        <p className="text-sm text-text-secondary">
          We use essential cookies to keep you signed in. Accepting enables
          privacy-friendly analytics to improve SubSnooze. No ads, ever.{" "}
          <a href="/privacy" className="text-primary underline">
            Learn more
          </a>
        </p>
        <div className="flex gap-3">
          <button
            onClick={accept}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="flex-1 rounded-xl border border-divider py-2.5 text-sm font-semibold text-text-primary hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
