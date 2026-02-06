"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center p-6">
        <div className="flex-1" />
      </header>

      <main className="flex flex-1 flex-col justify-center px-6 pb-12">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-primary">SubSnooze</h1>
          <p className="mt-2 text-text-secondary">
            {success ? "Password updated" : "Set your new password"}
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-text-primary">All set!</h2>
                <p className="text-sm text-text-secondary">
                  Your password has been updated successfully.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => { window.location.href = "/" }}
              >
                Go to SubSnooze
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-accent/10 p-3 text-sm text-accent">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium text-text-secondary">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
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
                <label htmlFor="confirm-new-password" className="text-sm font-medium text-text-secondary">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary" />
                  <input
                    id="confirm-new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    className="w-full rounded-xl border border-divider bg-surface py-4 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Button type="submit" size="md" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
