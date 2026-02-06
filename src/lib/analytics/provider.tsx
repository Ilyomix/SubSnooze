"use client"

import posthog from "posthog-js"
import { useEffect } from "react"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"
const COOKIE_CONSENT_KEY = "subsnooze:cookie_consent"

let initialized = false

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted"
}

function initPostHog() {
  if (initialized || !POSTHOG_KEY || typeof window === "undefined") return

  // Only initialize if user has accepted cookies
  if (!hasAnalyticsConsent()) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // We handle this manually for SPA
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: false, // Explicit tracking only
    disable_session_recording: true, // Enable when needed
    respect_dnt: true,
    sanitize_properties(properties) {
      // Strip any PII from properties
      if (properties["$current_url"]) {
        try {
          const url = new URL(properties["$current_url"])
          url.searchParams.delete("token")
          url.searchParams.delete("code")
          properties["$current_url"] = url.toString()
        } catch {
          // ignore
        }
      }
      return properties
    },
  })

  initialized = true
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog()

    // Re-check consent periodically (e.g., if user accepts after initial page load)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === COOKIE_CONSENT_KEY && e.newValue === "accepted") {
        initPostHog()
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return <>{children}</>
}

export { posthog }
