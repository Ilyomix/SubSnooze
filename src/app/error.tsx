"use client"

import { useEffect } from "react"
import { captureError } from "@/lib/sentry/client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureError(error, { digest: error.digest })
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <span className="text-2xl text-accent">!</span>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Don&apos;t worry, it happens to everyone. Let&apos;s try again.
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-8 py-3 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  )
}
