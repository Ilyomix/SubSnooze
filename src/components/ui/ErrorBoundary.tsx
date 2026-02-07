"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { captureError } from "@/lib/sentry/client"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
    captureError(error, { componentStack: errorInfo.componentStack ?? undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <span className="text-xl text-accent">!</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Something went wrong
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Don&apos;t worry, it happens. Try refreshing the page.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
