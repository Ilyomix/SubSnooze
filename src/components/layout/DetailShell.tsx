"use client"

import { type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

interface DetailShellProps {
  children: ReactNode
  title?: string
  onBack: () => void
  headerRight?: ReactNode
}

export function DetailShell({
  children,
  title,
  onBack,
  headerRight,
}: DetailShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with back button and brand */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between bg-surface/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5 text-text-primary" />
          </button>
          <div className="flex items-center gap-2">
            {headerRight}
          </div>
          {title && (
            <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
          )}
        </div>

      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14">
        {children}
      </main>
    </div>
  )
}
