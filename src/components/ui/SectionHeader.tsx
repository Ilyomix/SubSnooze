import { cn } from "@/lib/utils"
import { Flame, Check, type LucideIcon } from "lucide-react"

interface SectionHeaderProps {
  title: string
  count?: number
  variant?: "warning" | "success"
  className?: string
}

export function SectionHeader({ title, count, variant = "success", className }: SectionHeaderProps) {
  const Icon: LucideIcon = variant === "warning" ? Flame : Check
  const colorClass = variant === "warning" ? "text-accent" : "text-primary"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className={cn("h-[18px] w-[18px]", colorClass)} />
      <h2 className={cn("text-[13px] font-semibold tracking-wide", colorClass)}>
        {title}
        {count !== undefined && ` (${count})`}
      </h2>
    </div>
  )
}
