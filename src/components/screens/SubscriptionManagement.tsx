"use client"

import { useState } from "react"
import { Flame, ChevronDown, XCircle, Trash2, RotateCcw, ExternalLink } from "lucide-react"
import { DetailShell } from "@/components/layout"
import { Card, Button } from "@/components/ui"
import type { Subscription } from "@/types/subscription"
import type { BillingCycle } from "@/types/database"

interface SubscriptionManagementProps {
  subscription: Subscription
  onBack: () => void
  onCancel: () => void
  onRestore?: () => void
  onDelete?: () => void
  onSave?: (data: { price: number; billingCycle: string; renewalDate: Date }) => void
}

function getDaysUntilRenewal(date: Date): number {
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function SubscriptionManagement({
  subscription,
  onBack,
  onCancel,
  onRestore,
  onDelete,
  onSave,
}: SubscriptionManagementProps) {
  const originalPrice = subscription.price.toFixed(2)
  const originalCycle = subscription.billingCycle
  const originalDate = subscription.renewalDate.toISOString().split("T")[0]

  const [price, setPrice] = useState(originalPrice)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(originalCycle)
  const [renewalDate, setRenewalDate] = useState(originalDate)

  // Minimum date is today (no past dates allowed)
  const today = new Date().toISOString().split("T")[0]

  const daysUntil = getDaysUntilRenewal(subscription.renewalDate)
  const isRenewingSoon = subscription.status === "renewing_soon"
  const isCancelled = subscription.status === "cancelled"

  const hasChanges = price !== originalPrice || billingCycle !== originalCycle || renewalDate !== originalDate

  return (
    <DetailShell
      title={subscription.name}
      onBack={onBack}
      headerRight={
        <div
          className="flex h-9 w-9 items-center justify-center text-sm font-bold text-white"
          style={{
            backgroundColor: subscription.logoColor,
            borderRadius: 8, // Squircle style
          }}
        >
          {subscription.logo}
        </div>
      }
    >
      <div className="flex min-h-full flex-col">
        {/* Scrollable content */}
        <div className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-32">

          {/* Status Badge */}
          {isCancelled && (
            <div className="flex items-center gap-2 rounded-xl bg-divider px-4 py-3">
              <XCircle className="h-[18px] w-[18px] text-text-muted" />
              <span className="text-sm font-semibold text-text-muted">
                Cancelled
              </span>
            </div>
          )}
          {isRenewingSoon && !isCancelled && (
            <div className="flex items-center gap-2 rounded-xl bg-accent-light px-4 py-3">
              <Flame className="h-[18px] w-[18px] text-accent" />
              <span className="text-sm font-semibold text-accent">
                {daysUntil <= 0 ? "Renews today!" : daysUntil === 1 ? "Renews tomorrow!" : `Renews in ${daysUntil} days`}
              </span>
            </div>
          )}

          {/* Details Card - read-only when cancelled */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between px-[18px] py-4">
              <span className="text-[15px] font-medium text-text-primary">Monthly price</span>
              <div className="flex items-center gap-1">
                <span className="text-[15px] font-semibold text-text-primary">$</span>
                {isCancelled ? (
                  <span className="text-[15px] font-semibold text-text-muted">{price}</span>
                ) : (
                  <input
                    type="text"
                    name="price"
                    inputMode="decimal"
                    aria-label="Monthly price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="min-w-1 tabular-nums bg-transparent text-right text-[15px] font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                    style={{ width: `${Math.max(price.length, 0) / 1.66}em` }}
                  />
                )}
              </div>
            </div>
            <div className="h-px bg-divider" />
            <div className="flex items-center justify-between px-[18px] py-4">
              <span className="text-[15px] font-medium text-text-primary">Billing cycle</span>
              {isCancelled ? (
                <span className="text-[15px] font-semibold capitalize text-text-muted">{billingCycle}</span>
              ) : (
                <div className="relative flex items-center">
                  <select
                    name="billingCycle"
                    aria-label="Billing cycle"
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="min-w-20 appearance-none bg-transparent pr-5 text-right text-[15px] font-semibold capitalize text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-text-muted" />
                </div>
              )}
            </div>
            <div className="h-px bg-divider" />
            <div className="flex items-center justify-between px-[18px] py-4">
              <span className="text-[15px] font-medium text-text-primary">
                {isCancelled ? "Last renewal" : "Next renewal"}
              </span>
              {isCancelled ? (
                <span className="text-[15px] font-semibold text-text-muted">
                  {subscription.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              ) : (
                <input
                  type="date"
                  name="renewalDate"
                  aria-label="Next renewal date"
                  value={renewalDate}
                  min={today}
                  onChange={(e) => {
                    // Only allow future dates
                    if (e.target.value && e.target.value >= today) {
                      setRenewalDate(e.target.value)
                    }
                  }}
                  className="min-w-28 appearance-none bg-transparent text-[15px] font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                />
              )}
            </div>
          </Card>

          {/* Save Button - only show when form is modified and not cancelled */}
          {hasChanges && !isCancelled && (
            <Button
              variant="primary"
              onClick={() => onSave?.({
                price: parseFloat(price),
                billingCycle,
                renewalDate: new Date(renewalDate),
              })}
              className="w-full"
            >
              Save changes
            </Button>
          )}
        </div>

        {/* Sticky CTA Section */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-divider bg-surface px-6 pb-8 pt-4">
          <div className="flex flex-col gap-3">
            {isCancelled ? (
              <>
                <Button
                  variant="primary"
                  icon={<RotateCcw className="h-[18px] w-[18px]" />}
                  onClick={onRestore}
                  className="w-full"
                >
                  Restore subscription
                </Button>
                <button
                  onClick={onDelete}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-text-muted hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Remove from list</span>
                </button>
              </>
            ) : (
              <>
                {/* Cancel URL button - opens external cancellation page */}
                {subscription.cancelUrl && (
                  <a
                    href={subscription.cancelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Go to cancellation page
                  </a>
                )}
                <Button variant="danger" onClick={onCancel} className="w-full">
                  {subscription.cancelUrl ? "Mark as cancelled" : "Cancel subscription"}
                </Button>
                <p className="text-center text-xs text-text-tertiary">
                  {subscription.cancelUrl
                    ? "After cancelling on their site, mark it here"
                    : "You can resubscribe anytime"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </DetailShell>
  )
}
