"use client"

import { useRef, useState, useEffect } from "react"
import { PartyPopper } from "lucide-react"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { Button } from "@/components/ui"
import { formatCurrency } from "@/lib/utils"
import type { Subscription } from "@/types/subscription"

const CONFETTI_COLORS = ["#237A5A", "#3CAA7A", "#C9553D", "#F59E0B", "#6366F1", "#EC4899"]

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  size: number
}

function Confetti() {
  const [pieces] = useState<ConfettiPiece[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
      size: 6 + Math.random() * 6,
    }))
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm motion-safe:animate-[confetti-fall_ease-out_forwards]"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

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
  const [showConfetti, setShowConfetti] = useState(true)

  // Trigger haptic feedback on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showConfetti && <Confetti />}
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
    </>
  )
}
