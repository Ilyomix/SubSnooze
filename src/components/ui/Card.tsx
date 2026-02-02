import { cn } from "@/lib/utils"
import { type HTMLAttributes, type ReactNode } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: "none" | "sm" | "md" | "lg"
}

export function Card({ className, children, padding = "md", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        padding === "none" && "p-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
