"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import type { BillingCycle } from "@/types/database"
import { DetailShell } from "@/components/layout"
import { StepProgress } from "@/components/ui"
import { useI18n } from "@/lib/i18n"
import { AddSubscriptionStep1 } from "./AddSubscriptionStep1"
import { AddSubscriptionStep2 } from "./AddSubscriptionStep2"
import { getServiceBySlug, getServiceLogoUrl, getFallbackLogoUrl, getInitials, stringToColor, nameToDomain } from "@/lib/services"

type WizardAddPayload = {
  name: string
  logo: string
  logoColor: string
  price: number
  billingCycle: BillingCycle
  renewalDate: Date
  cancelUrl?: string
}

interface ServiceInfo {
  id: string
  name: string
  logo: string
  logoColor: string
  domain: string | null
  priceMonthly?: number | null
  priceYearly?: number | null
  cancelUrl?: string | null
}

interface AddSubscriptionWizardProps {
  onBack: () => void
  onAdd: (data: WizardAddPayload) => Promise<boolean>
  onDoneForNow: () => void
  /** Returns true if the user can add more subscriptions (not at free limit). */
  canAddMore?: () => boolean
  /** Called when user wants to add another but is at the free limit. */
  onHitLimit?: () => void
}

export function AddSubscriptionWizard({ onBack, onAdd, onDoneForNow, canAddMore, onHitLimit }: AddSubscriptionWizardProps) {
  const { t } = useI18n()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [customServiceName, setCustomServiceName] = useState<string | null>(null)
  const [showAddAnother, setShowAddAnother] = useState(false)

  const step = selectedService ? 2 : 1

  const [serviceInfo, setServiceInfo] = useState<ServiceInfo | null>(null)
  const [serviceLoading, setServiceLoading] = useState(false)

  const isDbService = useMemo(() => (selectedService ? selectedService.startsWith("service:") : false), [selectedService])
  const serviceSlug = useMemo(() => {
    if (!selectedService) return null
    return isDbService ? selectedService.replace("service:", "") : null
  }, [isDbService, selectedService])

  const customName = useMemo(() => {
    if (!selectedService) return null
    if (selectedService.startsWith("custom:")) return selectedService.replace("custom:", "")
    return customServiceName
  }, [customServiceName, selectedService])

  useEffect(() => {
    let cancelled = false

    async function loadService() {
      if (!selectedService) {
        setServiceInfo(null)
        setServiceLoading(false)
        return
      }

      setServiceLoading(true)

      if (serviceSlug) {
        const dbService = await getServiceBySlug(serviceSlug)
        if (cancelled) return

        if (dbService) {
          setServiceInfo({
            id: dbService.id,
            name: dbService.name,
            logo: getServiceLogoUrl(dbService, dbService.domain),
            logoColor: dbService.logo_color,
            domain: dbService.domain,
            priceMonthly: dbService.price_monthly,
            priceYearly: dbService.price_yearly,
            cancelUrl: dbService.cancel_url,
          })
        } else {
          const fallbackName = serviceSlug
          setServiceInfo({
            id: selectedService,
            name: fallbackName,
            logo: getFallbackLogoUrl(nameToDomain(fallbackName)),
            logoColor: stringToColor(fallbackName),
            domain: nameToDomain(fallbackName),
          })
        }

        setServiceLoading(false)
        return
      }

      if (customName) {
        const domain = nameToDomain(customName)
        setServiceInfo({
          id: selectedService,
          name: customName,
          logo: getFallbackLogoUrl(domain),
          logoColor: stringToColor(customName),
          domain,
        })
        setServiceLoading(false)
        return
      }

      setServiceInfo({
        id: selectedService,
        name: "Unknown Service",
        logo: "",
        logoColor: "#6366f1",
        domain: null,
      })
      setServiceLoading(false)
    }

    void loadService()

    return () => {
      cancelled = true
    }
  }, [customName, selectedService, serviceSlug])

  const headerBack = () => {
    if (step === 2) {
      setSelectedService(null)
      setCustomServiceName(null)
      setServiceInfo(null)
      return
    }

    onBack()
  }

  if (showAddAnother) {
    return (
      <div className="motion-safe:animate-[fade-in_0.2s_ease-out] flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">{t("common.added")}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t("common.addAnotherQuestion")}</p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => {
              if (canAddMore && !canAddMore()) {
                onHitLimit?.()
                return
              }
              setShowAddAnother(false)
              setSelectedService(null)
              setCustomServiceName(null)
              setServiceInfo(null)
            }}
            className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t("addSubscription.addAnother")}
          </button>
          <button
            onClick={() => {
              setShowAddAnother(false)
              onDoneForNow()
            }}
            className="w-full rounded-xl border border-divider py-4 text-base font-semibold text-text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t("addSubscription.doneForNow")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <DetailShell
      title={t("addSubscription.title")}
      onBack={headerBack}
      headerRight={(
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Plus className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
      )}
    >
      <div className="sticky top-14 z-30 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-3xl px-6 pt-4 pb-3">
          <StepProgress
            current={step}
            total={2}
            subtitle={step === 1 ? t("addSubscription.step1Subtitle") : t("addSubscription.step2Subtitle")}
          />
        </div>
      </div>

      {step === 1 ? (
        <div key="step-1" className="motion-safe:animate-[fade-in_0.2s_ease-out]">
          <AddSubscriptionStep1
            embedded
            onBack={headerBack}
            showProgress={false}
            onSelectService={(id, customNameValue) => {
              setCustomServiceName(customNameValue ?? null)
              setSelectedService(id)
            }}
            onSearch={() => {}}
          />
        </div>
      ) : serviceLoading || !serviceInfo ? (
        <div className="flex min-h-[60vh] items-center justify-center bg-background">
          <div className="h-8 w-8 motion-safe:animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div key="step-2" className="motion-safe:animate-[fade-in_0.2s_ease-out]">
          <AddSubscriptionStep2
            embedded
            service={serviceInfo}
            onBack={headerBack}
            showProgress={false}
            onSave={(data) => {
              const priceNum = parseFloat(data.price.replace(/[^0-9.]/g, "")) || 0
              void (async () => {
                const ok = await onAdd({
                  name: serviceInfo.name,
                  logo: serviceInfo.domain
                    ? getFallbackLogoUrl(serviceInfo.domain)
                    : getInitials(serviceInfo.name),
                  logoColor: serviceInfo.logoColor,
                  price: priceNum,
                  billingCycle: data.cycle as BillingCycle,
                  renewalDate: data.date,
                  cancelUrl: serviceInfo.cancelUrl ?? undefined,
                })

                if (ok) setShowAddAnother(true)
              })()
            }}
          />
        </div>
      )}
    </DetailShell>
  )
}
