import { cn } from "@/lib/utils"
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  icon?: ReactNode
  loading?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", icon, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          // Variants
          variant === "primary" && "bg-primary text-white hover:bg-primary/90",
          variant === "secondary" && "bg-white text-primary hover:bg-surface/80",
          variant === "danger" && "bg-accent text-white hover:bg-accent/90",
          variant === "ghost" && "bg-transparent text-text-secondary hover:bg-surface",
          // Sizes
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-4 text-base",
          size === "lg" && "px-8 py-5 text-lg",
          // Disabled / loading
          (disabled || loading) && "opacity-60 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="h-5 w-5 motion-safe:animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
