"use client"

import { type ReactNode } from "react"
import { TabBar } from "./TabBar"
import { Bell } from "lucide-react"
import NumberFlow from "@number-flow/react"

interface AppShellProps {
  children: ReactNode
  activeTab: "home" | "subs" | "settings"
  onTabChange: (tab: "home" | "subs" | "settings") => void
  onNotificationClick?: () => void
  notificationCount?: number
}

export function AppShell({
  children,
  activeTab,
  onTabChange,
  onNotificationClick,
  notificationCount = 0,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>
      {/* Brand Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between bg-surface/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">SubSnooze</span>
        </div>

        {onNotificationClick && (
          <button
            onClick={onNotificationClick}
            aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Bell className="h-5 w-5 text-primary" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1">
                <NumberFlow value={notificationCount} className="text-[11px] font-bold tabular-nums text-white" />
              </span>
            )}
          </button>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 pb-[84px] pt-14">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
