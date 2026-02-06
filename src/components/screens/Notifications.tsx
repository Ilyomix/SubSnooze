"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Flame, Check, Info, HelpCircle, Bell, Trash2, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DetailShell } from "@/components/layout"
import { Card, Button } from "@/components/ui"
import type { Notification } from "@/types/subscription"

interface NotificationsProps {
  notifications: Notification[]
  onBack: () => void
  onNotificationClick: (id: string) => void
  onVerifyCancellation?: (subscriptionId: string) => void
  onRemindAgain?: (subscriptionId: string) => void
  onDelete?: (id: string) => void
  onDeleteAll?: () => void
  onMarkAsUnread?: (id: string) => void
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
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

const SWIPE_THRESHOLD_SINGLE = 80
const SWIPE_THRESHOLD_DOUBLE = 140

interface NotificationItemProps {
  notification: Notification
  onClick: () => void
  onVerifyCancellation?: (subscriptionId: string) => void
  onRemindAgain?: (subscriptionId: string) => void
  onDelete?: (id: string) => void
  onMarkAsUnread?: (id: string) => void
  isRead: boolean
}

function NotificationItem({
  notification,
  onClick,
  onVerifyCancellation,
  onRemindAgain,
  onDelete,
  onMarkAsUnread,
  isRead,
}: NotificationItemProps) {
  const isCancelFollowup = notification.type === "cancel_followup"
  const subscriptionId = notification.subscriptionId

  const hasDoubleActions = isRead && !!onMarkAsUnread && !!onDelete
  const threshold = hasDoubleActions ? SWIPE_THRESHOLD_DOUBLE : SWIPE_THRESHOLD_SINGLE

  const [offsetX, setOffsetX] = useState(0)
  const [swiped, setSwiped] = useState(false)
  const [animating, setAnimating] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const isHorizontal = useRef<boolean | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isDragging.current = true
    isHorizontal.current = null
    setAnimating(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return

    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy)
      }
      return
    }

    if (!isHorizontal.current) return

    const newOffset = swiped ? dx - threshold : dx
    const clamped = Math.max(Math.min(newOffset, 0), -threshold - 20)
    setOffsetX(Math.round(clamped))
  }, [swiped, threshold])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
    isHorizontal.current = null
    setAnimating(true)

    if (offsetX < -threshold / 2) {
      setOffsetX(-threshold)
      setSwiped(true)
    } else {
      setOffsetX(0)
      setSwiped(false)
    }
  }, [offsetX, threshold])

  const handleClick = () => {
    if (swiped) {
      setOffsetX(0)
      setSwiped(false)
      return
    }
    onClick()
  }

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
    <div className="relative overflow-hidden">
      {/* Swipe actions revealed behind */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-evenly bg-surface"
        style={{ width: hasDoubleActions ? SWIPE_THRESHOLD_DOUBLE : SWIPE_THRESHOLD_SINGLE }}
      >
        {hasDoubleActions ? (
          <>
            <button
              onClick={() => onMarkAsUnread(notification.id)}
              aria-label="Mark as unread"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15"
            >
              <Mail className="h-[18px] w-[18px] text-primary" />
            </button>
            <button
              onClick={() => onDelete(notification.id)}
              aria-label="Delete notification"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15"
            >
              <Trash2 className="h-[18px] w-[18px] text-accent" />
            </button>
          </>
        ) : (
          <button
            onClick={() => onDelete?.(notification.id)}
            aria-label="Delete notification"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15"
          >
            <Trash2 className="h-[18px] w-[18px] text-accent" />
          </button>
        )}
      </div>

      {/* Foreground content — fully opaque to hide swipe actions */}
      <div
        className="relative"
        style={{
          transform: `translate3d(${offsetX}px, 0, 0)`,
          transition: animating ? "transform 0.25s ease-out" : "none",
          willChange: "transform",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full bg-surface">
          <button
            onClick={handleClick}
            className={`flex w-full items-start gap-3 p-4 text-left ${isRead ? "opacity-60" : ""}`}
          >
            {/* Unread dot — left edge */}
            {
              !isRead &&
              <div className="flex w-2 shrink-0 items-start pt-2.5">
                {!isRead && <div className="h-2 w-2 rounded-full bg-accent" />}
              </div>
            }

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
                {formatDistanceToNow(notification.date, { addSuffix: true })}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export function Notifications({
  notifications,
  onBack,
  onNotificationClick,
  onVerifyCancellation,
  onRemindAgain,
  onDelete,
  onDeleteAll,
  onMarkAsUnread,
  hasMore,
  loadingMore,
  onLoadMore,
}: NotificationsProps) {
  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!hasMore || !onLoadMore) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          onLoadMore()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore])

  return (
    <DetailShell
      title="Notifications"
      onBack={onBack}
      headerRight={(
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Bell className="h-4 w-4 text-primary" />
        </div>
      )}
      headerActions={
        notifications.length > 0 && onDeleteAll ? (
          <button
            onClick={onDeleteAll}
            className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Trash2 className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-accent">Clear all</span>
          </button>
        ) : undefined
      }
    >
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
                    onDelete={onDelete}
                    onMarkAsUnread={onMarkAsUnread}
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
                    onDelete={onDelete}
                    onMarkAsUnread={onMarkAsUnread}
                    isRead={true}
                  />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Infinite scroll sentinel + loading */}
        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-4">
            {loadingMore && (
              <div className="h-6 w-6 motion-safe:animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
          </div>
        )}

        {notifications.length === 0 && !loadingMore && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <span className="text-lg font-semibold text-text-primary">All caught up!</span>
            <span className="text-sm text-text-tertiary text-center max-w-[240px]">
              No notifications right now. We&apos;ll nudge you before any renewals.
            </span>
          </div>
        )}
      </div>
    </DetailShell>
  )
}
