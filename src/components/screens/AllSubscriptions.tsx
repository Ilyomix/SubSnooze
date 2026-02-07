"use client"

import { useState } from "react"
import { Search, ChevronRight, XCircle, ArrowDownWideNarrow, Plus } from "lucide-react"
import { AppShell } from "@/components/layout"
import { Card, Badge, ServiceIcon, ErrorState } from "@/components/ui"
import type { Subscription } from "@/types/subscription"
import type { BillingCycle } from "@/types/database"
import { daysUntilRenewal, toMonthlyPrice } from "@/lib/date-utils"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

type PriceView = "monthly" | "yearly"
type SortBy = "name" | "price" | "date"

function getInitialPriceView(): PriceView {
  if (typeof window === "undefined") return "monthly"
  const stored = localStorage.getItem("subsnooze:priceView")
  return stored === "yearly" ? "yearly" : "monthly"
}

function displayPrice(price: number, billingCycle: BillingCycle, view: PriceView): number {
  const monthly = toMonthlyPrice(price, billingCycle)
  return view === "yearly" ? monthly * 12 : monthly
}

interface AllSubscriptionsProps {
  subscriptions: Subscription[]
  onSubscriptionClick: (id: string) => void
  onSearch: (query: string) => void
  onAddSubscription?: () => void
  activeTab: "home" | "subs" | "settings"
  onTabChange: (tab: "home" | "subs" | "settings") => void
  onNotificationClick?: () => void
  notificationCount?: number
  error?: Error | null
  onRetry?: () => void
}

function SubscriptionItem({
  sub,
  onClick,
  priceView,
}: {
  sub: Subscription
  onClick: () => void
  priceView: PriceView
}) {
  const { t, formatCurrency, formatDate } = useI18n()
  const daysUntil = daysUntilRenewal(sub.renewalDate)
  const isRenewingSoon = sub.status === "renewing_soon"
  const isCancelled = sub.status === "cancelled"

  return (
    <button
      onClick={onClick}
      aria-label={`Manage ${sub.name} subscription`}
      className={cn(
        "flex w-full items-center justify-between p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        isCancelled && "opacity-60"
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo - squircle style */}
        <ServiceIcon
          name={sub.name}
          logoColor={sub.logoColor}
          logoUrl={sub.logo?.startsWith("http") ? sub.logo : undefined}
          size={40}
        />

        {/* Info */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={cn(
            "font-semibold text-text-primary truncate",
            isCancelled && "line-through"
          )}>
            {sub.name}
          </span>
          <span className="text-sm text-text-tertiary truncate">
            {isCancelled
              ? t("allSubscriptions.cancelledWasDue", { date: formatDate(sub.renewalDate, "short") })
              : t("allSubscriptions.nextRenewal", { date: formatDate(sub.renewalDate, "short") })
            }
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
        {!isCancelled && isRenewingSoon && (
          <Badge variant="warning">
            {daysUntil <= 0 ? t("allSubscriptions.renewsToday") : daysUntil === 1 ? t("allSubscriptions.renewsTomorrow") : t("allSubscriptions.renewsInDays", { days: daysUntil })}
          </Badge>
        )}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-semibold tabular-nums text-text-primary",
            isCancelled && "line-through"
          )}>
            {formatCurrency(displayPrice(sub.price, sub.billingCycle, priceView))}/{priceView === "yearly" ? t("allSubscriptions.yr") : t("allSubscriptions.mo")}
          </span>
          <ChevronRight className="h-[18px] w-[18px] text-text-muted" aria-hidden="true" />
        </div>
      </div>
    </button>
  )
}

export function AllSubscriptions({
  subscriptions,
  onSubscriptionClick,
  onSearch,
  onAddSubscription,
  activeTab,
  onTabChange,
  onNotificationClick,
  notificationCount,
  error,
  onRetry,
}: AllSubscriptionsProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const [searchTerm, setSearchTerm] = useState("")
  const [priceView, setPriceView] = useState<PriceView>(getInitialPriceView)
  const [sortBy, setSortBy] = useState<SortBy>("date")

  const sortLabel = sortBy === "date" ? t("allSubscriptions.sortDueSoon") : sortBy === "price" ? t("allSubscriptions.sortHighestCost") : t("allSubscriptions.sortAZ")
  const nextSortBy: SortBy = sortBy === "date" ? "price" : sortBy === "price" ? "name" : "date"
  const nextSortLabel = nextSortBy === "date" ? t("allSubscriptions.sortDueSoon") : nextSortBy === "price" ? t("allSubscriptions.sortHighestCost") : t("allSubscriptions.sortAZ")

  const togglePriceView = (view: PriceView) => {
    setPriceView(view)
    localStorage.setItem("subsnooze:priceView", view)
  }

  const cycleSortBy = () => {
    setSortBy((prev) => prev === "date" ? "price" : prev === "price" ? "name" : "date")
  }

  // Sort subscriptions
  const sortSubs = (subs: Subscription[]) => {
    return [...subs].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "price") {
        const aMonthly = displayPrice(a.price, a.billingCycle, "monthly")
        const bMonthly = displayPrice(b.price, b.billingCycle, "monthly")
        if (bMonthly !== aMonthly) return bMonthly - aMonthly
        return a.name.localeCompare(b.name)
      }

      // Default: sort by urgency (renewing soon first), then soonest renewal
      if (a.status === "cancelled" && b.status === "cancelled") {
        const byDate = b.renewalDate.getTime() - a.renewalDate.getTime()
        if (byDate !== 0) return byDate
        return a.name.localeCompare(b.name)
      }

      const aRank = a.status === "renewing_soon" ? 0 : 1
      const bRank = b.status === "renewing_soon" ? 0 : 1
      if (aRank !== bRank) return aRank - bRank

      const aDays = daysUntilRenewal(a.renewalDate)
      const bDays = daysUntilRenewal(b.renewalDate)
      if (aDays !== bDays) return aDays - bDays

      return a.name.localeCompare(b.name)
    })
  }

  // Filter subscriptions by search term
  const filterBySearch = (subs: Subscription[]) =>
    subs.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const allActive = subscriptions.filter((s) => s.status !== "cancelled")
  const allCancelled = subscriptions.filter((s) => s.status === "cancelled")

  const active = sortSubs(filterBySearch(allActive))
  const cancelled = sortSubs(filterBySearch(allCancelled))

  // Calculate total in the selected view
  const totalNormalized = allActive.reduce((sum, s) => {
    return sum + toMonthlyPrice(s.price, s.billingCycle)
  }, 0)
  const totalDisplay = priceView === "yearly" ? totalNormalized * 12 : totalNormalized

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange} onNotificationClick={onNotificationClick} notificationCount={notificationCount}>
      <div className="flex flex-col gap-5 px-6 pt-4">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-text-primary">{t("allSubscriptions.title")}</h1>
            <div className="flex rounded-full bg-surface p-0.5" role="radiogroup" aria-label="Price view">
              <button
                role="radio"
                aria-checked={priceView === "monthly"}
                onClick={() => togglePriceView("monthly")}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                  priceView === "monthly"
                    ? "bg-primary text-white"
                    : "text-text-secondary"
                )}
              >
                {t("allSubscriptions.mo")}
              </button>
              <button
                role="radio"
                aria-checked={priceView === "yearly"}
                onClick={() => togglePriceView("yearly")}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                  priceView === "yearly"
                    ? "bg-primary text-white"
                    : "text-text-secondary"
                )}
              >
                {t("allSubscriptions.yr")}
              </button>
            </div>
          </div>
          {/* Total amount — prominent on its own line */}
          {allActive.length > 0 && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums text-primary sm:text-3xl">
                {formatCurrency(totalDisplay, { whole: true })}
              </span>
              <span className="text-sm font-medium text-text-tertiary">
                {priceView === "yearly" ? t("allSubscriptions.perYear") : t("allSubscriptions.perMonth")} {t("allSubscriptions.across", { count: allActive.length })}
              </span>
            </div>
          )}
        </div>

        {/* Search Bar + Sort */}
        <div className="flex gap-2">
          <div className="flex h-12 flex-1 items-center gap-3 rounded-xl bg-surface px-4">
            <Search className="h-[18px] w-[18px] text-text-tertiary" aria-hidden="true" />
            <input
              type="text"
              name="subscription-search"
              aria-label="Search subscriptions"
              placeholder={t("allSubscriptions.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                onSearch(e.target.value)
              }}
              className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary focus-visible:outline-none"
            />
          </div>
          <button
            onClick={cycleSortBy}
            aria-label={`Sort: ${sortLabel}. Tap to switch to ${nextSortLabel}.`}
            className="flex h-12 items-center gap-1.5 rounded-xl bg-surface px-3 text-text-secondary hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowDownWideNarrow className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-semibold">{sortLabel}</span>
          </button>
        </div>

        {/* Error State */}
        {error && subscriptions.length === 0 && (
          <ErrorState onRetry={onRetry} />
        )}

        {/* Active Subscriptions */}
        {active.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {t("allSubscriptions.active")} ({active.length})
            </h2>
            <div className="flex">
              <div className="w-1 bg-primary" aria-hidden="true" />
              <Card padding="none" className="flex-1 overflow-hidden rounded-l-none">
                {active.map((sub, index) => (
                  <div key={sub.id}>
                    {index > 0 && <div className="h-px bg-divider" />}
                    <SubscriptionItem
                      sub={sub}
                      onClick={() => onSubscriptionClick(sub.id)}
                      priceView={priceView}
                    />
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* Cancelled Subscriptions */}
        {cancelled.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("allSubscriptions.cancelled")} ({cancelled.length})
              </h2>
            </div>
            <div className="flex">
              <div className="w-1 bg-divider" aria-hidden="true" />
              <Card padding="none" className="flex-1 overflow-hidden rounded-l-none">
                {cancelled.map((sub, index) => (
                  <div key={sub.id}>
                    {index > 0 && <div className="h-px bg-divider" />}
                    <SubscriptionItem
                      sub={sub}
                      onClick={() => onSubscriptionClick(sub.id)}
                      priceView={priceView}
                    />
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {/* Empty State */}
        {subscriptions.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-semibold text-text-primary">{t("allSubscriptions.noSubscriptions")}</span>
              <span className="text-sm text-text-tertiary text-center max-w-[240px]">
                {t("allSubscriptions.noSubscriptionsHint")}
              </span>
            </div>
            {onAddSubscription && (
              <button
                onClick={onAddSubscription}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("dashboard.addSubscription")}
              </button>
            )}
          </div>
        )}

        {/* No Search Results */}
        {subscriptions.length > 0 && active.length === 0 && cancelled.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16" role="status" aria-live="polite">
            <span className="text-text-secondary">{t("allSubscriptions.noResults", { query: searchTerm })}</span>
          </div>
        )}
      </div>
    </AppShell>
  )
}
