"use client"

import { useRef } from "react"
import { PartyPopper } from "lucide-react"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { Button } from "@/components/ui"
import { formatCurrency } from "@/lib/utils"
import type { Subscription } from "@/types/subscription"

interface CancellationSuccessModalProps {
  subscription: Subscription
  monthlySavings: number
  onClose: () => void
}

export function CancellationSuccessModal({
  subscription,
  monthlySavings,
  onClose,
}: CancellationSuccessModalProps) {
  const yearlySavings = monthlySavings * 12
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, onClose)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancellation-success-title"
    >
      <div ref={dialogRef} tabIndex={-1} className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-surface p-6 outline-none" onClick={(e) => e.stopPropagation()}>
        {/* Party Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <PartyPopper className="h-7 w-7 text-primary" />
        </div>

        {/* Title */}
        <h2 id="cancellation-success-title" className="text-xl font-bold text-primary">You did it!</h2>

        {/* Subtitle */}
        <p className="text-[15px] font-medium text-text-primary">
          {formatCurrency(monthlySavings)}/month saved
        </p>

        {/* Description */}
        <p className="text-center text-sm text-text-secondary">
          {subscription.name} has been marked as canceled. Your access continues until {subscription.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.
        </p>

        {/* Savings Card */}
        <div className="flex w-full flex-col items-center gap-1 rounded-xl bg-background p-4">
          <span className="text-sm text-text-tertiary">You&apos;ll save this year</span>
          <span className="text-3xl font-bold text-primary">
            {formatCurrency(yearlySavings)}
          </span>
        </div>

        {/* CTA */}
        <Button variant="primary" onClick={onClose} className="w-full">
          Done
        </Button>
      </div>
    </div>
  )
}
