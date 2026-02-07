"use client"

import { cn } from "@/lib/utils"
import { ChevronRight, Bell } from "lucide-react"
import { Badge } from "./Badge"
import { ServiceIcon } from "./ServiceIcon"
import type { Subscription } from "@/types/subscription"
import { daysUntilRenewal } from "@/types/subscription"
import { useI18n } from "@/lib/i18n"
import type { CurrencyCode } from "@/lib/i18n"

interface SubscriptionRowProps {
  subscription: Subscription
  onClick?: () => void
  showReminderStage?: boolean
}

function getReminderBadge(daysUntil: number, t: (key: string, params?: Record<string, string | number>) => string) {
  // Show urgency badge based on days until renewal
  if (daysUntil <= 0) {
    return (
      <Badge variant="urgent">
        <Bell className="h-3 w-3" aria-hidden="true" />
        {t("allSubscriptions.renewsToday")}
      </Badge>
    )
  }

  if (daysUntil === 1) {
    return (
      <Badge variant="urgent">
        <Bell className="h-3 w-3" aria-hidden="true" />
        {t("allSubscriptions.renewsTomorrow")}
      </Badge>
    )
  }

  if (daysUntil <= 3) {
    return (
      <Badge variant="warning">
        <Bell className="h-3 w-3" aria-hidden="true" />
        {t("allSubscriptions.renewsInDays", { days: daysUntil })}
      </Badge>
    )
  }

  if (daysUntil <= 7) {
    return (
      <Badge variant="reminder">
        <Bell className="h-3 w-3" aria-hidden="true" />
        {t("allSubscriptions.renewsInDays", { days: daysUntil })}
      </Badge>
    )
  }

  return null
}

export function SubscriptionRow({ subscription, onClick, showReminderStage = true }: SubscriptionRowProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const isRenewingSoon = subscription.status === "renewing_soon"
  const isCancelled = subscription.status === "cancelled"
  const daysUntil = daysUntilRenewal(subscription.renewalDate)

  return (
    <button
      onClick={onClick}
      aria-label={`Manage ${subscription.name} subscription`}
      className={cn(
        "flex w-full items-center text-left motion-safe:transition-colors hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        isCancelled && "opacity-60"
      )}
    >
      {/* Content */}
      <div className="flex flex-1 items-center justify-between p-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo - squircle style */}
          <ServiceIcon
            name={subscription.name}
            logoColor={subscription.logoColor}
            logoUrl={subscription.logo?.startsWith("http") ? subscription.logo : undefined}
            size={44}
          />

          {/* Info */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className={cn(
              "font-semibold text-text-primary truncate",
              isCancelled && "line-through"
            )}>
              {subscription.name}
            </span>
            <span className="text-sm text-text-tertiary truncate">
              {isCancelled
                ? t("allSubscriptions.cancelledWasDue", { date: formatDate(subscription.renewalDate, "short") })
                : t("allSubscriptions.nextRenewal", { date: formatDate(subscription.renewalDate, "short") })
              }
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
          {showReminderStage && !isCancelled && getReminderBadge(daysUntil, t)}
          {!showReminderStage && isRenewingSoon && (
            <Badge variant="warning">
              {daysUntil <= 0 ? t("allSubscriptions.renewsToday") : daysUntil === 1 ? t("allSubscriptions.renewsTomorrow") : t("allSubscriptions.renewsInDays", { days: daysUntil })}
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex flex-col items-end",
              isCancelled && "line-through"
            )}>
              <span className="font-semibold tabular-nums text-text-primary">
                {formatCurrency(subscription.price, { currency: subscription.currency as CurrencyCode })}
              </span>
              <span className="text-[11px] text-text-muted">
                /{subscription.billingCycle === "yearly" ? t("allSubscriptions.yr") : subscription.billingCycle === "weekly" ? "wk" : t("allSubscriptions.mo")}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-text-muted" aria-hidden="true" />
          </div>
        </div>
      </div>
    </button>
  )
}
