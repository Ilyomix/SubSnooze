"use client"

import { useState, useEffect } from "react"
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
import { useUser } from "@/hooks/useUser"
import { useSubscriptions } from "@/hooks/useSubscriptions"
import { useNotifications } from "@/hooks/useNotifications"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import type { Subscription } from "@/types/subscription"
import type { BillingCycle } from "@/types/database"

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
  const { firstName, loading: userLoading, isAuthenticated } = useUser()
  const {
    subscriptions,
    totalMonthly,
    loading: subsLoading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    recordCancelAttempt,
    verifyCancellation,
    restoreSubscription,
  } = useSubscriptions()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const { requestPermission, permission } = usePushNotifications()

  const [screen, setScreen] = useState<Screen>("dashboard")
  const [modal, setModal] = useState<Modal>(null)
  const [activeTab, setActiveTab] = useState<"home" | "subs" | "settings">("home")
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [totalSaved, setTotalSaved] = useState(0)

  // Request push notification permission on first load (if not already granted)
  useEffect(() => {
    if (isAuthenticated && permission === "default") {
      // Delay the permission request slightly to not overwhelm new users
      const timer = setTimeout(() => {
        requestPermission()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, permission, requestPermission])

  // Calculate total saved from cancelled subscriptions
  useEffect(() => {
    const cancelledTotal = subscriptions
      .filter((s) => s.status === "cancelled")
      .reduce((sum, s) => {
        if (s.billingCycle === "yearly") return sum + s.price / 12
        if (s.billingCycle === "weekly") return sum + s.price * 4.33
        return sum + s.price
      }, 0)
    setTotalSaved(Math.round(cancelledTotal))
  }, [subscriptions])

  // Show loading state while auth is being checked
  if (userLoading || subsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 motion-safe:animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-text-secondary">Loading...</p>
          <p className="text-xs text-text-tertiary">
            {userLoading ? "Auth loading..." : "Subscriptions loading..."}
          </p>
        </div>
      </div>
    )
  }

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

  const handleExternalCancel = async () => {
    if (selectedSub) {
      // Open external URL
      if (selectedSub.cancelUrl) {
        window.open(selectedSub.cancelUrl, "_blank")
      }

      // Record the cancel attempt in the database
      try {
        await recordCancelAttempt(selectedSub.id)
      } catch (error) {
        console.error("Failed to record cancel attempt:", error)
      }
    }
    setModal("confirmCancel")
  }

  const handleConfirmCancellation = async () => {
    if (selectedSub) {
      try {
        await verifyCancellation(selectedSub.id)
      } catch (error) {
        console.error("Failed to verify cancellation:", error)
      }
    }
    setModal("cancelSuccess")
  }

  const handleCancellationComplete = () => {
    setModal(null)
    setSelectedSub(null)
    setScreen("dashboard")
    setActiveTab("home")
  }

  const handleAddSubscription = async (data: {
    name: string
    logo: string
    logoColor: string
    price: number
    billingCycle: BillingCycle
    renewalDate: Date
    cancelUrl?: string
  }) => {
    try {
      await addSubscription({
        name: data.name,
        logo: data.logo,
        logo_color: data.logoColor,
        price: data.price,
        billing_cycle: data.billingCycle,
        renewal_date: data.renewalDate.toISOString().split("T")[0],
        cancel_url: data.cancelUrl,
      })
      setScreen("dashboard")
      setActiveTab("home")
    } catch (error) {
      console.error("Failed to add subscription:", error)
    }
  }

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
    // Could navigate to related subscription here if needed
  }

  const handleVerifyCancellationFromNotification = async (subscriptionId: string) => {
    try {
      await verifyCancellation(subscriptionId)
    } catch (error) {
      console.error("Failed to verify cancellation:", error)
    }
  }

  const handleRemindAgain = async (subscriptionId: string) => {
    try {
      const { resetCancelAttempt } = await import("@/lib/api/subscriptions")
      await resetCancelAttempt(subscriptionId)
    } catch (error) {
      console.error("Failed to reset cancel attempt:", error)
    }
  }

  // Render screens
  if (screen === "notifications") {
    return (
      <Notifications
        notifications={notifications}
        onBack={() => setScreen("dashboard")}
        onNotificationClick={handleNotificationClick}
        onVerifyCancellation={handleVerifyCancellationFromNotification}
        onRemindAgain={handleRemindAgain}
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
        onSave={(data) => {
          const priceNum = parseFloat(data.price.replace(/[^0-9.]/g, "")) || 0
          const cycleMap: Record<string, BillingCycle> = {
            "Monthly": "monthly",
            "Yearly": "yearly",
            "Weekly": "weekly",
          }
          handleAddSubscription({
            name: service.name,
            logo: service.logo,
            logoColor: service.logoColor,
            price: priceNum,
            billingCycle: cycleMap[data.cycle] || "monthly",
            renewalDate: data.date,
          })
        }}
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
          onRestore={async () => {
            try {
              await restoreSubscription(selectedSub.id)
            } catch (error) {
              console.error("Failed to restore subscription:", error)
            }
            setSelectedSub(null)
            setScreen("dashboard")
          }}
          onDelete={async () => {
            try {
              await deleteSubscription(selectedSub.id)
            } catch (error) {
              console.error("Failed to delete subscription:", error)
            }
            setSelectedSub(null)
            setScreen("dashboard")
          }}
          onSave={async (data) => {
            try {
              await updateSubscription(selectedSub.id, {
                price: data.price,
                billingCycle: data.billingCycle as BillingCycle,
                renewalDate: data.renewalDate,
              })
            } catch (error) {
              console.error("Failed to update subscription:", error)
            }
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
      userName={firstName}
      totalSaved={totalSaved}
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
