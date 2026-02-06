"use client"

import { useState } from "react"
import { Search, ChevronRight, XCircle, ArrowUpDown } from "lucide-react"
import { AppShell } from "@/components/layout"
import { Card, Badge, ServiceIcon, ErrorState } from "@/components/ui"
import type { Subscription } from "@/types/subscription"
import type { BillingCycle } from "@/types/database"
import { daysUntilRenewal } from "@/lib/date-utils"
import { cn, formatCurrency } from "@/lib/utils"

type PriceView = "monthly" | "yearly"
type SortBy = "name" | "price" | "date"

function getInitialPriceView(): PriceView {
  if (typeof window === "undefined") return "monthly"
  const stored = localStorage.getItem("subsnooze:priceView")
  return stored === "yearly" ? "yearly" : "monthly"
}

function displayPrice(price: number, billingCycle: BillingCycle, view: PriceView): number {
  // Normalize to monthly first
  let monthly = price
  if (billingCycle === "yearly") monthly = price / 12
  else if (billingCycle === "weekly") monthly = price * 4.33

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
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-tertiary truncate">
              {isCancelled
                ? `Cancelled \u00B7 Was due ${sub.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : `Next renewal \u00B7 ${sub.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              }
            </span>
            {!isCancelled && isRenewingSoon && (
              <Badge variant="warning">
                {daysUntil <= 0 ? "Renews today" : daysUntil === 1 ? "Renews tomorrow" : `Renews in ${daysUntil} days`}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn(
          "text-sm font-semibold tabular-nums text-text-primary",
          isCancelled && "line-through"
        )}>
          {formatCurrency(displayPrice(sub.price, sub.billingCycle, priceView))}/{priceView === "yearly" ? "yr" : "mo"}
        </span>
        <ChevronRight className="h-[18px] w-[18px] text-text-muted" aria-hidden="true" />
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
  const [searchTerm, setSearchTerm] = useState("")
  const [priceView, setPriceView] = useState<PriceView>(getInitialPriceView)
  const [sortBy, setSortBy] = useState<SortBy>("date")

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
        return bMonthly - aMonthly
      }
      // Default: sort by renewal date (soonest first)
      return a.renewalDate.getTime() - b.renewalDate.getTime()
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
    // Normalize everything to monthly first
    if (s.billingCycle === "yearly") return sum + s.price / 12
    if (s.billingCycle === "weekly") return sum + s.price * 4.33
    return sum + s.price
  }, 0)
  const totalDisplay = priceView === "yearly" ? totalNormalized * 12 : totalNormalized

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange} onNotificationClick={onNotificationClick} notificationCount={notificationCount}>
      <div className="flex flex-col gap-5 px-6 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text-primary">Your Subscriptions</h1>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tabular-nums text-primary">
              {formatCurrency(totalDisplay, true)}/{priceView === "yearly" ? "yr" : "mo"}
            </span>
            <div className="flex rounded-full bg-surface p-0.5" role="radiogroup" aria-label="Price view">
              <button
                role="radio"
                aria-checked={priceView === "monthly"}
                onClick={() => togglePriceView("monthly")}
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-semibold transition-colors",
                  priceView === "monthly"
                    ? "bg-primary text-white"
                    : "text-text-secondary"
                )}
              >
                mo
              </button>
              <button
                role="radio"
                aria-checked={priceView === "yearly"}
                onClick={() => togglePriceView("yearly")}
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-semibold transition-colors",
                  priceView === "yearly"
                    ? "bg-primary text-white"
                    : "text-text-secondary"
                )}
              >
                yr
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar + Sort */}
        <div className="flex gap-2">
          <div className="flex h-12 flex-1 items-center gap-3 rounded-xl bg-surface px-4">
            <Search className="h-[18px] w-[18px] text-text-tertiary" aria-hidden="true" />
            <input
              type="text"
              name="subscription-search"
              aria-label="Search subscriptions"
              placeholder="Search subscriptions…"
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
            aria-label={`Sort by ${sortBy === "date" ? "price" : sortBy === "price" ? "name" : "date"}`}
            className="flex h-12 items-center gap-1.5 rounded-xl bg-surface px-3 text-text-secondary hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-semibold capitalize">{sortBy}</span>
          </button>
        </div>

        {/* Error State */}
        {error && subscriptions.length === 0 && (
          <ErrorState onRetry={onRetry} />
        )}

        {/* Active Subscriptions */}
        {active.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Active ({active.length})
            </span>
            <Card padding="none" className="overflow-hidden">
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
        )}

        {/* Cancelled Subscriptions */}
        {cancelled.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-text-muted" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Cancelled ({cancelled.length})
              </span>
            </div>
            <Card padding="none" className="overflow-hidden">
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
        )}

        {/* Empty State */}
        {subscriptions.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-semibold text-text-primary">No subscriptions yet</span>
              <span className="text-sm text-text-tertiary text-center max-w-[240px]">
                Track your first subscription to see it here.
              </span>
            </div>
            {onAddSubscription && (
              <button
                onClick={onAddSubscription}
                className="text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
              >
                Add subscription
              </button>
            )}
          </div>
        )}

        {/* No Search Results */}
        {subscriptions.length > 0 && active.length === 0 && cancelled.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16">
            <span className="text-text-secondary">No subscriptions matching {"\u201C"}{searchTerm}{"\u201D"}</span>
          </div>
        )}
      </div>
    </AppShell>
  )
}
