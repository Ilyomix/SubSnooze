import { cn } from "@/lib/utils"
import { ArrowLeft, Bell } from "lucide-react"
import { type ReactNode } from "react"
import NumberFlow from "@number-flow/react"

interface HeaderProps {
  title?: string
  greeting?: string
  showBack?: boolean
  onBack?: () => void
  showNotification?: boolean
  onNotificationClick?: () => void
  notificationCount?: number
  children?: ReactNode
  className?: string
}

export function Header({
  title,
  greeting,
  showBack,
  onBack,
  showNotification,
  onNotificationClick,
  notificationCount = 0,
  children,
  className,
}: HeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-0 pt-4", className)}>
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5 text-text-primary" />
          </button>
        )}

        {greeting && (
          <h1 className="text-[26px] font-semibold tracking-tight text-text-primary">
            {greeting}
          </h1>
        )}

        {title && (
          <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        )}

        {children}
      </div>

      {showNotification && (
        <button
          onClick={onNotificationClick}
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Bell className="h-[22px] w-[22px] text-text-primary" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 motion-safe:animate-[badge-pop_220ms_ease-out]">
              <NumberFlow value={notificationCount} className="text-[11px] font-bold tabular-nums text-white" />
            </span>
          )}
        </button>
      )}
    </div>
  )
}
