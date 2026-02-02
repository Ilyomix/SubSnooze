import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "react"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "warning" | "success" | "neutral" | "urgent" | "reminder"
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold",
        variant === "warning" && "bg-accent-light text-accent",
        variant === "success" && "bg-primary/10 text-primary",
        variant === "neutral" && "bg-divider text-text-secondary",
        variant === "urgent" && "bg-accent text-white",
        variant === "reminder" && "bg-amber-100 text-amber-800",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
