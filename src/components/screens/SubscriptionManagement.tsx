"use client"

import { useState, useEffect } from "react"
import { Flame, XCircle, Trash2, RotateCcw } from "lucide-react"
import { DetailShell } from "@/components/layout"
import { Button, SubscriptionFormFields, ServiceIcon } from "@/components/ui"
import type { SubscriptionFormData } from "@/components/ui"
import { CancelRedirectModal, ConfirmCancellationModal, CancellationSuccessModal } from "@/components/screens/modals"
import { daysUntilRenewal, formatLocalDate, parseLocalDate } from "@/lib/date-utils"
import { useI18n } from "@/lib/i18n"
import type { Subscription } from "@/types/subscription"

interface SubscriptionManagementProps {
  subscription: Subscription
  onBack: () => void
  onRestore?: () => void
  onDelete?: () => void
  onSave?: (data: { price: number; billingCycle: string; renewalDate: Date }) => void
  onCancelProceed?: (remindMe?: boolean) => void
  onCancelConfirm?: () => void
  onCancelNotYet?: () => void
  onCancelComplete?: () => void
}

export function SubscriptionManagement({
  subscription,
  onBack,
  onRestore,
  onDelete,
  onSave,
  onCancelProceed,
  onCancelConfirm,
  onCancelNotYet,
  onCancelComplete,
}: SubscriptionManagementProps) {
  const { t } = useI18n()
  const originalPrice = subscription.price.toFixed(2)
  const originalCycle = subscription.billingCycle
  const originalDate = formatLocalDate(subscription.renewalDate)

  const [formData, setFormData] = useState<SubscriptionFormData>({
    price: originalPrice,
    billingCycle: originalCycle,
    renewalDate: originalDate,
  })

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [showCancelRedirect, setShowCancelRedirect] = useState(false)
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)
  const [showCancelSuccess, setShowCancelSuccess] = useState(false)

  // Auto-reset confirmation after 3 seconds
  useEffect(() => {
    if (!confirmingDelete) return
    const timer = setTimeout(() => setConfirmingDelete(false), 3000)
    return () => clearTimeout(timer)
  }, [confirmingDelete])

  const daysUntil = daysUntilRenewal(subscription.renewalDate)
  const isRenewingSoon = subscription.status === "renewing_soon"
  const isCancelled = subscription.status === "cancelled"

  const hasChanges =
    formData.price !== originalPrice ||
    formData.billingCycle !== originalCycle ||
    formData.renewalDate !== originalDate

  const priceNum = parseFloat(formData.price)
  const isValidPrice = !isNaN(priceNum) && priceNum > 0

  // Calculate monthly savings for the cancellation success modal
  const monthlySavings =
    subscription.billingCycle === "yearly"
      ? subscription.price / 12
      : subscription.billingCycle === "weekly"
        ? subscription.price * 4.33
        : subscription.price

  return (
    <>
    <DetailShell
      title={subscription.name}
      onBack={onBack}
      headerRight={
        <ServiceIcon
          name={subscription.name}
          logoColor={subscription.logoColor}
          logoUrl={subscription.logo?.startsWith("http") ? subscription.logo : undefined}
          size={36}
        />
      }
    >
      <div className="flex min-h-full flex-col">
        {/* Scrollable content */}
        <div className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-32">

          {/* Status Badge */}
          {isCancelled && (
            <div className="flex items-center gap-2 rounded-xl bg-divider px-4 py-3">
              <XCircle className="h-[18px] w-[18px] text-text-muted" aria-hidden="true" />
              <span className="text-sm font-semibold text-text-muted">
                {t("manage.statusCancelled")}
              </span>
            </div>
          )}
          {isRenewingSoon && !isCancelled && (
            <div className="flex items-center gap-2 rounded-xl bg-accent-light px-4 py-3">
              <Flame className="h-[18px] w-[18px] text-accent" aria-hidden="true" />
              <span className="text-sm font-semibold text-accent">
                {daysUntil <= 0 ? t("manage.renewsToday") : daysUntil === 1 ? t("manage.renewsTomorrow") : t("manage.renewsInDays", { days: daysUntil })}
              </span>
            </div>
          )}

          {/* Details Form */}
          <SubscriptionFormFields
            value={formData}
            onChange={setFormData}
            priceLabel={t("addSubscription.monthlyPrice")}
            renewalLabel={isCancelled ? t("subscriptionForm.lastRenewal") : t("subscriptionForm.nextRenewal")}
            readOnly={isCancelled}
            autoCalculateRenewalOnCycleChange
          />

          {/* Save Button - only show when form is modified and not cancelled */}
          {hasChanges && !isCancelled && (
            <Button
              variant="primary"
              onClick={() => onSave?.({
                price: parseFloat(formData.price),
                billingCycle: formData.billingCycle,
                renewalDate: parseLocalDate(formData.renewalDate),
              })}
              disabled={!isValidPrice}
              className="w-full"
            >
              {t("manage.saveChanges")}
            </Button>
          )}
        </div>

        {/* Sticky CTA Section */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-divider bg-surface pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto w-full max-w-3xl px-6">
            <div className="flex flex-col gap-3">
              {isCancelled && (
                <Button
                  variant="primary"
                  icon={<RotateCcw className="h-[18px] w-[18px]" aria-hidden="true" />}
                  onClick={onRestore}
                  className="w-full"
                >
                  {t("manage.restoreSubscription")}
                </Button>
              )}
              {!isCancelled && (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (subscription.cancelUrl) {
                      setShowCancelRedirect(true)
                    } else {
                      setShowConfirmCancel(true)
                    }
                  }}
                  className="w-full"
                >
                  {t("manage.cancelSubscription")}
                </Button>
              )}
              <button
                onClick={() => {
                  if (confirmingDelete) {
                    onDelete?.()
                  } else {
                    setConfirmingDelete(true)
                  }
                }}
                aria-label={confirmingDelete ? "Confirm removing subscription from list" : "Remove subscription from list"}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  confirmingDelete
                    ? "bg-accent text-white"
                    : "text-text-muted hover:bg-background/50"
                }`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">
                  {confirmingDelete ? t("manage.tapToConfirm") : t("manage.removeFromList")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DetailShell>

    {/* Cancel Flow Modals */}
    {showCancelRedirect && (
      <CancelRedirectModal
        subscription={subscription}
        onProceed={(remindMe) => {
          if (subscription.cancelUrl) {
            // Only allow https:// URLs to prevent javascript: or data: scheme attacks
            try {
              const url = new URL(subscription.cancelUrl)
              if (url.protocol === "https:" || url.protocol === "http:") {
                window.open(subscription.cancelUrl, "_blank", "noopener,noreferrer")
              }
            } catch {
              // Invalid URL — skip opening
            }
          }
          onCancelProceed?.(remindMe)
          setShowCancelRedirect(false)
          setTimeout(() => setShowConfirmCancel(true), 500)
        }}
        onClose={() => setShowCancelRedirect(false)}
      />
    )}

    {showConfirmCancel && (
      <ConfirmCancellationModal
        subscription={subscription}
        onConfirm={() => {
          onCancelConfirm?.()
          setShowConfirmCancel(false)
          setShowCancelSuccess(true)
        }}
        onNotYet={() => {
          onCancelNotYet?.()
          setShowConfirmCancel(false)
        }}
        onClose={() => setShowConfirmCancel(false)}
      />
    )}

    {showCancelSuccess && (
      <CancellationSuccessModal
        subscription={subscription}
        monthlySavings={monthlySavings}
        onClose={() => {
          setShowCancelSuccess(false)
          onCancelComplete?.()
        }}
      />
    )}
    </>
  )
}
