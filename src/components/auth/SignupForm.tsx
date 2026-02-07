"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { Button } from "@/components/ui"
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import { trackSignup } from "@/lib/analytics/events"
import { useI18n } from "@/lib/i18n"

interface SignupFormProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

export function SignupForm({ onSwitchToLogin, onSuccess }: SignupFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t("settings.passwordsMismatch"))
      return
    }

    if (password.length < 8) {
      setError(t("settings.passwordMinLength"))
      return
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError(t("auth.passwordRequirements"))
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      trackSignup("email")
      onSuccess()
    }
  }

  const handleGoogleSignup = async () => {
    if (!isSupabaseConfigured()) {
      setError(t("auth.authNotConfigured"))
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      trackSignup("google")
    }
  }

  return (
    <div className="space-y-6">
      {/* Google OAuth */}
      <Button
        type="button"
        variant="secondary"
        size="md"
        className="w-full border border-divider"
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {t("auth.continueWithGoogle")}
      </Button>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-divider" />
        <span className="text-sm text-text-tertiary">{t("common.or")}</span>
        <div className="h-px flex-1 bg-divider" />
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-accent/10 p-3 text-sm text-accent">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-text-secondary">
            {t("auth.nameLabel")}
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.namePlaceholder")}
              required
              className="w-full rounded-xl border border-divider bg-surface py-4 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-text-secondary">
            {t("auth.emailLabel")}
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              required
              className="w-full rounded-xl border border-divider bg-surface py-4 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-text-secondary">
            {t("auth.passwordLabel")}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.newPasswordPlaceholder")}
              required
              minLength={8}
              className="w-full rounded-xl border border-divider bg-surface py-4 pl-12 pr-12 text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-text-secondary">
            {t("auth.confirmPasswordLabel")}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.confirmPasswordPlaceholder")}
              required
              className="w-full rounded-xl border border-divider bg-surface py-4 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-divider text-primary accent-primary focus:ring-primary"
          />
          <span className="text-sm text-text-secondary">
            {t("auth.acceptTerms")}{" "}
            <Link href="/terms" className="text-primary hover:underline" target="_blank">{t("auth.termsOfService")}</Link>
            {" "}{t("auth.and")}{" "}
            <Link href="/privacy" className="text-primary hover:underline" target="_blank">{t("auth.privacyPolicy")}</Link>
          </span>
        </label>

        <Button type="submit" size="md" className="w-full" disabled={loading || !acceptedTerms}>
          {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary">
        {t("auth.hasAccount")}{" "}
        <button onClick={onSwitchToLogin} className="text-primary hover:underline">
          {t("auth.signIn")}
        </button>
      </p>
    </div>
  )
}
