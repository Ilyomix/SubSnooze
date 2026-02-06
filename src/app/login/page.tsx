"use client"

import { useState } from "react"
import Link from "next/link"
import { LoginForm, SignupForm } from "@/components/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui"
import { ArrowLeft, Mail, CheckCircle, Bell, Shield, Zap, ChevronDown } from "lucide-react"

type AuthView = "landing" | "login" | "signup" | "forgot-password" | "check-email"

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-6 shadow-card text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </div>
  )
}

function HowItWorksStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {number}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [view, setView] = useState<AuthView>("landing")
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

  // Show marketing landing page
  if (view === "landing") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between bg-background/80 px-6 py-4 backdrop-blur-sm">
          <span className="text-xl font-bold text-primary">SubSnooze</span>
          <button
            onClick={() => setView("login")}
            className="rounded-xl px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Sign in
          </button>
        </header>

        <main className="flex flex-1 flex-col">
          {/* Hero Section */}
          <section className="flex flex-col items-center gap-6 px-6 pt-8 pb-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary motion-safe:animate-fade-in">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold leading-tight text-text-primary md:text-4xl lg:text-5xl">
                Stop paying the<br />
                <span className="text-primary">ADHD tax</span> on<br />
                subscriptions
              </h1>
              <p className="mx-auto max-w-md text-base text-text-secondary md:text-lg">
                Track your subscriptions, get gentle reminders before renewals, and cancel on time. Designed for how your brain actually works.
              </p>
            </div>
            <div className="flex w-full max-w-xs flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setView("signup")}
                className="w-full"
              >
                Get started free
              </Button>
              <p className="text-xs text-text-tertiary">
                No credit card required. Free forever for up to 5 subscriptions.
              </p>
            </div>
            <button
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
              }}
              aria-label="Scroll to features"
              className="mt-4 motion-safe:animate-bounce text-text-muted"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          </section>

          {/* Features Section */}
          <section id="features" className="bg-surface/50 px-6 py-12">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-center text-xl font-bold text-text-primary md:text-2xl">
                Built for distracted minds
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <FeatureCard
                  icon={<Bell className="h-6 w-6 text-primary" />}
                  title="Smart reminders"
                  description="Get nudged 7, 3, and 1 day before renewal. Choose aggressive, relaxed, or minimal — whatever fits your brain."
                />
                <FeatureCard
                  icon={<Zap className="h-6 w-6 text-primary" />}
                  title="One-tap tracking"
                  description="Add subscriptions in seconds. We pre-fill prices and renewal dates from our database of 100+ services."
                />
                <FeatureCard
                  icon={<Shield className="h-6 w-6 text-primary" />}
                  title="Cancel with confidence"
                  description="Direct links to cancellation pages. No more hunting through settings. We even remind you to actually do it."
                />
              </div>
            </div>
          </section>

          {/* How it Works */}
          <section className="px-6 py-12">
            <div className="mx-auto max-w-md">
              <h2 className="mb-8 text-center text-xl font-bold text-text-primary md:text-2xl">
                How it works
              </h2>
              <div className="flex flex-col gap-6">
                <HowItWorksStep
                  number={1}
                  title="Add your subscriptions"
                  description="Search from 100+ popular services or add custom ones. Prices and dates are pre-filled when possible."
                />
                <HowItWorksStep
                  number={2}
                  title="Set your reminder style"
                  description="Aggressive (7-3-1 days), Relaxed (14-3 days), or Minimal (3 days). Pick what works for you."
                />
                <HowItWorksStep
                  number={3}
                  title="Never overpay again"
                  description="Get timely nudges via push or email. When you're ready to cancel, we'll take you right to the cancellation page."
                />
              </div>
            </div>
          </section>

          {/* ADHD-Friendly callout */}
          <section className="bg-primary/5 px-6 py-12">
            <div className="mx-auto max-w-md text-center">
              <h2 className="mb-3 text-xl font-bold text-text-primary md:text-2xl">
                No guilt. No shame. Just savings.
              </h2>
              <p className="mb-6 text-sm text-text-secondary leading-relaxed">
                We get it — forgetting to cancel a subscription isn&apos;t a character flaw.
                SubSnooze works <em>with</em> your brain, not against it. Gentle reminders,
                minimal decisions, and a &quot;Decide Later&quot; button for when you&apos;re not ready.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setView("signup")}
                className="w-full max-w-xs mx-auto"
              >
                Start tracking for free
              </Button>
            </div>
          </section>

          {/* Trust signals */}
          <section className="px-6 py-12">
            <div className="mx-auto max-w-md">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-text-tertiary">Free tier</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-xs text-text-tertiary">Data sold</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">PWA</div>
                  <div className="text-xs text-text-tertiary">Works offline</div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-divider px-6 py-8 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="flex items-center justify-center gap-4 text-sm text-text-tertiary">
              <Link href="/terms" className="hover:text-primary">Terms</Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            </div>
            <p className="text-xs text-text-muted">
              Made with care for the ADHD community.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  // Auth views
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        {view !== "check-email" && (
          <button
            onClick={() => setView(view === "login" || view === "signup" ? "landing" : "login")}
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
        By continuing, you agree to our{" "}
        <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </footer>
    </div>
  )
}
