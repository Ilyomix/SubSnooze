"use client"

import { useState } from "react"
import { Plus, XCircle, PiggyBank, CreditCard, ChevronDown, ChevronUp } from "lucide-react"
import NumberFlow from "@number-flow/react"
import { AppShell } from "@/components/layout"
import { Card, Button, SectionHeader, SubscriptionRow } from "@/components/ui"
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
}: DashboardProps) {
  const [showAllGood, setShowAllGood] = useState(false)

  const renewingSoon = subscriptions
    .filter((s) => s.status === "renewing_soon")
    .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime())
  const allGood = subscriptions.filter((s) => s.status === "good")
  const cancelled = subscriptions.filter((s) => s.status === "cancelled")
  const activeCount = subscriptions.filter((s) => s.status !== "cancelled").length

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
          Hi, {userName}
        </h1>

        {/* Summary Cards */}
        <div className="flex gap-3">
          {/* Money Saved — primary card */}
          <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-primary p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <PiggyBank className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <NumberFlow
              value={totalSaved}
              format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
              className="text-3xl font-bold tabular-nums text-white"
            />
            <span className="text-xs font-medium text-white/70">
              {cancelled.length > 0
                ? `Saved — nice work`
                : "Saved this year"}
            </span>
          </div>

          {/* Monthly Spend */}
          <div className="flex flex-1 flex-col gap-2 rounded-2xl bg-text-primary p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <CreditCard className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <NumberFlow
              value={totalMonthly}
              format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
              className="text-3xl font-bold tabular-nums text-white"
            />
            <span className="text-xs font-medium text-white/60">
              {activeCount} active {activeCount === 1 ? "sub" : "subs"}/mo
            </span>
          </div>
        </div>

        {/* Renewing Soon Section — always fully expanded, sorted by urgency */}
        {renewingSoon.length > 0 && (
          <div className="flex flex-col gap-3">
            <SectionHeader title="COMING UP" count={renewingSoon.length} variant="warning" />
            <Card padding="none" className="overflow-hidden">
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
        )}

        {/* All Good Section — collapsed to 3 with "Show all" */}
        {allGood.length > 0 && (
          <div className="flex flex-col gap-3">
            <SectionHeader title="ALL GOOD" count={allGood.length} variant="success" />
            <Card padding="none" className="overflow-hidden">
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
                      <>Show less <ChevronUp className="h-4 w-4" aria-hidden="true" /></>
                    ) : (
                      <>Show all {allGood.length} <ChevronDown className="h-4 w-4" aria-hidden="true" /></>
                    )}
                  </button>
                </>
              )}
            </Card>
          </div>
        )}

        {/* Cancelled Section */}
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
      <div className="fixed bottom-[84px] left-0 right-0 bg-background px-6 pb-4 pt-2">
        <Button
          variant="primary"
          icon={<Plus className="h-[18px] w-[18px]" />}
          onClick={onAddSubscription}
          className="w-full"
        >
          Add subscription
        </Button>
      </div>
    </AppShell>
  )
}
