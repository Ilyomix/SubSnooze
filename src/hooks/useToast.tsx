"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastData {
  id: string
  message: string
  variant: "success" | "error" | "info"
}

interface ToastContextValue {
  toast: (message: string, variant?: "success" | "error" | "info") => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_TOASTS = 3

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: "bg-primary text-white",
  error: "bg-accent text-white",
  info: "bg-text-primary text-white",
}

const durations = {
  success: 3000,
  error: 5000,
  info: 3000,
}

function Toast({ data, onDismiss }: { data: ToastData; onDismiss: (id: string) => void }) {
  const Icon = icons[data.variant]

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg motion-safe:animate-[toast-in_0.25s_ease-out]",
        styles[data.variant]
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1 text-sm font-medium">{data.message}</span>
      <button
        onClick={() => onDismiss(data.id)}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-0.5 hover:bg-white/20"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: "success" | "error" | "info" = "success") => {
    const id = crypto.randomUUID()
    setToasts((prev) => {
      const next = [...prev, { id, message, variant }]
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next
    })

    setTimeout(() => dismiss(id), durations[variant])
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — fixed below header */}
      {toasts.length > 0 && (
        <div className="fixed top-16 left-4 right-4 z-[60] flex flex-col gap-2">
          {toasts.map((t) => (
            <Toast key={t.id} data={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
