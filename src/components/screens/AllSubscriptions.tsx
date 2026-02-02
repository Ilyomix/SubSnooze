"use client"

import { Search, ChevronRight } from "lucide-react"
import { TabBar } from "@/components/layout"
import { Card, Badge } from "@/components/ui"
import type { Subscription } from "@/types/subscription"

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

export function AllSubscriptions({
  subscriptions,
  onSubscriptionClick,
  onSearch,
  activeTab,
  onTabChange,
}: AllSubscriptionsProps) {
  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.price, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[84px] pt-12">
      <div className="flex flex-1 flex-col gap-5 px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-semibold tracking-tight text-text-primary">Your Subscriptions</h1>
          <span className="text-[18px] font-bold text-primary">${totalMonthly.toFixed(0)}/mo</span>
        </div>

        {/* Search Bar */}
        <div className="flex h-12 items-center gap-3 rounded-xl bg-surface px-4">
          <Search className="h-[18px] w-[18px] text-text-tertiary" />
          <input
            type="text"
            placeholder="Search subscriptions"
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
        </div>

        {/* Subscriptions List */}
        <Card padding="none" className="overflow-hidden">
          {subscriptions.map((sub, index) => {
            const daysUntil = getDaysUntilRenewal(sub.renewalDate)
            const isRenewingSoon = sub.status === "renewing_soon"

            return (
              <div key={sub.id}>
                {index > 0 && <div className="h-px bg-divider" />}
                <button
                  onClick={() => onSubscriptionClick(sub.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  {/* Left side */}
                  <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[10px] text-sm font-bold text-white"
                      style={{ backgroundColor: sub.logoColor }}
                    >
                      {sub.logo}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-text-primary">{sub.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-tertiary">
                          Renews {sub.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <Badge variant={isRenewingSoon ? "warning" : "success"}>
                          {isRenewingSoon ? `${daysUntil} days` : "OK"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      ${sub.price.toFixed(2)}/mo
                    </span>
                    <ChevronRight className="h-[18px] w-[18px] text-text-muted" />
                  </div>
                </button>
              </div>
            )
          })}
        </Card>
      </div>

      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
