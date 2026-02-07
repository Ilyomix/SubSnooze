"use client"

import { useState, useRef, useId, type ReactNode } from "react"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { ExternalLink, PiggyBank, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui"
import { ServiceIcon } from "@/components/ui"
import { useI18n } from "@/lib/i18n"
import { toMonthlyPrice } from "@/lib/date-utils"
import type { Subscription } from "@/types/subscription"

interface ActionModalProps {
  icon: ReactNode
  title: string
  description?: string
  content?: ReactNode
  primaryAction: {
    label: string
    icon?: ReactNode
    variant?: "primary" | "secondary" | "danger" | "ghost"
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    icon?: ReactNode
    onClick: () => void
  }
  onClose: () => void
}

export function ActionModal({
  icon,
  title,
  description,
  content,
  primaryAction,
  secondaryAction,
  onClose,
}: ActionModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useFocusTrap(dialogRef, onClose)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div ref={dialogRef} tabIndex={-1} className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl bg-surface p-6 outline-none" onClick={(e) => e.stopPropagation()}>
        {/* Logo - squircle style */}
        {icon}

        {/* Title */}
        <h2 id={titleId} className="text-xl font-bold text-text-primary">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="text-center text-[15px] text-text-secondary">
            {description}
          </p>
        )}

        {/* Info Card */}
        {content}

        {/* CTA */}
        <Button
          variant={primaryAction.variant ?? "primary"}
          icon={primaryAction.icon}
          onClick={primaryAction.onClick}
          className="w-full"
        >
          {primaryAction.label}
        </Button>

        {/* Decide Later — ADHD-friendly: no pressure, come back anytime */}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="flex items-center gap-2 rounded-xl border border-divider px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {secondaryAction.icon}
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}

interface CancelRedirectModalProps {
  subscription: Subscription
  onProceed: (remindMe: boolean) => void
  onDecideLater?: () => void
  onClose: () => void
}

export function CancelRedirectModal({
  subscription,
  onProceed,
  onDecideLater,
  onClose,
}: CancelRedirectModalProps) {
  const { t, formatCurrency, formatDate } = useI18n()

  const monthlyCost = toMonthlyPrice(subscription.price, subscription.billingCycle)

  return (
    <ActionModal
      icon={(
        <ServiceIcon
          name={subscription.name}
          logoColor={subscription.logoColor}
          logoUrl={subscription.logo?.startsWith("http") ? subscription.logo : undefined}
          size={56}
        />
      )}
      title={t("cancelFlow.cancelTitle", { name: subscription.name })}
      description={t("cancelFlow.cancelDescription", { name: subscription.name })}
      content={(
        <div className="flex w-full flex-col gap-2 rounded-xl bg-background p-4">
          <div className="flex items-center gap-3">
            <PiggyBank className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-sm text-text-primary">
              {t("cancelFlow.youllSave", { amount: formatCurrency(monthlyCost, { currency: subscription.currency }) })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
            <span className="text-sm text-text-primary">
              {t("cancelFlow.accessUntil", { date: formatDate(subscription.renewalDate) })}
            </span>
          </div>
        </div>
      )}
      primaryAction={{
        label: t("cancelFlow.goTo", { name: subscription.name }),
        icon: <ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" />,
        variant: "danger",
        onClick: () => onProceed(false),
      }}
      secondaryAction={{
        label: t("cancelFlow.decideLater"),
        icon: <Clock className="h-4 w-4 text-text-tertiary" aria-hidden="true" />,
        onClick: () => {
          onDecideLater?.()
          onClose()
        },
      }}
      onClose={onClose}
    />
  )
}
