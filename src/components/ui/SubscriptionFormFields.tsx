"use client"

import { ChevronDown } from "lucide-react"
import { Card } from "./Card"
import { calculateNextRenewalDate, formatLocalDate } from "@/lib/date-utils"
import type { BillingCycle } from "@/types/database"

export interface SubscriptionFormData {
  price: string
  billingCycle: BillingCycle
  renewalDate: string // YYYY-MM-DD
}

export interface SubscriptionFormFieldsProps {
  value: SubscriptionFormData
  onChange: (data: SubscriptionFormData) => void
  priceLabel?: string | ((cycle: BillingCycle) => string)
  renewalLabel?: string
  readOnly?: boolean
  autoCalculateRenewalOnCycleChange?: boolean
  pricingHints?: { monthly?: number | null; yearly?: number | null }
}

export function SubscriptionFormFields({
  value,
  onChange,
  priceLabel = "Monthly price",
  renewalLabel = "Next renewal",
  readOnly = false,
  autoCalculateRenewalOnCycleChange = false,
  pricingHints,
}: SubscriptionFormFieldsProps) {
  const today = formatLocalDate(new Date())

  const resolvedPriceLabel =
    typeof priceLabel === "function" ? priceLabel(value.billingCycle) : priceLabel

  const handlePriceChange = (newPrice: string) => {
    onChange({ ...value, price: newPrice })
  }

  const handleCycleChange = (newCycle: BillingCycle) => {
    let newPrice = value.price
    let newRenewalDate = value.renewalDate

    // Auto-fill price from hints when cycle changes
    if (pricingHints) {
      if (newCycle === "yearly" && pricingHints.yearly) {
        newPrice = pricingHints.yearly.toFixed(2)
      } else if (newCycle === "monthly" && pricingHints.monthly) {
        newPrice = pricingHints.monthly.toFixed(2)
      }
    }

    // Auto-calculate renewal date when cycle changes
    if (autoCalculateRenewalOnCycleChange) {
      newRenewalDate = calculateNextRenewalDate(newCycle)
    }

    onChange({ ...value, billingCycle: newCycle, price: newPrice, renewalDate: newRenewalDate })
  }

  const handleRenewalDateChange = (newDate: string) => {
    if (newDate && newDate >= today) {
      onChange({ ...value, renewalDate: newDate })
    }
  }

  // Format date for read-only display
  const formattedDate = new Date(value.renewalDate + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Price Row */}
      <div className="flex items-center justify-between px-[18px] py-4">
        <span className="text-[15px] font-medium text-text-primary">{resolvedPriceLabel}</span>
        <div className="flex items-center gap-1">
          <span className="text-[15px] font-semibold text-text-primary">$</span>
          {readOnly ? (
            <span className="text-[15px] font-semibold text-text-muted">{value.price}</span>
          ) : (
            <input
              type="text"
              name="price"
              inputMode="decimal"
              placeholder="0.00"
              aria-label="Price"
              value={value.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="min-w-1 tabular-nums bg-transparent text-right text-[15px] font-semibold text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              style={{ width: `${Math.max(value.price.length || 4, 4) / 1.66}em` }}
            />
          )}
        </div>
      </div>
      <div className="h-px bg-divider" />

      {/* Billing Cycle Row */}
      <div className="flex items-center justify-between px-[18px] py-4">
        <span className="text-[15px] font-medium text-text-primary">Billing cycle</span>
        {readOnly ? (
          <span className="text-[15px] font-semibold capitalize text-text-muted">
            {value.billingCycle}
          </span>
        ) : (
          <div className="relative flex items-center">
            <select
              name="billingCycle"
              aria-label="Billing cycle"
              value={value.billingCycle}
              onChange={(e) => handleCycleChange(e.target.value as BillingCycle)}
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

      {/* Renewal Date Row */}
      <div className="flex items-center justify-between px-[18px] py-4">
        <span className="text-[15px] font-medium text-text-primary">{renewalLabel}</span>
        {readOnly ? (
          <span className="text-[15px] font-semibold text-text-muted">{formattedDate}</span>
        ) : (
          <input
            type="date"
            name="renewalDate"
            aria-label="Renewal date"
            value={value.renewalDate}
            min={today}
            onChange={(e) => handleRenewalDateChange(e.target.value)}
            className="min-w-28 appearance-none bg-transparent text-[15px] font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          />
        )}
      </div>
    </Card>
  )
}
