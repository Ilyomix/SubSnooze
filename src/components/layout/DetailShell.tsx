"use client"

import { type ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

interface DetailShellProps {
  children: ReactNode
  title?: string
  onBack: () => void
  headerRight?: ReactNode
  headerActions?: ReactNode
}

export function DetailShell({
  children,
  title,
  onBack,
  headerRight,
  headerActions,
}: DetailShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>
      {/* Header with back button and brand */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between bg-surface/80 px-6 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
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
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      </header>

      {/* Main Content — constrained on larger screens */}
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 pt-14 pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  )
}
