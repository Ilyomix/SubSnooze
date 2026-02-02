import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { Badge } from "./Badge"
import type { Subscription } from "@/types/subscription"

interface SubscriptionRowProps {
  subscription: Subscription
  onClick?: () => void
}

function getDaysUntilRenewal(date: Date): number {
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function SubscriptionRow({ subscription, onClick }: SubscriptionRowProps) {
  const isRenewingSoon = subscription.status === "renewing_soon"
  const accentColor = isRenewingSoon ? "bg-accent" : "bg-primary"
  const daysUntil = getDaysUntilRenewal(subscription.renewalDate)

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center text-left transition-colors hover:bg-background/50"
    >
      {/* Accent bar */}
      <div className={cn("h-full w-1 self-stretch", accentColor)} />

      {/* Content */}
      <div className="flex flex-1 items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="flex h-11 w-11 items-center justify-center rounded-[10px] text-lg font-bold text-white"
            style={{ backgroundColor: subscription.logoColor }}
          >
            {subscription.logo}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-text-primary">{subscription.name}</span>
            <span className="text-sm text-text-tertiary">
              Renews {subscription.renewalDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isRenewingSoon && (
            <Badge variant="warning">in {daysUntil} days</Badge>
          )}
          <span className="font-semibold text-text-primary">
            ${subscription.price.toFixed(2)}
          </span>
          <ChevronRight className="h-5 w-5 text-text-muted" />
        </div>
      </div>
    </button>
  )
}
