"use client"

import { useEffect } from "react"

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    // Register the PWA service worker (separate from Firebase messaging SW)
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("SW registration failed:", err)
    })
  }, [])
}
