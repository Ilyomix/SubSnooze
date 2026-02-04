import { cn } from "@/lib/utils"
import { ChevronRight, Bell } from "lucide-react"
import { Badge } from "./Badge"
import type { Subscription } from "@/types/subscription"
import { daysUntilRenewal } from "@/types/subscription"

interface SubscriptionRowProps {
  subscription: Subscription
  onClick?: () => void
  showReminderStage?: boolean
}

function getReminderBadge(daysUntil: number) {
  // Show urgency badge based on days until renewal
  if (daysUntil <= 0) {
    return (
      <Badge variant="urgent">
        <Bell className="h-3 w-3" />
        Today!
      </Badge>
    )
  }

  if (daysUntil === 1) {
    return (
      <Badge variant="urgent">
        <Bell className="h-3 w-3" />
        Tomorrow!
      </Badge>
    )
  }

  if (daysUntil <= 3) {
    return (
      <Badge variant="warning">
        <Bell className="h-3 w-3" />
        {daysUntil} days
      </Badge>
    )
  }

  if (daysUntil <= 7) {
    return (
      <Badge variant="reminder">
        <Bell className="h-3 w-3" />
        {daysUntil} days
      </Badge>
    )
  }

  return null
}

export function SubscriptionRow({ subscription, onClick, showReminderStage = true }: SubscriptionRowProps) {
  const isRenewingSoon = subscription.status === "renewing_soon"
  const isCancelled = subscription.status === "cancelled"
  const daysUntil = daysUntilRenewal(subscription.renewalDate)

  // Determine accent color based on urgency
  let accentColor = "bg-primary"
  if (isCancelled) {
    accentColor = "bg-divider"
  } else if (daysUntil <= 1) {
    accentColor = "bg-accent"
  } else if (daysUntil <= 3) {
    accentColor = "bg-accent"
  } else if (isRenewingSoon) {
    accentColor = "bg-amber-500"
  }

  return (
    <button
      onClick={onClick}
      aria-label={`Manage ${subscription.name} subscription`}
      className={cn(
        "flex w-full items-center text-left motion-safe:transition-colors hover:bg-background/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg",
        isCancelled && "opacity-60"
      )}
    >
      {/* Accent bar */}
      <div className={cn("h-full w-1 self-stretch", accentColor)} />

      {/* Content */}
      <div className="flex flex-1 items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Logo - squircle style */}
          <div
            className="flex h-11 w-11 items-center justify-center text-lg font-bold text-white"
            style={{
              backgroundColor: subscription.logoColor,
              borderRadius: 10, // ~22% of 44px for squircle
            }}
          >
            {subscription.logo}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-0.5">
            <span className={cn(
              "font-semibold text-text-primary",
              isCancelled && "line-through"
            )}>
              {subscription.name}
            </span>
            <span className="text-sm text-text-tertiary">
              {isCancelled
                ? `Cancelled · Was ${subscription.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : `Renews ${subscription.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              }
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {showReminderStage && !isCancelled && getReminderBadge(daysUntil)}
          {!showReminderStage && isRenewingSoon && (
            <Badge variant="warning">
              {daysUntil <= 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `in ${daysUntil} days`}
            </Badge>
          )}
          <span className={cn(
            "font-semibold text-text-primary",
            isCancelled && "line-through"
          )}>
            ${subscription.price.toFixed(2)}
          </span>
          <ChevronRight className="h-5 w-5 text-text-muted" />
        </div>
      </div>
    </button>
  )
}
