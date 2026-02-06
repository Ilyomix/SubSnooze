import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "motion-safe:animate-pulse rounded-xl bg-divider/60",
        className
      )}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-6 pt-4 pb-40">
      {/* Greeting */}
      <Skeleton className="h-8 w-36" />

      {/* Summary Cards */}
      <div className="flex gap-3">
        <Skeleton className="h-[140px] flex-1 rounded-2xl" />
        <Skeleton className="h-[140px] flex-1 rounded-2xl" />
      </div>

      {/* Section Header */}
      <Skeleton className="h-4 w-24" />

      {/* Subscription rows */}
      <div className="rounded-2xl bg-surface overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Another section */}
      <Skeleton className="h-4 w-20" />
      <div className="rounded-2xl bg-surface overflow-hidden">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
