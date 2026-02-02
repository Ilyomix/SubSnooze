"use client"

import { useState } from "react"
import { Star, ChevronRight } from "lucide-react"
import { TabBar, Header } from "@/components/layout"
import { Card } from "@/components/ui"

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
}

function ToggleRow({ label, helper, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between px-[18px] py-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium text-text-primary">{label}</span>
        <span className="text-xs text-text-tertiary">{helper}</span>
      </div>
      <button
        onClick={onToggle}
        className={`h-7 w-12 rounded-full p-1 transition-colors ${
          enabled ? "bg-primary" : "bg-divider"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

export function Settings({ activeTab, onTabChange, onUpgrade }: SettingsProps) {
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [reminderDays, setReminderDays] = useState(3)
  const [email, setEmail] = useState("sarah@email.com")
  const [phone, setPhone] = useState("+1555-0123")

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[84px] pt-12">
      <div className="flex flex-1 flex-col gap-6 px-6">
        <Header title="Settings" />

        {/* Reminder Settings */}
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium text-text-secondary">
            Reminder Settings
          </span>
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center gap-2 px-[18px] py-4">
              <span className="text-[15px] text-text-primary">Remind me</span>
              <input
                type="number"
                min="1"
                max="30"
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="h-8 w-8 rounded-lg bg-background text-center text-[15px] font-medium text-text-primary focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="text-[15px] text-text-primary">days before</span>
            </div>
            <div className="h-px bg-divider" />
            <ToggleRow
              label="Email reminders"
              helper="Sent to sarah@email.com"
              enabled={emailEnabled}
              onToggle={() => setEmailEnabled(!emailEnabled)}
            />
            <div className="h-px bg-divider" />
            <ToggleRow
              label="Push notifications"
              helper="Appear on your device"
              enabled={pushEnabled}
              onToggle={() => setPushEnabled(!pushEnabled)}
            />
            <div className="h-px bg-divider" />
            <ToggleRow
              label="SMS reminders"
              helper="Text to +1 555-0123"
              enabled={smsEnabled}
              onToggle={() => setSmsEnabled(!smsEnabled)}
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-[15px] text-text-primary focus:outline-none"
              />
            </div>
            <div className="h-px bg-divider" />
            <div className="flex flex-col gap-1 px-[18px] py-4">
              <label className="text-xs text-text-tertiary">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent text-[15px] text-text-primary focus:outline-none"
              />
            </div>
          </Card>
        </div>

        {/* Upgrade */}
        <Card padding="none" className="overflow-hidden">
          <button
            onClick={onUpgrade}
            className="flex w-full items-center justify-between px-[18px] py-4"
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
      </div>

      <TabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
