import { onCLS, onLCP, onFCP, onTTFB, onINP, type Metric } from "web-vitals"
import posthog from "posthog-js"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY

function sendToAnalytics(metric: Metric) {
  // Log in dev for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vital] ${metric.name}:`, metric.value.toFixed(2), metric.rating)
  }

  // Send to PostHog if available
  if (POSTHOG_KEY && typeof window !== "undefined") {
    posthog.capture("web_vital", {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating, // "good" | "needs-improvement" | "poor"
      metric_id: metric.id,
      navigation_type: metric.navigationType,
    })
  }
}

export function reportWebVitals() {
  if (typeof window === "undefined") return

  onCLS(sendToAnalytics)
  onLCP(sendToAnalytics)
  onFCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
  onINP(sendToAnalytics)
}
