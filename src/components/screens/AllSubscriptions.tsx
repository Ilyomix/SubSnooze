"use client"

import { useState } from "react"
import { Search, ChevronRight, XCircle } from "lucide-react"
import { AppShell } from "@/components/layout"
import { Card, Badge } from "@/components/ui"
import type { Subscription } from "@/types/subscription"
import { cn } from "@/lib/utils"

interface AllSubscriptionsProps {
  subscriptions: Subscription[]
  onSubscriptionClick: (id: string) => void
  onSearch: (query: string) => void
  activeTab: "home" | "subs" | "settings"
  onTabChange: (tab: "home" | "subs" | "settings") => void
}

function getDaysUntilRenewal(date: Date): number {
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function SubscriptionItem({
  sub,
  onClick
}: {
  sub: Subscription
  onClick: () => void
}) {
  const daysUntil = getDaysUntilRenewal(sub.renewalDate)
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
      <div className="flex items-center gap-3">
        {/* Logo - squircle style */}
        <div
          className="flex h-10 w-10 items-center justify-center text-sm font-bold text-white"
          style={{
            backgroundColor: sub.logoColor,
            borderRadius: 9, // ~22% of 40px for squircle
          }}
        >
          {sub.logo}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-0.5">
          <span className={cn(
            "font-semibold text-text-primary",
            isCancelled && "line-through"
          )}>
            {sub.name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-tertiary">
              {isCancelled
                ? "Cancelled"
                : `Renews ${sub.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              }
            </span>
            {!isCancelled && (
              <Badge variant={isRenewingSoon ? "warning" : "success"}>
                {isRenewingSoon ? `${daysUntil} days` : "OK"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-semibold text-text-primary",
          isCancelled && "line-through"
        )}>
          ${sub.price.toFixed(2)}/mo
        </span>
        <ChevronRight className="h-[18px] w-[18px] text-text-muted" />
      </div>
    </button>
  )
}

export function AllSubscriptions({
  subscriptions,
  onSubscriptionClick,
  onSearch,
  activeTab,
  onTabChange,
}: AllSubscriptionsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter subscriptions by search term
  const filterBySearch = (subs: Subscription[]) =>
    subs.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const allActive = subscriptions.filter((s) => s.status !== "cancelled")
  const allCancelled = subscriptions.filter((s) => s.status === "cancelled")

  const active = filterBySearch(allActive)
  const cancelled = filterBySearch(allCancelled)

  // Only count active subscriptions in monthly total (unfiltered)
  const totalMonthly = allActive.reduce((sum, s) => {
    if (s.billingCycle === "yearly") return sum + s.price / 12
    if (s.billingCycle === "weekly") return sum + s.price * 4.33
    return sum + s.price
  }, 0)

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange}>
      <div className="flex flex-col gap-5 px-6 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text-primary">Your Subscriptions</h1>
          <span className="text-lg font-bold text-primary">${totalMonthly.toFixed(0)}/mo</span>
        </div>

        {/* Search Bar */}
        <div className="flex h-12 items-center gap-3 rounded-xl bg-surface px-4">
          <Search className="h-[18px] w-[18px] text-text-tertiary" />
          <input
            type="text"
            name="subscription-search"
            placeholder="Search subscriptions…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              onSearch(e.target.value)
            }}
            className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary focus-visible:outline-none"
          />
        </div>

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
              <XCircle className="h-4 w-4 text-text-muted" />
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
                  />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Empty State */}
        {subscriptions.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16">
            <span className="text-text-secondary">No subscriptions yet</span>
          </div>
        )}

        {/* No Search Results */}
        {subscriptions.length > 0 && active.length === 0 && cancelled.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16">
            <span className="text-text-secondary">No subscriptions matching "{searchTerm}"</span>
          </div>
        )}
      </div>
    </AppShell>
  )
}
