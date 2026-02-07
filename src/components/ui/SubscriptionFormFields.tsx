"use client"

import { useState } from "react"
import { ChevronDown, Calendar } from "lucide-react"
import { Card } from "./Card"
import { calculateNextRenewalDate, formatLocalDate } from "@/lib/date-utils"
import { CURRENCY_SYMBOL, formatCurrency } from "@/lib/utils"
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
  const [priceTouched, setPriceTouched] = useState(false)
  const [dateTouched, setDateTouched] = useState(false)

  const resolvedPriceLabel =
    typeof priceLabel === "function" ? priceLabel(value.billingCycle) : priceLabel

  const priceNum = parseFloat(value.price)
  const priceError =
    priceTouched && !readOnly
      ? value.price === ""
        ? "Enter a price"
        : isNaN(priceNum) || priceNum <= 0
          ? "Price must be greater than 0"
          : null
      : null

  const dateError =
    dateTouched && !readOnly && value.renewalDate === ""
      ? "Select a renewal date"
      : null

  const handlePriceChange = (newPrice: string) => {
    // Only allow digits and at most one decimal point (max 2 decimal places)
    if (newPrice !== "" && !/^\d*\.?\d{0,2}$/.test(newPrice)) return
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
      <div>
        <label htmlFor="price" className="flex cursor-pointer items-center justify-between px-[18px] py-4">
          <span className="text-[15px] font-medium text-text-primary">{resolvedPriceLabel}</span>
          <div className="flex items-center gap-1">
            <span className={`text-[15px] font-semibold ${readOnly ? "text-text-muted" : "text-text-primary"}`}>{CURRENCY_SYMBOL}</span>
            {readOnly ? (
              <span className="text-[15px] font-semibold text-text-muted">{value.price}</span>
            ) : (
              <input
                id="price"
                type="text"
                name="price"
                inputMode="decimal"
                placeholder="0.00"
                aria-label="Price"
                aria-invalid={!!priceError || undefined}
                value={value.price}
                onChange={(e) => handlePriceChange(e.target.value)}
                onBlur={() => setPriceTouched(true)}
                className="min-w-1 tabular-nums bg-transparent text-right text-[15px] font-semibold text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                style={{ width: `${Math.max(value.price.length || 4, 4) / 1.66}em` }}
              />
            )}
          </div>
        </label>
        {priceError && (
          <p className="px-[18px] pb-2 -mt-2 text-xs text-accent" role="alert">{priceError}</p>
        )}
        {!readOnly && !priceError && priceNum > 0 && (
          <p className="px-[18px] pb-2 -mt-2 text-xs text-text-tertiary">
            {value.billingCycle === "monthly" && `${formatCurrency(priceNum * 12)}/yr`}
            {value.billingCycle === "yearly" && `${formatCurrency(priceNum / 12)}/mo`}
            {value.billingCycle === "weekly" && `${formatCurrency(priceNum * 4.33)}/mo`}
          </p>
        )}
      </div>
      <div className="h-px bg-divider" />

      {/* Billing Cycle Row */}
      <label htmlFor="billingCycle" className="flex cursor-pointer items-center justify-between px-[18px] py-4">
        <span className="text-[15px] font-medium text-text-primary">Billing cycle</span>
        {readOnly ? (
          <span className="text-[15px] font-semibold capitalize text-text-muted">
            {value.billingCycle}
          </span>
        ) : (
          <div className="relative flex items-center">
            <select
              id="billingCycle"
              name="billingCycle"
              aria-label="Billing cycle"
              value={value.billingCycle}
              onChange={(e) => handleCycleChange(e.target.value as BillingCycle)}
              className="min-w-24 appearance-none bg-transparent pr-7 text-right text-[15px] font-semibold capitalize text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-text-muted" />
          </div>
        )}
      </label>
        <div className="h-px bg-divider" />

      {/* Renewal Date Row */}
      <div>
        <label htmlFor="renewalDate" className="flex cursor-pointer items-center justify-between px-[18px] py-4">
          <span className="text-[15px] font-medium text-text-primary">{renewalLabel}</span>
          {readOnly ? (
            <span className="text-[15px] font-semibold text-text-muted">{formattedDate}</span>
          ) : (
            <div className="relative flex items-center">
              <input
                id="renewalDate"
                type="date"
                name="renewalDate"
                aria-label="Renewal date"
                aria-invalid={!!dateError || undefined}
                value={value.renewalDate}
                min={today}
                onChange={(e) => handleRenewalDateChange(e.target.value)}
                onBlur={() => setDateTouched(true)}
                className="w-[12ch] appearance-none bg-transparent pr-5 text-right text-[15px] font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-datetime-edit-fields-wrapper]:p-0"
              />
              <Calendar className="pointer-events-none absolute right-0 h-4 w-4 text-text-muted" />
            </div>
          )}
        </label>
        {dateError && (
          <p className="px-[18px] pb-2 -mt-2 text-xs text-accent" role="alert">{dateError}</p>
        )}
      </div>
    </Card>
  )
}
