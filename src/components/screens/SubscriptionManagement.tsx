"use client"

import { useState } from "react"
import { Flame, ChevronDown } from "lucide-react"
import { Header } from "@/components/layout"
import { Card, Button } from "@/components/ui"
import type { Subscription } from "@/types/subscription"

interface SubscriptionManagementProps {
  subscription: Subscription
  onBack: () => void
  onCancel: () => void
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
  onSave,
}: SubscriptionManagementProps) {
  const originalPrice = subscription.price.toFixed(2)
  const originalCycle = subscription.billingCycle
  const originalDate = subscription.renewalDate.toISOString().split("T")[0]

  const [price, setPrice] = useState(originalPrice)
  const [billingCycle, setBillingCycle] = useState(originalCycle)
  const [renewalDate, setRenewalDate] = useState(originalDate)

  const daysUntil = getDaysUntilRenewal(subscription.renewalDate)
  const isRenewingSoon = subscription.status === "renewing_soon"

  const hasChanges = price !== originalPrice || billingCycle !== originalCycle || renewalDate !== originalDate

  return (
    <div className="flex min-h-screen flex-col bg-background pt-12">
      <div className="flex flex-1 flex-col gap-6 px-6">
        <Header showBack onBack={onBack}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-[10px] text-lg font-bold text-white"
              style={{ backgroundColor: subscription.logoColor }}
            >
              {subscription.logo}
            </div>
            <span className="text-[22px] font-semibold text-text-primary">{subscription.name}</span>
          </div>
        </Header>

        {/* Status Badge */}
        {isRenewingSoon && (
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
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="min-w-1 tabular-nums bg-transparent text-right text-[15px] font-semibold text-text-primary focus:outline-none"
                style={{ width: `${Math.max(price.length, 0) / 1.66}em` }}
              />
            </div>
          </div>
          <div className="h-px bg-divider" />
          <div className="flex items-center justify-between px-[18px] py-4">
            <span className="text-[15px] font-medium text-text-primary">Billing cycle</span>
            <div className="relative flex items-center">
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="min-w-20 appearance-none bg-transparent pr-5 text-right text-[15px] font-semibold capitalize text-text-primary focus:outline-none"
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
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="min-w-28 appearance-none bg-transparent text-[15px] font-semibold text-text-primary focus:outline-none"
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

        <div className="flex-1" />

        {/* Cancel Section */}
        <div className="flex flex-col gap-2 pb-8">
          <Button variant="danger" onClick={onCancel} className="w-full">
            Cancel subscription
          </Button>
          <p className="text-center text-xs text-text-tertiary">
            You can resubscribe anytime
          </p>
        </div>
      </div>
    </div>
  )
}
