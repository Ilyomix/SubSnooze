"use client"

import { useEffect } from "react"
import { captureError } from "@/lib/sentry/client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureError(error, { digest: error.digest, global: true })
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Outfit, system-ui, sans-serif", backgroundColor: "#F8F7F4", color: "#1A1918" }}>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "1.5rem", textAlign: "center" }}>
          <div style={{ display: "flex", height: "4rem", width: "4rem", alignItems: "center", justifyContent: "center", borderRadius: "9999px", backgroundColor: "rgba(201, 85, 61, 0.1)" }}>
            <span style={{ fontSize: "1.5rem", color: "#C9553D" }}>!</span>
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Something went wrong
            </h2>
            <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#5C5956" }}>
              Don&apos;t worry, it happens to everyone. Let&apos;s try again.
            </p>
          </div>
          <button
            onClick={reset}
            style={{ borderRadius: "0.75rem", backgroundColor: "#237A5A", padding: "0.75rem 2rem", fontSize: "0.875rem", fontWeight: 500, color: "white", border: "none", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
