"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, XCircle, PiggyBank, CreditCard, ChevronDown, ChevronUp } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { AppShell } from "@/components/layout"
import { Card, Button, SectionHeader, SubscriptionRow, ErrorState } from "@/components/ui"
import { useI18n } from "@/lib/i18n"
import type { Subscription } from "@/types/subscription"

const ALL_GOOD_PREVIEW_LIMIT = 3

interface DashboardProps {
  userName: string
  totalSaved: number
  totalMonthly: number
  subscriptions: Subscription[]
  onAddSubscription: () => void
  onSubscriptionClick: (id: string) => void
  onNotificationClick: () => void
  notificationCount: number
  activeTab: "home" | "subs" | "settings"
  onTabChange: (tab: "home" | "subs" | "settings") => void
  error?: Error | null
  onRetry?: () => void
}

export function Dashboard({
  userName,
  totalSaved,
  totalMonthly,
  subscriptions,
  onAddSubscription,
  onSubscriptionClick,
  onNotificationClick,
  notificationCount,
  activeTab,
  onTabChange,
  error,
  onRetry,
}: DashboardProps) {
  const { t, currency, locale } = useI18n()
  const localeTag = locale === "fr" ? "fr-FR" : "en-US"
  const [showAllGood, setShowAllGood] = useState(false)

  // Cached display values for smooth NumberFlow animations
  const [displaySaved, setDisplaySaved] = useState(() => {
    if (typeof window === "undefined") return totalSaved
    return parseFloat(localStorage.getItem("subsnooze_totalSaved") || "0")
  })
  const [displayMonthly, setDisplayMonthly] = useState(() => {
    if (typeof window === "undefined") return totalMonthly
    return parseFloat(localStorage.getItem("subsnooze_totalMonthly") || "0")
  })
  const [displayActive, setDisplayActive] = useState(() => {
    if (typeof window === "undefined") return 0
    return parseInt(localStorage.getItem("subsnooze_activeCount") || "0")
  })

  const mounted = useRef(false)

  const renewingSoon = subscriptions
    .filter((s) => s.status === "renewing_soon")
    .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime())
  const allGood = subscriptions.filter((s) => s.status === "good")
  const cancelled = subscriptions.filter((s) => s.status === "cancelled")
  const activeCount = subscriptions.filter((s) => s.status !== "cancelled").length

  useEffect(() => {
    // Small delay on mount so user sees the animation; instant on subsequent updates
    const delay = mounted.current ? 0 : 300
    mounted.current = true

    const timer = setTimeout(() => {
      setDisplaySaved(totalSaved)
      setDisplayMonthly(totalMonthly)
      setDisplayActive(activeCount)
    }, delay)

    localStorage.setItem("subsnooze_totalSaved", String(totalSaved))
    localStorage.setItem("subsnooze_totalMonthly", String(totalMonthly))
    localStorage.setItem("subsnooze_activeCount", String(activeCount))

    return () => clearTimeout(timer)
  }, [totalSaved, totalMonthly, activeCount])

  const visibleAllGood = showAllGood ? allGood : allGood.slice(0, ALL_GOOD_PREVIEW_LIMIT)
  const hasMoreAllGood = allGood.length > ALL_GOOD_PREVIEW_LIMIT

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={onTabChange}
      onNotificationClick={onNotificationClick}
      notificationCount={notificationCount}
    >
      <div className="flex flex-col gap-6 px-6 pt-4 pb-40">
        {/* Greeting */}
        <h1 className="text-2xl font-semibold text-text-primary">
          {t("dashboard.greeting", { name: userName })}
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3" aria-live="polite" aria-atomic="true">
          {/* Monthly Spend — primary focus card */}
          <div className="flex flex-col justify-between rounded-2xl bg-black/80 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 sm:h-9 sm:w-9 sm:rounded-xl">
                <CreditCard className="h-4 w-4 text-white sm:h-5 sm:w-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{t("dashboard.monthlyLabel")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <NumberFlow
                value={displayMonthly}
                locales={localeTag}
                format={{ style: "currency", currency, maximumFractionDigits: 0 }}
                transformTiming={{ duration: 750, easing: "ease-out" }}
                spinTiming={{ duration: 750, easing: "ease-out" }}
                className="text-2xl font-bold tabular-nums text-white sm:text-3xl"
              />
              <span className="text-[11px] font-medium text-white/50 sm:text-xs">
                <NumberFlow
                  value={displayActive}
                  transformTiming={{ duration: 750, easing: "ease-out" }}
                  spinTiming={{ duration: 750, easing: "ease-out" }}
                  className="tabular-nums"
                />{" "}{t("dashboard.activeSubscriptions", { count: activeCount })}
              </span>
            </div>
          </div>

          {/* Money Saved — reward card */}
          <div className="flex flex-col justify-between rounded-2xl bg-primary p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 sm:h-9 sm:w-9 sm:rounded-xl">
                <PiggyBank className="h-4 w-4 text-white sm:h-5 sm:w-5" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/60">{t("dashboard.savedLabel")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <NumberFlow
                value={displaySaved}
                locales={localeTag}
                format={{ style: "currency", currency, maximumFractionDigits: 0 }}
                transformTiming={{ duration: 750, easing: "ease-out" }}
                spinTiming={{ duration: 750, easing: "ease-out" }}
                className="text-2xl font-bold tabular-nums text-white sm:text-3xl"
              />
              <span className="text-[11px] font-medium text-white/60 sm:text-xs">
                {cancelled.length > 0
                  ? t("dashboard.cancelledNiceWork", { count: cancelled.length })
                  : t("dashboard.cancelToSave")}
              </span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && subscriptions.length === 0 && (
          <ErrorState onRetry={onRetry} />
        )}

        {/* Empty State — no subscriptions yet */}
        {!error && subscriptions.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-semibold text-text-primary">{t("dashboard.noSubscriptions")}</span>
              <span className="text-sm text-text-tertiary text-center max-w-[260px]">
                {t("dashboard.noSubscriptionsHint")}
              </span>
            </div>
            <Button
              variant="primary"
              icon={<Plus className="h-[18px] w-[18px]" />}
              onClick={onAddSubscription}
            >
              {t("dashboard.addSubscription")}
            </Button>
          </div>
        )}

        {/* Renewing Soon Section — always fully expanded, sorted by urgency */}
        {renewingSoon.length > 0 && (
          <div className="flex flex-col gap-3">
            <SectionHeader title={t("dashboard.comingUp")} count={renewingSoon.length} variant="warning" />
            <div className="flex">
              <div className="w-1 bg-accent" aria-hidden="true" />
              <Card padding="none" className="flex-1 overflow-hidden rounded-l-none">
                {renewingSoon.map((sub, index) => (
                  <div key={sub.id}>
                    {index > 0 && <div className="h-px bg-divider" />}
                    <SubscriptionRow
                      subscription={sub}
                      onClick={() => onSubscriptionClick(sub.id)}
                    />
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* All Good Section — collapsed to 3 with "Show all" */}
        {allGood.length > 0 && (
          <div className="flex flex-col gap-3">
            <SectionHeader title={t("dashboard.allGood")} count={allGood.length} variant="success" />
            <div className="flex">
              <div className="w-1 bg-primary" aria-hidden="true" />
              <Card padding="none" className="flex-1 overflow-hidden rounded-l-none">
                {visibleAllGood.map((sub, index) => (
                  <div key={sub.id}>
                    {index > 0 && <div className="h-px bg-divider" />}
                    <SubscriptionRow
                      subscription={sub}
                      onClick={() => onSubscriptionClick(sub.id)}
                    />
                  </div>
                ))}
                {hasMoreAllGood && (
                  <>
                    <div className="h-px bg-divider" />
                    <button
                      onClick={() => setShowAllGood(!showAllGood)}
                      className="flex w-full items-center justify-center gap-1.5 py-3 text-sm font-medium text-primary hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    >
                      {showAllGood ? (
                        <>{t("dashboard.showLess")} <ChevronUp className="h-4 w-4" aria-hidden="true" /></>
                      ) : (
                        <>{t("dashboard.showAll", { count: allGood.length })} <ChevronDown className="h-4 w-4" aria-hidden="true" /></>
                      )}
                    </button>
                  </>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Cancelled Section */}
        {cancelled.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("dashboard.cancelled")} ({cancelled.length})
              </h2>
            </div>
            <Card padding="none" className="overflow-hidden">
              {cancelled.map((sub, index) => (
                <div key={sub.id}>
                  {index > 0 && <div className="h-px bg-divider" />}
                  <SubscriptionRow
                    subscription={sub}
                    onClick={() => onSubscriptionClick(sub.id)}
                  />
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      {/* Fixed Add Button - positioned above TabBar */}
      <div className="fixed bottom-[84px] left-0 right-0 bg-background pt-2 pb-4">
        <div className="mx-auto w-full max-w-3xl px-6">
          <Button
            variant="primary"
            icon={<Plus className="h-[18px] w-[18px]" />}
            onClick={onAddSubscription}
            className="w-full"
          >
            {t("dashboard.addSubscription")}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
