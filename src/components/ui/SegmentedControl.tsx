"use client"

import { cn } from "@/lib/utils"
import { hapticLight } from "@/lib/haptics"

interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
  name?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  className,
  name = "segmented-control",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl bg-background p-1",
        disabled && "opacity-70 cursor-not-allowed",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => {
              if (!isSelected && !disabled) {
                hapticLight()
                onChange(option.value)
              }
            }}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-[13px] font-semibold motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isSelected
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
