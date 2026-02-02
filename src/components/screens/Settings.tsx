"use client"

import { useState, useEffect } from "react"
import { Star, ChevronRight, LogOut } from "lucide-react"
import { AppShell } from "@/components/layout"
import { Card } from "@/components/ui"
import { useUser } from "@/hooks/useUser"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"
import type { SupabaseClient } from "@supabase/supabase-js"

interface SettingsProps {
  activeTab: "home" | "subs" | "settings"
  onTabChange: (tab: "home" | "subs" | "settings") => void
  onUpgrade: () => void
}

interface ToggleRowProps {
  label: string
  helper: string
  enabled: boolean
  onToggle: () => void
  loading?: boolean
}

function ToggleRow({ label, helper, enabled, onToggle, loading }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between px-[18px] py-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium text-text-primary">{label}</span>
        <span className="text-xs text-text-tertiary">{helper}</span>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        className={`h-7 w-12 rounded-full p-1 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          enabled ? "bg-primary" : "bg-divider"
        } ${loading ? "opacity-50" : ""}`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-white shadow motion-safe:transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

export function Settings({ activeTab, onTabChange, onUpgrade }: SettingsProps) {
  const { email, phoneNumber, emailRemindersEnabled, smsRemindersEnabled, signOut, refreshProfile } = useUser()
  const { isEnabled: pushEnabled, toggleNotifications, loading: pushLoading, isSupported } = usePushNotifications()

  const [emailEnabled, setEmailEnabled] = useState(emailRemindersEnabled)
  const [smsEnabled, setSmsEnabled] = useState(smsRemindersEnabled)
  const [saving, setSaving] = useState(false)

  const supabase: SupabaseClient<Database> = createClient()

  // Sync with profile data
  useEffect(() => {
    setEmailEnabled(emailRemindersEnabled)
    setSmsEnabled(smsRemindersEnabled)
  }, [emailRemindersEnabled, smsRemindersEnabled])

  const handleEmailToggle = async () => {
    setSaving(true)
    const newValue = !emailEnabled
    setEmailEnabled(newValue)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from("users")
          .update({ email_reminders_enabled: newValue })
          .eq("id", user.id)
        await refreshProfile()
      }
    } catch (error) {
      console.error("Failed to update email setting:", error)
      setEmailEnabled(!newValue) // Rollback
    } finally {
      setSaving(false)
    }
  }

  const handleSmsToggle = async () => {
    setSaving(true)
    const newValue = !smsEnabled
    setSmsEnabled(newValue)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from("users")
          .update({ sms_reminders_enabled: newValue })
          .eq("id", user.id)
        await refreshProfile()
      }
    } catch (error) {
      console.error("Failed to update SMS setting:", error)
      setSmsEnabled(!newValue) // Rollback
    } finally {
      setSaving(false)
    }
  }

  const handlePushToggle = async () => {
    await toggleNotifications()
    await refreshProfile()
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={onTabChange}>
      <div className="flex flex-col gap-6 px-6 pt-4">
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>

        {/* Reminder Settings */}
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium text-text-secondary">
            Reminder Settings
          </span>
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center gap-2 px-[18px] py-4">
              <span className="text-[15px] text-text-primary">3-touch reminder system</span>
              <span className="ml-auto text-xs text-text-tertiary">7, 3, 1 days before</span>
            </div>
            <div className="h-px bg-divider" />
            <ToggleRow
              label="Email reminders"
              helper={email ? `Sent to ${email}` : "Not configured"}
              enabled={emailEnabled}
              onToggle={handleEmailToggle}
              loading={saving}
            />
            <div className="h-px bg-divider" />
            {isSupported ? (
              <ToggleRow
                label="Push notifications"
                helper="Appear on your device"
                enabled={pushEnabled}
                onToggle={handlePushToggle}
                loading={pushLoading}
              />
            ) : (
              <div className="flex items-center justify-between px-[18px] py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-medium text-text-primary">Push notifications</span>
                  <span className="text-xs text-text-tertiary">Not supported in this browser</span>
                </div>
              </div>
            )}
            <div className="h-px bg-divider" />
            <ToggleRow
              label="SMS reminders"
              helper={phoneNumber ? `Text to ${phoneNumber}` : "Add phone number to enable"}
              enabled={smsEnabled && !!phoneNumber}
              onToggle={handleSmsToggle}
              loading={saving}
            />
          </Card>
        </div>

        {/* Account */}
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium text-text-secondary">
            Account
          </span>
          <Card padding="none" className="overflow-hidden">
            <div className="flex flex-col gap-1 px-[18px] py-4">
              <label className="text-xs text-text-tertiary">Email</label>
              <span className="text-[15px] text-text-primary">{email || "—"}</span>
            </div>
            <div className="h-px bg-divider" />
            <div className="flex flex-col gap-1 px-[18px] py-4">
              <label className="text-xs text-text-tertiary">Phone</label>
              <span className="text-[15px] text-text-primary">{phoneNumber || "Not set"}</span>
            </div>
          </Card>
        </div>

        {/* Upgrade */}
        <Card padding="none" className="overflow-hidden">
          <button
            onClick={onUpgrade}
            className="flex w-full items-center justify-between px-[18px] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-4 w-4 text-primary" fill="currentColor" />
              </div>
              <span className="text-[15px] font-medium text-text-primary">
                Upgrade to Pro
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-text-muted" />
          </button>
        </Card>

        {/* Sign Out */}
        <Card padding="none" className="overflow-hidden">
          <button
            onClick={signOut}
            className="flex w-full items-center justify-between px-[18px] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                <LogOut className="h-4 w-4 text-accent" />
              </div>
              <span className="text-[15px] font-medium text-accent">
                Sign Out
              </span>
            </div>
          </button>
        </Card>
      </div>
    </AppShell>
  )
}
