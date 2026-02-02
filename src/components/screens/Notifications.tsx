"use client"

import { Flame, Check, Info } from "lucide-react"
import { Header } from "@/components/layout"
import { Card } from "@/components/ui"
import type { Notification } from "@/types/subscription"

interface NotificationsProps {
  notifications: Notification[]
  onBack: () => void
  onNotificationClick: (id: string) => void
}

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "warning":
      return <Flame className="h-5 w-5 text-accent" />
    case "success":
      return <Check className="h-5 w-5 text-primary" />
    default:
      return <Info className="h-5 w-5 text-text-secondary" />
  }
}

export function Notifications({
  notifications,
  onBack,
  onNotificationClick,
}: NotificationsProps) {
  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  return (
    <div className="flex min-h-screen flex-col bg-background pt-12">
      <div className="flex flex-col gap-6 px-6">
        <Header title="Notifications" showBack onBack={onBack} />

        {/* Unread */}
        {unread.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">
              New ({unread.length})
            </span>
            <Card padding="none" className="overflow-hidden">
              {unread.map((notification, index) => (
                <div key={notification.id}>
                  {index > 0 && <div className="h-px bg-divider" />}
                  <button
                    onClick={() => onNotificationClick(notification.id)}
                    className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-background/50"
                  >
                    <div className="mt-0.5">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="font-semibold text-text-primary">
                        {notification.title}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {notification.message}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {notification.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                  </button>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Read */}
        {read.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">
              Earlier
            </span>
            <Card padding="none" className="overflow-hidden">
              {read.map((notification, index) => (
                <div key={notification.id}>
                  {index > 0 && <div className="h-px bg-divider" />}
                  <button
                    onClick={() => onNotificationClick(notification.id)}
                    className="flex w-full items-start gap-3 p-4 text-left opacity-60 transition-colors hover:bg-background/50"
                  >
                    <div className="mt-0.5">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="font-medium text-text-primary">
                        {notification.title}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {notification.message}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {notification.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </Card>
          </div>
        )}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16">
            <Check className="h-12 w-12 text-text-muted" />
            <span className="text-text-secondary">All caught up!</span>
          </div>
        )}
      </div>
    </div>
  )
}
