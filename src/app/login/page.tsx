"use client"

import { useState } from "react"
import { LoginForm, SignupForm } from "@/components/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"

type AuthView = "login" | "signup" | "forgot-password" | "check-email"

export default function LoginPage() {
  const [view, setView] = useState<AuthView>("login")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setView("check-email")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        {view !== "login" && view !== "check-email" && (
          <button
            onClick={() => setView("login")}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
        )}
        <div className="flex-1" />
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col justify-center px-6 pb-12">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-primary">SubSnooze</h1>
          <p className="mt-2 text-text-secondary">
            {view === "login" && "Welcome back"}
            {view === "signup" && "Create your account"}
            {view === "forgot-password" && "Reset your password"}
            {view === "check-email" && "Check your email"}
          </p>
        </div>

        {/* Auth Forms */}
        <div className="mx-auto w-full max-w-sm">
          {view === "login" && (
            <LoginForm
              onSwitchToSignup={() => setView("signup")}
              onForgotPassword={() => setView("forgot-password")}
            />
          )}

          {view === "signup" && (
            <SignupForm
              onSwitchToLogin={() => setView("login")}
              onSuccess={() => setView("check-email")}
            />
          )}

          {view === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-accent/10 p-3 text-sm text-accent">
                  {error}
                </div>
              )}

              <p className="text-sm text-text-secondary">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium text-text-secondary">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-divider bg-surface py-4 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <Button type="submit" size="md" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}

          {view === "check-email" && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-text-primary">Check your email</h2>
                <p className="text-sm text-text-secondary">
                  We&apos;ve sent you a link to{" "}
                  <span className="font-medium text-text-primary">{email || "your email"}</span>.
                  Click the link to continue.
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                className="w-full border border-divider"
                onClick={() => setView("login")}
              >
                Back to sign in
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-text-tertiary">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </footer>
    </div>
  )
}
