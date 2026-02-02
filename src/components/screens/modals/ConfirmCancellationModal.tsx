"use client"

import { HelpCircle, Check, X } from "lucide-react"
import { Button } from "@/components/ui"
import type { Subscription } from "@/types/subscription"

interface ConfirmCancellationModalProps {
  subscription: Subscription
  onConfirm: () => void
  onNotYet: () => void
  onClose: () => void
}

export function ConfirmCancellationModal({
  subscription,
  onConfirm,
  onNotYet,
  onClose,
}: ConfirmCancellationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={onClose}>
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        {/* Question Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <span className="text-2xl font-bold text-accent">?</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-text-primary">
          Did you cancel {subscription.name}?
        </h2>

        {/* Description */}
        <p className="text-center text-[15px] text-text-secondary">
          Let us know so we can update your subscription status and track your savings.
        </p>

        {/* Actions */}
        <Button
          variant="primary"
          icon={<Check className="h-[18px] w-[18px]" />}
          onClick={onConfirm}
          className="w-full"
        >
          Yes, I canceled it
        </Button>

        <button
          onClick={onNotYet}
          className="flex items-center gap-2 text-sm text-accent hover:text-accent/80"
        >
          <X className="h-4 w-4" />
          No, I'll do it later
        </button>
      </div>
    </div>
  )
}
