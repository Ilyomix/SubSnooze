"use client"

import { useState } from "react"
import { DetailShell } from "@/components/layout"
import { Button, SubscriptionFormFields, ServiceIcon, StepProgress } from "@/components/ui"
import type { SubscriptionFormData } from "@/components/ui"
import { calculateNextRenewalDate, parseLocalDate } from "@/lib/date-utils"
import { useI18n } from "@/lib/i18n"
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
  embedded?: boolean
  showProgress?: boolean
}

export function AddSubscriptionStep2({
  service,
  onBack,
  onSave,
  embedded = false,
  showProgress = true,
}: AddSubscriptionStep2Props) {
  const { t } = useI18n()

  // Pre-fill price from database if available
  const defaultPrice = service.priceMonthly
    ? service.priceMonthly.toFixed(2)
    : ""

  const [formData, setFormData] = useState<SubscriptionFormData>({
    price: defaultPrice,
    billingCycle: "monthly",
    renewalDate: calculateNextRenewalDate("monthly"),
  })

  const priceNum = parseFloat(formData.price)
  const isValidPrice = !isNaN(priceNum) && priceNum > 0
  const isValidDate = formData.renewalDate !== ""

  const content = (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-32">
        {embedded && (
          <div className="flex flex-col items-center gap-2 pt-2">
            <ServiceIcon
              name={service.name}
              logoColor={service.logoColor}
              logoUrl={service.logo.startsWith("http") ? service.logo : undefined}
              domain={service.domain ?? undefined}
              size={48}
            />
            <span className="text-lg font-semibold text-text-primary truncate">{service.name}</span>
          </div>
        )}

        {showProgress && (
          <StepProgress current={2} total={2} subtitle={t("addSubscription.step2Subtitle")} />
        )}

        <SubscriptionFormFields
          value={formData}
          onChange={setFormData}
          priceLabel={(cycle: BillingCycle) => cycle === "yearly" ? t("addSubscription.yearlyPrice") : t("addSubscription.monthlyPrice")}
          autoCalculateRenewalOnCycleChange
          pricingHints={{ monthly: service.priceMonthly, yearly: service.priceYearly }}
        />

      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-surface pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-3xl px-6">
          <Button
            variant="primary"
            onClick={() => onSave({
              price: formData.price,
              cycle: formData.billingCycle,
              date: parseLocalDate(formData.renewalDate),
            })}
            disabled={!isValidPrice || !isValidDate}
            className="w-full"
          >
            {t("addSubscription.saveSubscription")}
          </Button>
        </div>
      </div>
    </div>
  )

  if (embedded) return content

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
      {content}
    </DetailShell>
  )
}
