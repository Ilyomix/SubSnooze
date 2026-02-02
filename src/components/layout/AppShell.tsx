"use client"

import { type ReactNode } from "react"
import { TabBar } from "./TabBar"
import { Bell } from "lucide-react"

interface AppShellProps {
  children: ReactNode
  activeTab: "home" | "subs" | "settings"
  onTabChange: (tab: "home" | "subs" | "settings") => void
  showNotification?: boolean
  onNotificationClick?: () => void
  notificationCount?: number
}

export function AppShell({
  children,
  activeTab,
  onTabChange,
  showNotification,
  onNotificationClick,
  notificationCount = 0,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Brand Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between bg-surface/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">SubSnooze</span>
        </div>

        {showNotification && (
          <button
            onClick={onNotificationClick}
            aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Bell className="h-5 w-5 text-text-primary" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            )}
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-[84px] pt-14">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
