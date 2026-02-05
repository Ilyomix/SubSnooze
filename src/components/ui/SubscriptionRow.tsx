import { cn, formatCurrency } from "@/lib/utils"
import { ChevronRight, Bell } from "lucide-react"
import { Badge } from "./Badge"
import { ServiceIcon } from "./ServiceIcon"
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
        <Bell className="h-3 w-3" aria-hidden="true" />
        Renews today
      </Badge>
    )
  }

  if (daysUntil === 1) {
    return (
      <Badge variant="urgent">
        <Bell className="h-3 w-3" aria-hidden="true" />
        Renews tomorrow
      </Badge>
    )
  }

  if (daysUntil <= 3) {
    return (
      <Badge variant="warning">
        <Bell className="h-3 w-3" aria-hidden="true" />
        Renews in {daysUntil} days
      </Badge>
    )
  }

  if (daysUntil <= 7) {
    return (
      <Badge variant="reminder">
        <Bell className="h-3 w-3" aria-hidden="true" />
        Renews in {daysUntil} days
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
      <div className="flex flex-1 items-center justify-between p-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo - squircle style */}
          <ServiceIcon
            name={subscription.name}
            logoColor={subscription.logoColor}
            logoUrl={subscription.logo?.startsWith("http") ? subscription.logo : undefined}
            size={44}
          />

          {/* Info */}
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className={cn(
              "font-semibold text-text-primary truncate",
              isCancelled && "line-through"
            )}>
              {subscription.name}
            </span>
            <span className="text-sm text-text-tertiary truncate">
              {isCancelled
                ? `Cancelled \u00B7 Was due ${subscription.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : `Next renewal \u00B7 ${subscription.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              }
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2">
          {showReminderStage && !isCancelled && getReminderBadge(daysUntil)}
          {!showReminderStage && isRenewingSoon && (
            <Badge variant="warning">
              {daysUntil <= 0 ? "Renews today" : daysUntil === 1 ? "Renews tomorrow" : `Renews in ${daysUntil} days`}
            </Badge>
          )}
          <span className={cn(
            "font-semibold tabular-nums text-text-primary",
            isCancelled && "line-through"
          )}>
            {formatCurrency(subscription.price)}
          </span>
          <ChevronRight className="h-5 w-5 text-text-muted" aria-hidden="true" />
        </div>
      </div>
    </button>
  )
}
