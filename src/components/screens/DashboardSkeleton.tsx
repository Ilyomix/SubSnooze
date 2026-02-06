import { Skeleton } from "@/components/ui/Skeleton"

function SubscriptionRowSkeleton() {
  return (
    <div className="flex w-full items-center justify-between p-4 min-w-0">
      <div className="flex items-center gap-3 min-w-0">
        <Skeleton className="h-11 w-11 shrink-0 rounded-[10px]" />
        <div className="flex flex-col gap-1.5 min-w-0">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-surface/80 px-6 backdrop-blur-sm pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-lg font-semibold text-text-primary">SubSnooze</span>
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 pb-[84px] pt-14">
        <div className="flex flex-col gap-6 px-6 pt-4 pb-40">
          {/* Greeting */}
          <Skeleton className="h-8 w-40" />

          {/* Summary Cards */}
          <div className="flex gap-3">
            <Skeleton className="h-[144px] flex-1 rounded-2xl" />
            <Skeleton className="h-[144px] flex-1 rounded-2xl" />
          </div>

          {/* Section Header */}
          <Skeleton className="h-4 w-28" />

          {/* Subscription rows */}
          <div className="flex">
            <Skeleton className="w-1 shrink-0 rounded-none" />
            <div className="flex-1 overflow-hidden rounded-2xl rounded-l-none bg-surface">
              <SubscriptionRowSkeleton />
              <div className="h-px bg-divider" />
              <SubscriptionRowSkeleton />
              <div className="h-px bg-divider" />
              <SubscriptionRowSkeleton />
            </div>
          </div>

          {/* Second section */}
          <Skeleton className="h-4 w-20" />
          <div className="flex">
            <Skeleton className="w-1 shrink-0 rounded-none" />
            <div className="flex-1 overflow-hidden rounded-2xl rounded-l-none bg-surface">
              <SubscriptionRowSkeleton />
              <div className="h-px bg-divider" />
              <SubscriptionRowSkeleton />
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-[84px] left-0 right-0 bg-background pt-2 pb-4">
        <div className="mx-auto w-full max-w-3xl px-6">
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 flex items-start justify-around bg-surface px-6 pt-3 pb-[max(34px,env(safe-area-inset-bottom))]"
        style={{ minHeight: "calc(50px + max(34px, env(safe-area-inset-bottom)))" }}
      >
        <div className="flex flex-1 flex-col items-center gap-1 rounded-lg">
          <Skeleton className="h-[22px] w-[22px] rounded" />
          <Skeleton className="h-[10px] w-8 rounded" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-1 rounded-lg">
          <Skeleton className="h-[22px] w-[22px] rounded" />
          <Skeleton className="h-[10px] w-8 rounded" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-1 rounded-lg">
          <Skeleton className="h-[22px] w-[22px] rounded" />
          <Skeleton className="h-[10px] w-10 rounded" />
        </div>
      </div>
    </div>
  )
}
