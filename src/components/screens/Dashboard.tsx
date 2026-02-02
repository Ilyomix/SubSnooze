"use client"

import { PiggyBank, Plus } from "lucide-react"
import { TabBar, Header } from "@/components/layout"
import { Card, Button, SectionHeader, SubscriptionRow } from "@/components/ui"
import type { Subscription } from "@/types/subscription"

interface DashboardProps {
  userName: string
  totalSaved: number
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
  subscriptions,
  onAddSubscription,
  onSubscriptionClick,
  onNotificationClick,
  notificationCount,
  activeTab,
  onTabChange,
}: DashboardProps) {
  const renewingSoon = subscriptions.filter((s) => s.status === "renewing_soon")
  const allGood = subscriptions.filter((s) => s.status === "good")

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[84px] pt-12">
      <div className="flex flex-1 flex-col gap-6 px-6">
        <Header
          greeting={`Hi, ${userName}`}
          showNotification
          onNotificationClick={onNotificationClick}
          notificationCount={notificationCount}
        />

        {/* Money Saved Card */}
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            <span className="text-[15px] font-medium text-text-secondary">You've saved</span>
          </div>
          <span className="text-5xl font-bold tracking-tight text-primary">
            ${totalSaved}
          </span>
          <span className="text-sm text-text-secondary">
            this year by canceling unused subscriptions
          </span>
        </Card>

        {/* Renewing Soon Section */}
        {renewingSoon.length > 0 && (
          <div className="flex flex-col gap-3">
            <SectionHeader title="RENEWING SOON" count={renewingSoon.length} variant="warning" />
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

        {/* All Good Section */}
        {allGood.length > 0 && (
          <div className="flex flex-col gap-3">
            <SectionHeader title="ALL GOOD" count={allGood.length} variant="success" />
            <Card padding="none" className="overflow-hidden">
              {allGood.map((sub, index) => (
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

        {/* Add Button */}
        <Button
          variant="primary"
          icon={<Plus className="h-[18px] w-[18px]" />}
          onClick={onAddSubscription}
          className="w-full"
        >
          Add subscription
        </Button>
      </div>

      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
