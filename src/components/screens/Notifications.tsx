"use client"

import { Flame, Check, Info, HelpCircle } from "lucide-react"
import { DetailShell } from "@/components/layout"
import { Card, Button } from "@/components/ui"
import type { Notification } from "@/types/subscription"

interface NotificationsProps {
  notifications: Notification[]
  onBack: () => void
  onNotificationClick: (id: string) => void
  onVerifyCancellation?: (subscriptionId: string) => void
  onRemindAgain?: (subscriptionId: string) => void
}

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "warning":
      return <Flame className="h-5 w-5 text-accent" />
    case "success":
      return <Check className="h-5 w-5 text-primary" />
    case "cancel_followup":
      return <HelpCircle className="h-5 w-5 text-amber-600" />
    default:
      return <Info className="h-5 w-5 text-text-secondary" />
  }
}

interface NotificationItemProps {
  notification: Notification
  onClick: () => void
  onVerifyCancellation?: (subscriptionId: string) => void
  onRemindAgain?: (subscriptionId: string) => void
  isRead: boolean
}

function NotificationItem({
  notification,
  onClick,
  onVerifyCancellation,
  onRemindAgain,
  isRead,
}: NotificationItemProps) {
  const isCancelFollowup = notification.type === "cancel_followup"
  const subscriptionId = notification.subscriptionId

  const handleVerify = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (subscriptionId && onVerifyCancellation) {
      onVerifyCancellation(subscriptionId)
    }
  }

  const handleRemind = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (subscriptionId && onRemindAgain) {
      onRemindAgain(subscriptionId)
    }
  }

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 p-4 text-left motion-safe:transition-colors hover:bg-background/50 ${
        isRead ? "opacity-60" : ""
      }`}
    >
      <div className="mt-0.5">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <span className={`text-text-primary ${isRead ? "font-medium" : "font-semibold"}`}>
          {notification.title}
        </span>
        <span className="text-sm text-text-secondary">
          {notification.message}
        </span>

        {/* Cancel verification actions */}
        {isCancelFollowup && subscriptionId && !isRead && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleVerify}
            >
              Yes, I cancelled
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemind}
            >
              Remind me again
            </Button>
          </div>
        )}

        <span className="text-xs text-text-tertiary">
          {notification.date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      {!isRead && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
    </button>
  )
}

export function Notifications({
  notifications,
  onBack,
  onNotificationClick,
  onVerifyCancellation,
  onRemindAgain,
}: NotificationsProps) {
  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  return (
    <DetailShell title="Notifications" onBack={onBack}>
      <div className="flex flex-col gap-6 px-6 pt-4">

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
                  <NotificationItem
                    notification={notification}
                    onClick={() => onNotificationClick(notification.id)}
                    onVerifyCancellation={onVerifyCancellation}
                    onRemindAgain={onRemindAgain}
                    isRead={false}
                  />
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
                  <NotificationItem
                    notification={notification}
                    onClick={() => onNotificationClick(notification.id)}
                    onVerifyCancellation={onVerifyCancellation}
                    onRemindAgain={onRemindAgain}
                    isRead={true}
                  />
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
    </DetailShell>
  )
}
