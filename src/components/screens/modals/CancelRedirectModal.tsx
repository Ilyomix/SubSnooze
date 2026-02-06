"use client"

import { useState, useRef } from "react"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { ExternalLink, PiggyBank, Calendar, Check } from "lucide-react"
import { Button, ServiceIcon } from "@/components/ui"
import { formatCurrency } from "@/lib/utils"
import type { Subscription } from "@/types/subscription"

interface CancelRedirectModalProps {
  subscription: Subscription
  onProceed: (remindMe: boolean) => void
  onClose: () => void
}

export function CancelRedirectModal({
  subscription,
  onProceed,
  onClose,
}: CancelRedirectModalProps) {
  const [remindMe, setRemindMe] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, onClose)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-redirect-title"
    >
      <div ref={dialogRef} tabIndex={-1} className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-surface p-6 outline-none" onClick={(e) => e.stopPropagation()}>
        {/* Logo - squircle style */}
        <ServiceIcon
          name={subscription.name}
          logoColor={subscription.logoColor}
          logoUrl={subscription.logo?.startsWith("http") ? subscription.logo : undefined}
          size={56}
        />

        {/* Title */}
        <h2 id="cancel-redirect-title" className="text-xl font-bold text-text-primary">
          Cancel {subscription.name}
        </h2>

        {/* Description */}
        <p className="text-center text-[15px] text-text-secondary">
          To cancel your {subscription.name} subscription, you{"\u2019"}ll be taken to {subscription.name}{"\u2019"}s website.
        </p>

        {/* Info Card */}
        <div className="flex w-full flex-col gap-2 rounded-xl bg-background p-4">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-sm text-text-primary">
              You{"\u2019"}ll save <span className="font-semibold tabular-nums">{formatCurrency(subscription.price)}/month</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
            <span className="text-sm text-text-primary">
              Access until {subscription.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="danger"
          icon={<ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" />}
          onClick={() => onProceed(remindMe)}
          className="w-full"
        >
          Go to {subscription.name}
        </Button>

        <button
          onClick={onClose}
          className="text-sm text-text-tertiary hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          Not now
        </button>

        {/* Reminder checkbox */}
        <button
          onClick={() => setRemindMe(!remindMe)}
          role="checkbox"
          aria-checked={remindMe}
          aria-label="Remind me if I forget to cancel"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          <div className={`flex h-5 w-5 items-center justify-center rounded border ${remindMe ? "border-primary bg-primary" : "border-divider bg-surface"}`}>
            {remindMe && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
          </div>
          <span className="text-sm text-text-tertiary">Remind me if I forget to cancel</span>
        </button>
      </div>
    </div>
  )
}
