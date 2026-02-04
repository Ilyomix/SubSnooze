"use client"

import { useState } from "react"
import { Flame, ChevronDown, XCircle, Trash2, RotateCcw } from "lucide-react"
import { DetailShell } from "@/components/layout"
import { Card, Button } from "@/components/ui"
import { daysUntilRenewal } from "@/types/subscription"
import type { Subscription } from "@/types/subscription"
import type { BillingCycle } from "@/types/database"

interface SubscriptionManagementProps {
  subscription: Subscription
  onBack: () => void
  onRestore?: () => void
  onDelete?: () => void
  onSave?: (data: { price: number; billingCycle: string; renewalDate: Date }) => void
}

function calculateNextRenewalDate(billingCycle: BillingCycle): string {
  const today = new Date()
  const nextDate = new Date(today)
  if (billingCycle === "weekly") {
    nextDate.setDate(today.getDate() + 7)
  } else if (billingCycle === "yearly") {
    nextDate.setFullYear(today.getFullYear() + 1)
  } else {
    nextDate.setMonth(today.getMonth() + 1)
  }
  return nextDate.toISOString().split("T")[0]
}

export function SubscriptionManagement({
  subscription,
  onBack,
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

  const daysUntil = daysUntilRenewal(subscription.renewalDate)
  const isRenewingSoon = subscription.status === "renewing_soon"
  const isCancelled = subscription.status === "cancelled"

  const hasChanges = price !== originalPrice || billingCycle !== originalCycle || renewalDate !== originalDate

  return (
    <DetailShell
      title={subscription.name}
      onBack={onBack}
      headerRight={
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: subscription.logoColor }}
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
                Renews in {daysUntil} days
              </span>
            </div>
          )}

          {/* Editable Details Card */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between px-[18px] py-4">
              <span className="text-[15px] font-medium text-text-primary">Monthly price</span>
              <div className="flex items-center gap-1">
                <span className="text-[15px] font-semibold text-text-primary">$</span>
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
              </div>
            </div>
            <div className="h-px bg-divider" />
            <div className="flex items-center justify-between px-[18px] py-4">
              <span className="text-[15px] font-medium text-text-primary">Billing cycle</span>
              <div className="relative flex items-center">
                <select
                  name="billingCycle"
                  aria-label="Billing cycle"
                  value={billingCycle}
                  onChange={(e) => {
                    const newCycle = e.target.value as BillingCycle
                    setBillingCycle(newCycle)
                    setRenewalDate(calculateNextRenewalDate(newCycle))
                  }}
                  className="min-w-20 appearance-none bg-transparent pr-5 text-right text-[15px] font-semibold capitalize text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-text-muted" />
              </div>
            </div>
            <div className="h-px bg-divider" />
            <div className="flex items-center justify-between px-[18px] py-4">
              <span className="text-[15px] font-medium text-text-primary">Next renewal</span>
              <input
                type="date"
                name="renewalDate"
                aria-label="Next renewal date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="min-w-28 appearance-none bg-transparent text-[15px] font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              />
            </div>
          </Card>

          {/* Save Button - only show when form is modified */}
          {hasChanges && (
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
            {isCancelled && (
              <Button
                variant="primary"
                icon={<RotateCcw className="h-[18px] w-[18px]" />}
                onClick={onRestore}
                className="w-full"
              >
                Restore subscription
              </Button>
            )}
            <button
              onClick={onDelete}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-text-muted hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Remove from list</span>
            </button>
          </div>
        </div>
      </div>
    </DetailShell>
  )
}
