import { cn } from "@/lib/utils"
import { ArrowLeft, Bell } from "lucide-react"
import { type ReactNode } from "react"

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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface"
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
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface"
        >
          <Bell className="h-[22px] w-[22px] text-text-primary" />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>
      )}
    </div>
  )
}
