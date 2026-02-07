"use client"

import { useState } from "react"
import { Bell, CreditCard, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui"
import { useI18n } from "@/lib/i18n"

interface OnboardingProps {
  onComplete: () => void
  onRequestNotifications: () => void
}

export function Onboarding({ onComplete, onRequestNotifications }: OnboardingProps) {
  const { t } = useI18n()
  const [step, setStep] = useState(0)

  const steps = [
    {
      icon: Sparkles,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      title: t("onboarding.welcomeTitle"),
      description: t("onboarding.welcomeDescription"),
    },
    {
      icon: CreditCard,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      title: t("onboarding.addTitle"),
      description: t("onboarding.addDescription"),
    },
    {
      icon: Bell,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      title: t("onboarding.notifyTitle"),
      description: t("onboarding.notifyDescription"),
    },
  ]

  const current = steps[step]
  const isLast = step === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      onRequestNotifications()
      onComplete()
    } else {
      setStep(step + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Skip button */}
      <div className="flex justify-end px-6 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          onClick={handleSkip}
          className="rounded-lg px-3 py-2 text-sm font-medium text-text-tertiary hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {t("common.skip")}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {/* Icon */}
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${current.iconBg}`}>
          <current.icon className={`h-10 w-10 ${current.iconColor}`} />
        </div>

        {/* Text */}
        <h1 className="mt-8 text-center text-2xl font-bold text-text-primary">
          {current.title}
        </h1>
        <p className="mt-3 max-w-[300px] text-center text-[15px] leading-relaxed text-text-secondary">
          {current.description}
        </p>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-4 px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full motion-safe:transition-all motion-safe:duration-300 ${
                i === step ? "w-6 bg-primary" : "w-2 bg-divider"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <Button
          variant="primary"
          icon={isLast ? <Bell className="h-[18px] w-[18px]" /> : <ArrowRight className="h-[18px] w-[18px]" />}
          onClick={handleNext}
          className="w-full"
        >
          {isLast ? t("onboarding.enableAndStart") : t("common.continue")}
        </Button>

        {isLast && (
          <button
            onClick={handleSkip}
            className="text-center text-sm text-text-tertiary hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            {t("onboarding.maybeLater")}
          </button>
        )}
      </div>
    </div>
  )
}
