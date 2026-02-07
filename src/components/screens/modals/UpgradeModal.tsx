"use client"

import { useState, useRef } from "react"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { Star, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui"
import { PRICING } from "@/lib/stripe/pricing"
import { useI18n } from "@/lib/i18n"

interface UpgradeModalProps {
  onUpgrade: () => void
  onClose: () => void
  isPremium?: boolean
}

export function UpgradeModal({ onClose, isPremium }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  useFocusTrap(dialogRef, onClose)

  // If already premium, show confirmation
  if (isPremium) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overscroll-contain"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        <div ref={dialogRef} tabIndex={-1} className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-surface p-6 outline-none" onClick={(e) => e.stopPropagation()}>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-7 w-7 text-primary" />
          </div>
          <h2 id="upgrade-modal-title" className="text-xl font-bold text-text-primary">{t("upgrade.alreadyPro")}</h2>
          <p className="text-center text-[15px] text-text-secondary">
            {t("upgrade.alreadyProDescription")}
          </p>
          <Button variant="primary" onClick={onClose} className="w-full">
            {t("upgrade.nice")}
          </Button>
        </div>
      </div>
    )
  }

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("upgrade.genericError"))
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div ref={dialogRef} tabIndex={-1} className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-surface p-6 outline-none" onClick={(e) => e.stopPropagation()}>
        {/* Star Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Star className="h-7 w-7 text-accent" fill="currentColor" />
        </div>

        {/* Title */}
        <h2 id="upgrade-modal-title" className="text-xl font-bold text-text-primary">{t("upgrade.title")}</h2>

        {/* Features */}
        <div className="flex flex-col gap-2 self-start">
          {PRICING.PRO_FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-[15px] text-text-secondary">{feature}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-primary">{PRICING.PRO_PRICE_DISPLAY} {t("upgrade.lifetime")}</span>
          <span className="text-sm text-text-tertiary">{t("upgrade.oneTime")}</span>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full rounded-xl bg-accent/10 p-3 text-center text-sm text-accent">
            {error}
          </div>
        )}

        {/* CTA */}
        <div className="flex w-full flex-col gap-3">
          <Button
            variant="primary"
            onClick={handleCheckout}
            loading={loading}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("upgrade.redirecting")}
              </span>
            ) : (
              t("upgrade.getPro", { price: PRICING.PRO_PRICE_DISPLAY })
            )}
          </Button>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-sm text-text-tertiary hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded disabled:opacity-50"
          >
            {t("upgrade.noThanks")}
          </button>
        </div>
      </div>
    </div>
  )
}
