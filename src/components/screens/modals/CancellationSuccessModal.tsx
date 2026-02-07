"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { PartyPopper } from "lucide-react"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { Button, Confetti } from "@/components/ui"
import { DEFAULT_CONFETTI_DURATION_MS, type ConfettiBurst } from "@/components/ui/Confetti"
import { useI18n } from "@/lib/i18n"
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
  const { t, formatCurrency, formatDate } = useI18n()
  const yearlySavings = monthlySavings * 12
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, onClose)
  const [showConfetti, setShowConfetti] = useState(true)
  const [confettiBursts, setConfettiBursts] = useState<ConfettiBurst[] | undefined>(
    undefined
  )
  const confettiTimerRef = useRef<number | null>(null)
  const showDebugConfetti = process.env.NODE_ENV !== "production"

  const updateBursts = useCallback(() => {
    setConfettiBursts([
      { x: window.innerWidth * 0.5, y: 0 },
    ])
  }, [])

  const triggerConfetti = useCallback(() => {
    updateBursts()
    setShowConfetti(true)
    if (confettiTimerRef.current != null) {
      window.clearTimeout(confettiTimerRef.current)
    }
    confettiTimerRef.current = window.setTimeout(
      () => setShowConfetti(false),
      DEFAULT_CONFETTI_DURATION_MS
    )
  }, [updateBursts])

  // Trigger haptic feedback on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }

    const rafId = window.requestAnimationFrame(triggerConfetti)
    window.addEventListener("resize", updateBursts)
    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener("resize", updateBursts)
      if (confettiTimerRef.current != null) {
        window.clearTimeout(confettiTimerRef.current)
      }
    }
  }, [triggerConfetti, updateBursts])

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overscroll-contain"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancellation-success-title"
      >
        {showConfetti && confettiBursts && (
          <Confetti
            bursts={confettiBursts}
            flow
            className="pointer-events-none fixed inset-0 z-0"
          />
        )}
        <div ref={dialogRef} tabIndex={-1} className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-surface p-6 outline-none" onClick={(e) => e.stopPropagation()}>
          {/* Party Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <PartyPopper className="h-7 w-7 text-primary" />
          </div>

          {/* Title */}
          <h2 id="cancellation-success-title" className="text-xl font-bold text-primary">{t("cancelFlow.successTitle")}</h2>

          {/* Subtitle */}
          <p className="text-[15px] font-medium text-text-primary">
            {t("cancelFlow.monthlySaved", { amount: formatCurrency(monthlySavings, { currency: subscription.currency }) })}
          </p>

          {/* Description */}
          <p className="text-center text-sm text-text-secondary">
            {t("cancelFlow.accessContinues", { name: subscription.name, date: formatDate(subscription.renewalDate) })}
          </p>

          {/* Savings Card */}
          <div className="flex w-full flex-col items-center gap-1 rounded-xl bg-background p-4">
            <span className="text-sm text-text-tertiary">{t("cancelFlow.youllSaveYear")}</span>
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(yearlySavings, { currency: subscription.currency })}
            </span>
          </div>

          {/* CTA */}
          <Button variant="primary" onClick={onClose} className="w-full">
            {t("common.done")}
          </Button>

          {showDebugConfetti && (
            <Button variant="ghost" size="sm" onClick={triggerConfetti} className="w-full">
              {t("cancelFlow.debugConfetti")}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
