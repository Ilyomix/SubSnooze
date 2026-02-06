import { cn } from "@/lib/utils"
import { hapticLight } from "@/lib/haptics"
import { forwardRef, useCallback, type ButtonHTMLAttributes, type ReactNode, type MouseEvent } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  icon?: ReactNode
  loading?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, loading, children, disabled, onClick, ...props }, ref) => {
    const isDisabled = disabled || loading

    const spinner = (
      <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-current border-t-transparent" />
    )

    const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return
      hapticLight()

      // Ripple effect
      const btn = e.currentTarget
      const rect = btn.getBoundingClientRect()
      const ripple = document.createElement("span")
      const size = Math.max(rect.width, rect.height)
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`
      ripple.className = "absolute rounded-full bg-white/20 pointer-events-none motion-safe:animate-[ripple_0.5s_ease-out]"
      btn.appendChild(ripple)
      setTimeout(() => ripple.remove(), 500)

      onClick?.(e)
    }, [isDisabled, onClick])

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        onClick={handleClick}
        className={cn(
          "relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl font-semibold motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          // Variants
          variant === "primary" && "bg-primary text-white hover:bg-primary/90",
          variant === "secondary" && "bg-white text-primary hover:bg-surface/80",
          variant === "danger" && "bg-accent text-white hover:bg-accent/90",
          variant === "ghost" && "bg-transparent text-text-secondary hover:bg-surface",
          // Sizes
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-4 text-base",
          size === "lg" && "px-8 py-5 text-lg",
          // Disabled
          isDisabled && "opacity-70 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? spinner : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
