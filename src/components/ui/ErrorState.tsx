"use client"

import { WifiOff } from "lucide-react"
import { Button } from "./Button"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = "We couldn\u2019t load your subscriptions. Check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-accent/20 bg-accent/5 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
        <WifiOff className="h-6 w-6 text-accent" />
      </div>
      <p className="text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
