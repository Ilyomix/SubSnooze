"use client"

import { useState, useEffect } from "react"
import { Star, ChevronRight, LogOut, Check, BellRing, Trash2, AlertTriangle } from "lucide-react"
import { AppShell } from "@/components/layout"
import { Card } from "@/components/ui"
import { useUser } from "@/hooks/useUser"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { createClient } from "@/lib/supabase/client"
import type { Database, ReminderPreset } from "@/types/database"
import type { SupabaseClient } from "@supabase/supabase-js"

// Preset configuration
const PRESETS: {
  id: ReminderPreset
  name: string
  subtitle: string
  days: number[]
}[] = [
  {
    id: "aggressive",
    name: "Aggressive",
    subtitle: "Multiple nudges to stay on top of things",
    days: [7, 3, 1],
  },
  {
    id: "relaxed",
    name: "Relaxed",
    subtitle: "Early heads up with a final reminder",
    days: [14, 3],
  },
  {
    id: "minimal",
    name: "Minimal",
    subtitle: "One reminder, no fuss",
    days: [3],
  },
]

// Visual dots showing reminder count - simple and clear
function ReminderDots({ count, isSelected }: { count: number; isSelected: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            isSelected ? "bg-primary" : "bg-text-muted"
          }`}
        />
      ))}
    </div>
  )
}

// Format days into readable text
function formatDays(days: number[]): string {
  if (days.length === 1) return `${days[0]} days before`
  const sorted = [...days].sort((a, b) => b - a)
  const last = sorted.pop()
  return `${sorted.join(", ")} & ${last} days before`
}

// Preset option component
function PresetOption({
  preset,
  isSelected,
  onSelect,
  disabled,
}: {
  preset: typeof PRESETS[0]
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full rounded-xl p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isSelected
          ? "bg-primary/5 ring-2 ring-primary"
          : "bg-surface hover:bg-surface/80"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[15px] font-medium ${isSelected ? "text-primary" : "text-text-primary"}`}>
              {preset.name}
            </span>
            {preset.id === "aggressive" && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Default
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-text-tertiary">{preset.subtitle}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-sm ${isSelected ? "text-primary font-medium" : "text-text-secondary"}`}>
              {formatDays(preset.days)}
            </span>
            <ReminderDots count={preset.days.length} isSelected={isSelected} />
          </div>
        </div>
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            isSelected ? "border-primary bg-primary" : "border-divider"
          }`}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>
    </button>
  )
}

interface SettingsProps {
  activeTab: "home" | "subs" | "settings"
  onTabChange: (tab: "home" | "subs" | "settings") => void
  onUpgrade: () => void
  onNotificationClick?: () => void
  notificationCount?: number
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

export function Settings({ activeTab, onTabChange, onUpgrade, onNotificationClick, notificationCount }: SettingsProps) {
  const {
    id: userId,
    email,
    phoneNumber,
    emailRemindersEnabled,
    smsRemindersEnabled,
    reminderPreset,
    signOut,
    refreshProfile,
    updateReminderPreset,
  } = useUser()
  const { isEnabled: pushEnabled, toggleNotifications, loading: pushLoading, isSupported } = usePushNotifications()
  const [testingSent, setTestingSent] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [emailEnabled, setEmailEnabled] = useState(emailRemindersEnabled)
  const [smsEnabled, setSmsEnabled] = useState(smsRemindersEnabled)
  const [selectedPreset, setSelectedPreset] = useState<ReminderPreset>(reminderPreset)
  const [saving, setSaving] = useState(false)
  const [savingPreset, setSavingPreset] = useState(false)

  const supabase: SupabaseClient<Database> = createClient()

  // Sync each setting independently to avoid cross-contamination
  useEffect(() => {
    setEmailEnabled(emailRemindersEnabled)
  }, [emailRemindersEnabled])

  useEffect(() => {
    setSmsEnabled(smsRemindersEnabled)
  }, [smsRemindersEnabled])

  useEffect(() => {
    setSelectedPreset(reminderPreset)
  }, [reminderPreset])

  const handlePresetChange = async (preset: ReminderPreset) => {
    if (preset === selectedPreset) return
    setSavingPreset(true)
    setSelectedPreset(preset) // Optimistic update
    try {
      await updateReminderPreset(preset)
    } catch (error) {
      setSelectedPreset(reminderPreset) // Rollback on error
    } finally {
      setSavingPreset(false)
    }
  }

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
    <AppShell activeTab={activeTab} onTabChange={onTabChange} onNotificationClick={onNotificationClick} notificationCount={notificationCount}>
      <div className="flex flex-col gap-6 px-6 pt-4">
        <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>

        {/* Reminder Schedule */}
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium text-text-secondary">
            Reminder Schedule
          </span>
          <p className="text-xs text-text-tertiary -mt-1">
            Choose when to get reminded before renewals
          </p>
          <div className="flex flex-col gap-2">
            {PRESETS.map((preset) => (
              <PresetOption
                key={preset.id}
                preset={preset}
                isSelected={selectedPreset === preset.id}
                onSelect={() => handlePresetChange(preset.id)}
                disabled={savingPreset}
              />
            ))}
          </div>
        </div>

        {/* Notification Channels */}
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium text-text-secondary">
            How to Notify You
          </span>
          <Card padding="none" className="overflow-hidden">
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

        {/* Dev: Test Notification */}
        {process.env.NODE_ENV === "development" && (
          <Card padding="none" className="overflow-hidden">
            <button
              onClick={async () => {
                if (!userId) return
                try {
                  const { createTestNotification } = await import("@/lib/api/notifications")
                  await createTestNotification(userId)
                  setTestingSent(true)
                  setTimeout(() => setTestingSent(false), 2000)
                } catch (err) {
                  console.error("Failed to create test notification:", err)
                }
              }}
              className="flex w-full items-center justify-between px-[18px] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                  <BellRing className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-medium text-text-primary">
                    {testingSent ? "Sent!" : "Send test notification"}
                  </span>
                  <span className="text-xs text-text-tertiary">Dev only — creates a random notification</span>
                </div>
              </div>
            </button>
          </Card>
        )}

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

        {/* Delete Account */}
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium text-text-secondary">
            Danger Zone
          </span>
          {!showDeleteConfirm ? (
            <Card padding="none" className="overflow-hidden">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center justify-between px-[18px] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                    <Trash2 className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[15px] font-medium text-accent">
                      Delete my account
                    </span>
                    <span className="text-xs text-text-tertiary">Permanently remove all your data</span>
                  </div>
                </div>
              </button>
            </Card>
          ) : (
            <Card className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div className="space-y-1">
                  <p className="text-[15px] font-medium text-text-primary">
                    This action is permanent
                  </p>
                  <p className="text-sm text-text-secondary">
                    All your subscriptions, notifications, and account data will be permanently deleted. This cannot be undone.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="delete-confirm" className="text-sm text-text-secondary">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                  className="w-full rounded-xl border border-divider bg-surface py-3 px-4 text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
                />
              </div>

              {deleteError && (
                <div className="rounded-lg bg-accent/10 p-3 text-sm text-accent">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText("")
                    setDeleteError(null)
                  }}
                  className="flex-1 rounded-xl border border-divider py-3 text-[15px] font-medium text-text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true)
                    setDeleteError(null)
                    try {
                      const { error } = await supabase.rpc("delete_user_account")
                      if (error) throw error
                      await signOut()
                    } catch (err) {
                      console.error("Failed to delete account:", err)
                      setDeleteError("Something went wrong. Please try again or contact support.")
                      setDeleting(false)
                    }
                  }}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className={`flex-1 rounded-xl py-3 text-[15px] font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                    deleteConfirmText === "DELETE" && !deleting
                      ? "bg-accent hover:bg-accent/90"
                      : "bg-accent/40 cursor-not-allowed"
                  }`}
                >
                  {deleting ? "Deleting..." : "Delete forever"}
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Spacing at bottom */}
        <div className="h-4" />
      </div>
    </AppShell>
  )
}
