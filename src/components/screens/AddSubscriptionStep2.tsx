"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { DetailShell } from "@/components/layout"
import { Card, Button } from "@/components/ui"
import { getInitials, getFallbackLogoUrl } from "@/lib/services"

interface ServiceInfo {
  id: string
  name: string
  logo: string
  logoColor: string
  domain: string | null
  // Pre-filled from database
  priceMonthly?: number | null
  priceYearly?: number | null
  cancelUrl?: string | null
}

interface AddSubscriptionStep2Props {
  service: ServiceInfo
  onBack: () => void
  onSave: (data: { price: string; cycle: string; date: Date }) => void
}

function ServiceLogoHeader({ service }: { service: ServiceInfo }) {
  // 0 = primary, 1 = fallback (Google), 2 = initials
  const [logoStage, setLogoStage] = useState(0)
  const isUrl = service.logo.startsWith("http")

  const logoUrl = logoStage === 0
    ? service.logo
    : logoStage === 1 && service.domain
      ? getFallbackLogoUrl(service.domain)
      : null

  const handleError = () => {
    setLogoStage((prev) => prev + 1)
  }

  // Squircle border radius (~22% of 36px = 8px)
  const size = 36
  const borderRadius = 8
  const padding = 4

  if (!isUrl || logoStage >= 2 || !logoUrl) {
    return (
      <div
        className="flex items-center justify-center text-sm font-bold text-white"
        style={{
          backgroundColor: service.logoColor,
          width: size,
          height: size,
          borderRadius,
        }}
      >
        {getInitials(service.name)}
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor: service.logoColor,
        width: size,
        height: size,
        borderRadius,
        padding,
      }}
    >
      <Image
        src={logoUrl}
        alt={service.name}
        width={size - padding * 2}
        height={size - padding * 2}
        className="object-contain"
        onError={handleError}
        unoptimized
      />
    </div>
  )
}

function calculateNextRenewalDate(cycle: string): string {
  const today = new Date()
  const nextDate = new Date(today)
  if (cycle === "weekly") {
    nextDate.setDate(today.getDate() + 7)
  } else if (cycle === "yearly") {
    nextDate.setFullYear(today.getFullYear() + 1)
  } else {
    nextDate.setMonth(today.getMonth() + 1)
  }
  return nextDate.toISOString().split("T")[0]
}

export function AddSubscriptionStep2({
  service,
  onBack,
  onSave,
}: AddSubscriptionStep2Props) {
  // Pre-fill price from database if available
  const defaultPrice = service.priceMonthly
    ? service.priceMonthly.toFixed(2)
    : ""

  const [price, setPrice] = useState(defaultPrice)
  const [cycle, setCycle] = useState("monthly")
  const [renewalDate, setRenewalDate] = useState(calculateNextRenewalDate("monthly"))

  // Minimum date is today
  const today = new Date().toISOString().split("T")[0]

  // Update price and renewal date when cycle changes
  const handleCycleChange = (newCycle: string) => {
    setCycle(newCycle)
    setRenewalDate(calculateNextRenewalDate(newCycle))

    // Auto-fill price based on cycle if we have database pricing
    if (newCycle === "yearly" && service.priceYearly) {
      setPrice(service.priceYearly.toFixed(2))
    } else if (newCycle === "monthly" && service.priceMonthly) {
      setPrice(service.priceMonthly.toFixed(2))
    }
  }

  return (
    <DetailShell
      title={service.name}
      onBack={onBack}
      headerRight={<ServiceLogoHeader service={service} />}
    >
      <div className="flex flex-1 flex-col gap-8 px-6 pt-4">

        {/* Progress Indicator */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[13px] font-medium text-text-secondary">Step 2 of 2</span>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <div className="h-0.5 w-10 rounded-sm bg-primary" />
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          </div>
          <span className="text-xs text-text-tertiary">Almost there… Add the details</span>
        </div>

        {/* Form - Card row layout matching subscription detail */}
        <Card padding="none" className="overflow-hidden">
          {/* Price Row */}
          <div className="flex items-center justify-between px-[18px] py-4">
            <span className="text-[15px] font-medium text-text-primary">
              {cycle === "yearly" ? "Yearly price" : "Monthly price"}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[15px] font-semibold text-text-primary">$</span>
              <input
                type="text"
                name="price"
                inputMode="decimal"
                placeholder="0.00"
                aria-label="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="min-w-1 tabular-nums bg-transparent text-right text-[15px] font-semibold text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                style={{ width: `${Math.max(price.length || 4, 4) / 1.66}em` }}
              />
            </div>
          </div>
          <div className="h-px bg-divider" />

          {/* Billing Cycle Row */}
          <div className="flex items-center justify-between px-[18px] py-4">
            <span className="text-[15px] font-medium text-text-primary">Billing cycle</span>
            <div className="relative flex items-center">
              <select
                name="billingCycle"
                aria-label="Billing cycle"
                value={cycle}
                onChange={(e) => handleCycleChange(e.target.value)}
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

          {/* Renewal Date Row */}
          <div className="flex items-center justify-between px-[18px] py-4">
            <span className="text-[15px] font-medium text-text-primary">Next renewal</span>
            <input
              type="date"
              name="renewalDate"
              aria-label="Next renewal date"
              value={renewalDate}
              min={today}
              onChange={(e) => {
                if (e.target.value && e.target.value >= today) {
                  setRenewalDate(e.target.value)
                }
              }}
              className="min-w-28 appearance-none bg-transparent text-[15px] font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            />
          </div>
        </Card>

        {/* Pricing hint if available */}
        {(service.priceMonthly || service.priceYearly) && (
          <p className="text-xs text-text-tertiary text-center">
            {service.priceMonthly && `$${service.priceMonthly.toFixed(2)}/mo`}
            {service.priceMonthly && service.priceYearly && " · "}
            {service.priceYearly && `$${service.priceYearly.toFixed(2)}/yr`}
          </p>
        )}

        <div className="flex-1" />

        {/* Save Button */}
        <div className="pb-8">
          <Button
            variant="primary"
            onClick={() => onSave({ price, cycle, date: new Date(renewalDate) })}
            className="w-full"
          >
            Save subscription
          </Button>
        </div>
      </div>
    </DetailShell>
  )
}
