"use client"

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useState } from "react"

interface StepProgressProps {
  current: number
  total: number
  subtitle?: string
  className?: string
}

export function StepProgress({ current, total, subtitle, className }: StepProgressProps) {
  const safeTotal = Math.max(1, Math.floor(total))
  const safeCurrent = Math.max(1, Math.min(safeTotal, Math.floor(current)))

  const percent = useMemo(() => {
    if (safeTotal <= 0) return 0
    return Math.round((safeCurrent / safeTotal) * 100)
  }, [safeCurrent, safeTotal])

  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setAnimate(true))
    return () => window.cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={cn("flex flex-col items-center gap-2", className)} aria-label={`Step ${safeCurrent} of ${safeTotal}`}>
      <span className="text-[13px] font-medium text-text-secondary">Step {safeCurrent} of {safeTotal}</span>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="relative h-4 w-48"
      >
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-divider" />
        <div
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-500 motion-safe:ease-out"
          style={{ width: `${animate ? percent : 0}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-between" aria-hidden="true">
          {Array.from({ length: safeTotal }).map((_, idx) => {
            const stepNumber = idx + 1
            const isCompleteOrActive = stepNumber <= safeCurrent
            const isActive = stepNumber === safeCurrent

            return (
              <div
                key={stepNumber}
                className={cn(
                  "relative h-3.5 w-3.5 rounded-full bg-background ring-0 motion-safe:transition-transform",
                  isCompleteOrActive ? "ring-primary/25" : "ring-divider",
                  isActive && "motion-safe:scale-110"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0.5 rounded-full",
                    isCompleteOrActive ? "bg-primary" : "bg-divider"
                  )}
                />
              </div>
            )
          })}
        </div>
      </div>

      {subtitle ? <span className="text-xs text-text-tertiary">{subtitle}</span> : null}
    </div>
  )
}
