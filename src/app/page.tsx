"use client"

import { useState } from "react"
import {
  Dashboard,
  AllSubscriptions,
  Settings,
  Notifications,
  AddSubscriptionStep1,
  AddSubscriptionStep2,
  SubscriptionManagement,
  UpgradeModal,
  CancelRedirectModal,
  ConfirmCancellationModal,
  CancellationSuccessModal,
} from "@/components"
import type { Subscription, Notification } from "@/types/subscription"

// Sample data
const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "netflix",
    name: "Netflix",
    logo: "N",
    logoColor: "#E50914",
    price: 15.99,
    billingCycle: "monthly",
    renewalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    status: "renewing_soon",
    cancelUrl: "https://netflix.com/cancel",
  },
  {
    id: "spotify",
    name: "Spotify",
    logo: "S",
    logoColor: "#1DB954",
    price: 10.99,
    billingCycle: "monthly",
    renewalDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
    status: "renewing_soon",
  },
  {
    id: "gym",
    name: "Gym",
    logo: "G",
    logoColor: "#FF6B35",
    price: 29.99,
    billingCycle: "monthly",
    renewalDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    status: "good",
  },
  {
    id: "disney",
    name: "Disney+",
    logo: "D+",
    logoColor: "#113CCF",
    price: 7.99,
    billingCycle: "monthly",
    renewalDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    status: "good",
  },
  {
    id: "adobe",
    name: "Adobe",
    logo: "Ai",
    logoColor: "#FF0000",
    price: 54.99,
    billingCycle: "monthly",
    renewalDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: "good",
  },
]

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    subscriptionId: "netflix",
    title: "Netflix renewing soon",
    message: "Your Netflix subscription renews in 3 days. Review it now.",
    type: "warning",
    date: new Date(),
    read: false,
  },
  {
    id: "2",
    subscriptionId: "spotify",
    title: "Spotify renewing soon",
    message: "Your Spotify subscription renews in 6 days.",
    type: "warning",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: "3",
    subscriptionId: "gym",
    title: "Price change detected",
    message: "Your Gym membership price increased by $5.",
    type: "info",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
  },
]

type Screen =
  | "dashboard"
  | "allSubs"
  | "settings"
  | "notifications"
  | "addStep1"
  | "addStep2"
  | "manage"

type Modal = "upgrade" | "cancelRedirect" | "confirmCancel" | "cancelSuccess" | null

export default function Home() {
  const [screen, setScreen] = useState<Screen>("dashboard")
  const [modal, setModal] = useState<Modal>(null)
  const [activeTab, setActiveTab] = useState<"home" | "subs" | "settings">("home")
  const [subscriptions, setSubscriptions] = useState(SAMPLE_SUBSCRIPTIONS)
  const [notifications] = useState(SAMPLE_NOTIFICATIONS)
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const handleTabChange = (tab: "home" | "subs" | "settings") => {
    setActiveTab(tab)
    if (tab === "home") setScreen("dashboard")
    else if (tab === "subs") setScreen("allSubs")
    else if (tab === "settings") setScreen("settings")
  }

  const handleSubscriptionClick = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id)
    if (sub) {
      setSelectedSub(sub)
      setScreen("manage")
    }
  }

  const handleCancelFlow = () => {
    setModal("cancelRedirect")
  }

  const handleExternalCancel = () => {
    // Open external URL
    if (selectedSub?.cancelUrl) {
      window.open(selectedSub.cancelUrl, "_blank")
    }
    setModal("confirmCancel")
  }

  const handleConfirmCancellation = () => {
    if (selectedSub) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== selectedSub.id))
    }
    setModal("cancelSuccess")
  }

  const handleCancellationComplete = () => {
    setModal(null)
    setSelectedSub(null)
    setScreen("dashboard")
    setActiveTab("home")
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Render screens
  if (screen === "notifications") {
    return (
      <Notifications
        notifications={notifications}
        onBack={() => setScreen("dashboard")}
        onNotificationClick={() => {}}
      />
    )
  }

  if (screen === "addStep1") {
    return (
      <AddSubscriptionStep1
        onBack={() => setScreen("dashboard")}
        onSelectService={(id) => {
          setSelectedService(id)
          setScreen("addStep2")
        }}
        onSearch={() => {}}
      />
    )
  }

  if (screen === "addStep2" && selectedService) {
    const service = {
      id: selectedService,
      name: selectedService.charAt(0).toUpperCase() + selectedService.slice(1),
      logo: selectedService.charAt(0).toUpperCase(),
      logoColor: "#237A5A",
    }
    return (
      <AddSubscriptionStep2
        service={service}
        onBack={() => setScreen("addStep1")}
        onSave={() => setScreen("dashboard")}
      />
    )
  }

  if (screen === "manage" && selectedSub) {
    return (
      <>
        <SubscriptionManagement
          subscription={selectedSub}
          onBack={() => {
            setSelectedSub(null)
            setScreen("dashboard")
          }}
          onCancel={handleCancelFlow}
          onSave={(data) => {
            setSubscriptions((prev) =>
              prev.map((s) =>
                s.id === selectedSub.id
                  ? { ...s, price: data.price, billingCycle: data.billingCycle as "monthly" | "yearly" | "weekly", renewalDate: data.renewalDate }
                  : s
              )
            )
            setSelectedSub(null)
            setScreen("dashboard")
          }}
        />
        {modal === "cancelRedirect" && (
          <CancelRedirectModal
            subscription={selectedSub}
            onProceed={handleExternalCancel}
            onClose={() => setModal(null)}
          />
        )}
        {modal === "confirmCancel" && (
          <ConfirmCancellationModal
            subscription={selectedSub}
            onConfirm={handleConfirmCancellation}
            onNotYet={() => setModal("cancelRedirect")}
            onClose={() => setModal(null)}
          />
        )}
        {modal === "cancelSuccess" && (
          <CancellationSuccessModal
            subscription={selectedSub}
            monthlySavings={selectedSub.price}
            onClose={handleCancellationComplete}
          />
        )}
      </>
    )
  }

  if (screen === "allSubs") {
    return (
      <AllSubscriptions
        subscriptions={subscriptions}
        onSubscriptionClick={handleSubscriptionClick}
        onSearch={() => {}}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    )
  }

  if (screen === "settings") {
    return (
      <>
        <Settings
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onUpgrade={() => setModal("upgrade")}
        />
        {modal === "upgrade" && (
          <UpgradeModal
            onUpgrade={() => setModal(null)}
            onClose={() => setModal(null)}
          />
        )}
      </>
    )
  }

  // Default: Dashboard
  return (
    <Dashboard
      userName="Sarah"
      totalSaved={247}
      subscriptions={subscriptions}
      onAddSubscription={() => setScreen("addStep1")}
      onSubscriptionClick={handleSubscriptionClick}
      onNotificationClick={() => setScreen("notifications")}
      notificationCount={unreadCount}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  )
}
