import { Skeleton } from "@/components/ui/Skeleton"

function SubscriptionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton className="h-11 w-11 shrink-0 rounded-[10px]" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-14" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between bg-surface/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">SubSnooze</span>
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </header>

      <main className="flex-1 pb-[84px] pt-14">
        <div className="flex flex-col gap-6 px-6 pt-4 pb-40">
          {/* Greeting */}
          <Skeleton className="h-7 w-36" />

          {/* Summary Cards */}
          <div className="flex gap-3">
            <Skeleton className="h-[120px] flex-1 rounded-2xl" />
            <Skeleton className="h-[120px] flex-1 rounded-2xl" />
          </div>

          {/* Section Header */}
          <Skeleton className="h-4 w-28" />

          {/* Subscription rows */}
          <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
            <SubscriptionRowSkeleton />
            <div className="h-px bg-divider" />
            <SubscriptionRowSkeleton />
            <div className="h-px bg-divider" />
            <SubscriptionRowSkeleton />
          </div>

          {/* Second section */}
          <Skeleton className="h-4 w-20" />
          <div className="overflow-hidden rounded-2xl bg-surface shadow-card">
            <SubscriptionRowSkeleton />
            <div className="h-px bg-divider" />
            <SubscriptionRowSkeleton />
          </div>
        </div>
      </main>
    </div>
  )
}
