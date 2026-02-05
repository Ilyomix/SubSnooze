"use client"

import { useState } from "react"
import { DetailShell } from "@/components/layout"
import { Button, SubscriptionFormFields, ServiceIcon } from "@/components/ui"
import type { SubscriptionFormData } from "@/components/ui"
import { calculateNextRenewalDate, parseLocalDate } from "@/lib/date-utils"
import type { BillingCycle } from "@/types/database"

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

export function AddSubscriptionStep2({
  service,
  onBack,
  onSave,
}: AddSubscriptionStep2Props) {
  // Pre-fill price from database if available
  const defaultPrice = service.priceMonthly
    ? service.priceMonthly.toFixed(2)
    : ""

  const [formData, setFormData] = useState<SubscriptionFormData>({
    price: defaultPrice,
    billingCycle: "monthly",
    renewalDate: calculateNextRenewalDate("monthly"),
  })

  return (
    <DetailShell
      title={service.name}
      onBack={onBack}
      headerRight={
        <ServiceIcon
          name={service.name}
          logoColor={service.logoColor}
          logoUrl={service.logo.startsWith("http") ? service.logo : undefined}
          domain={service.domain ?? undefined}
          size={36}
        />
      }
    >
      <div className="flex min-h-full flex-col">
        <div className="flex flex-1 flex-col gap-8 px-6 pt-4 pb-32">

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

          {/* Form */}
          <SubscriptionFormFields
            value={formData}
            onChange={setFormData}
            priceLabel={(cycle: BillingCycle) => cycle === "yearly" ? "Yearly price" : "Monthly price"}
            autoCalculateRenewalOnCycleChange
            pricingHints={{ monthly: service.priceMonthly, yearly: service.priceYearly }}
          />

        </div>

        {/* Sticky Save Button */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-divider bg-surface px-6 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <Button
            variant="primary"
            onClick={() => onSave({
              price: formData.price,
              cycle: formData.billingCycle,
              date: parseLocalDate(formData.renewalDate),
            })}
            className="w-full"
          >
            Save subscription
          </Button>
        </div>
      </div>
    </DetailShell>
  )
}
