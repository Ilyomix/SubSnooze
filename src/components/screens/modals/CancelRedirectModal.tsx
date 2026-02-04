"use client"

import { useState } from "react"
import { ExternalLink, PiggyBank, Calendar, Check } from "lucide-react"
import { Button } from "@/components/ui"
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-redirect-title"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        {/* Logo - squircle style */}
        <div
          className="flex h-14 w-14 items-center justify-center text-2xl font-bold text-white"
          style={{
            backgroundColor: subscription.logoColor,
            borderRadius: 12, // ~22% of 56px for squircle
          }}
        >
          {subscription.logo}
        </div>

        {/* Title */}
        <h2 id="cancel-redirect-title" className="text-xl font-bold text-text-primary">
          Cancel {subscription.name}
        </h2>

        {/* Description */}
        <p className="text-center text-[15px] text-text-secondary">
          To cancel your {subscription.name} subscription, you'll need to visit {subscription.name}'s website. We'll take you there now.
        </p>

        {/* Info Card */}
        <div className="flex w-full flex-col gap-2 rounded-xl bg-background p-4">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-5 w-5 text-primary" />
            <span className="text-sm text-text-primary">
              You'll save <span className="font-semibold">${subscription.price.toFixed(2)}/month</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-text-tertiary" />
            <span className="text-sm text-text-primary">
              Access until {subscription.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="danger"
          icon={<ExternalLink className="h-[18px] w-[18px]" />}
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
            {remindMe && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="text-sm text-text-tertiary">Remind me if I forget to cancel</span>
        </button>
      </div>
    </div>
  )
}
