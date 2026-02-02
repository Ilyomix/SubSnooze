"use client"

import { Star } from "lucide-react"
import { Button } from "@/components/ui"

interface UpgradeModalProps {
  onUpgrade: () => void
  onClose: () => void
}

const FEATURES = [
  "Unlimited subscriptions",
  "SMS + Push + Email reminders",
  "Money saved dashboard",
]

export function UpgradeModal({ onUpgrade, onClose }: UpgradeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-surface p-8" onClick={(e) => e.stopPropagation()}>
        {/* Star Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Star className="h-7 w-7 text-accent" fill="currentColor" />
        </div>

        {/* Title */}
        <h2 id="upgrade-modal-title" className="text-xl font-bold text-text-primary">Unlock SubSnooze Pro</h2>

        {/* Features */}
        <div className="flex flex-col items-center gap-1">
          {FEATURES.map((feature) => (
            <span key={feature} className="text-[15px] text-text-secondary">
              {feature}
            </span>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-primary">$39 lifetime</span>
          <span className="text-sm text-text-tertiary">(one-time, forever)</span>
        </div>

        {/* CTA */}
        <div className="flex w-full flex-col gap-3">
          <Button variant="primary" onClick={onUpgrade} className="w-full">
            Get Pro - $39
          </Button>
          <button
            onClick={onClose}
            className="text-sm text-text-tertiary hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            No thanks, stay on free
          </button>
        </div>
      </div>
    </div>
  )
}
