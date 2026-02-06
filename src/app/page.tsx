"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Dashboard,
  AllSubscriptions,
  Settings,
  Notifications,
  AddSubscriptionStep1,
  AddSubscriptionStep2,
  SubscriptionManagement,
  UpgradeModal,
} from "@/components"
import { DashboardSkeleton } from "@/components/ui/Skeleton"
import { useToast } from "@/components/ui/Toast"
import { useUser } from "@/hooks/useUser"
import { useSubscriptions } from "@/hooks/useSubscriptions"
import { useNotifications } from "@/hooks/useNotifications"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import type { Subscription } from "@/types/subscription"
import type { BillingCycle } from "@/types/database"
import { getServiceBySlug, getServiceLogoUrl, getFallbackLogoUrl, getInitials, stringToColor, nameToDomain } from "@/lib/services"
import { formatLocalDate } from "@/lib/date-utils"

type Screen =
  | "dashboard"
  | "allSubs"
  | "settings"
  | "notifications"
  | "addStep1"
  | "addStep2"
  | "manage"

type Modal = "upgrade" | null

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
    resetCancelAttempt,
    restoreSubscription,
  } = useSubscriptions()
  const { notifications, unreadCount, markAsRead, markAsUnread, deleteNotification: deleteNotif, deleteAllNotifications, hasMore, loadingMore, loadMore } = useNotifications()
  const { requestPermission, permission } = usePushNotifications()
  const { toast } = useToast()

  const [screen, setScreen] = useState<Screen>("dashboard")
  const [modal, setModal] = useState<Modal>(null)
  const [activeTab, setActiveTab] = useState<"home" | "subs" | "settings">("home")
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [previousScreen, setPreviousScreen] = useState<Screen>("dashboard")
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [customServiceName, setCustomServiceName] = useState<string | null>(null)
  const [totalSaved, setTotalSaved] = useState(0)

  // Track whether we're handling a popstate to avoid pushing duplicate history entries
  const isPopstateRef = useRef(false)
  // Ref to always read the latest activeTab without stale closures
  const activeTabRef = useRef(activeTab)
  activeTabRef.current = activeTab

  // Navigate to a screen and push a history entry (unless triggered by popstate)
  const navigateTo = useCallback((
    newScreen: Screen,
    options?: {
      tab?: "home" | "subs" | "settings"
      sub?: Subscription | null
      service?: string | null
      savePrevious?: Screen
    }
  ) => {
    if (options?.savePrevious !== undefined) setPreviousScreen(options.savePrevious)
    if (options?.sub !== undefined) setSelectedSub(options.sub)
    if (options?.service !== undefined) setSelectedService(options.service)
    if (options?.tab !== undefined) setActiveTab(options.tab)

    setScreen(newScreen)

    // Push history entry unless we're responding to browser back/forward
    if (!isPopstateRef.current) {
      const state = { screen: newScreen, tab: options?.tab ?? activeTabRef.current }
      window.history.pushState(state, "", undefined)
    }
  }, [])

  // Handle browser back/forward buttons
  useEffect(() => {
    // Replace the initial history entry with current state
    window.history.replaceState({ screen: "dashboard", tab: "home" }, "", undefined)

    const handlePopstate = (event: PopStateEvent) => {
      const state = event.state as { screen?: Screen; tab?: string } | null
      isPopstateRef.current = true

      if (state?.screen) {
        setScreen(state.screen)
        if (state.tab) setActiveTab(state.tab as "home" | "subs" | "settings")
      } else {
        // No state = initial entry, go to dashboard
        setScreen("dashboard")
        setActiveTab("home")
      }

      // Clear detail selections when going back to a tab screen
      const tabScreens: Screen[] = ["dashboard", "allSubs", "settings"]
      if (state?.screen && tabScreens.includes(state.screen)) {
        setSelectedSub(null)
        setSelectedService(null)
      }

      isPopstateRef.current = false
    }

    window.addEventListener("popstate", handlePopstate)
    return () => window.removeEventListener("popstate", handlePopstate)
  }, [])

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
    setTotalSaved(cancelledTotal)
  }, [subscriptions])

  // Show skeleton loading state while auth is being checked
  if (userLoading || subsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardSkeleton />
      </div>
    )
  }

  const handleTabChange = (tab: "home" | "subs" | "settings") => {
    const screenMap = { home: "dashboard", subs: "allSubs", settings: "settings" } as const
    navigateTo(screenMap[tab], { tab })
  }

  const handleSubscriptionClick = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id)
    if (sub) {
      navigateTo("manage", { sub, savePrevious: screen })
    }
  }

  const returnToPrevious = () => {
    // Use browser history.back() so the popstate handler takes care of state
    window.history.back()
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
        renewal_date: formatLocalDate(data.renewalDate),
        cancel_url: data.cancelUrl,
      })
      toast(`${data.name} added!`, "success")
      navigateTo("dashboard", { tab: "home" })
    } catch (error) {
      console.error("Failed to add subscription:", error)
      toast("Failed to add subscription", "error")
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

  const handleNotificationNav = () => {
    navigateTo("notifications", { savePrevious: screen })
  }

  // Render screens
  if (screen === "notifications") {
    return (
      <Notifications
        notifications={notifications}
        onBack={returnToPrevious}
        onNotificationClick={handleNotificationClick}
        onVerifyCancellation={handleVerifyCancellationFromNotification}
        onRemindAgain={handleRemindAgain}
        onDelete={deleteNotif}
        onDeleteAll={deleteAllNotifications}
        onMarkAsUnread={markAsUnread}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
    )
  }

  if (screen === "addStep1") {
    return (
      <AddSubscriptionStep1
        onBack={() => window.history.back()}
        onSelectService={(id, customName) => {
          setCustomServiceName(customName ?? null)
          navigateTo("addStep2", { service: id })
        }}
        onSearch={() => {}}
      />
    )
  }

  if (screen === "addStep2" && selectedService) {
    // Store selectedService in a const that TypeScript knows is non-null
    const currentSelectedService = selectedService

    // Check if this is a service from database (service:slug) or custom (custom:name)
    const isDbService = currentSelectedService.startsWith("service:")
    const serviceSlug = isDbService ? currentSelectedService.replace("service:", "") : null
    const customName = currentSelectedService.startsWith("custom:")
      ? currentSelectedService.replace("custom:", "")
      : null

    // For database services, we'll fetch the full details
    // For custom services, we generate info from the name
    const ServiceStep2Wrapper = () => {
      const [serviceInfo, setServiceInfo] = useState<{
        id: string
        name: string
        logo: string
        logoColor: string
        domain: string | null
        priceMonthly?: number | null
        priceYearly?: number | null
        cancelUrl?: string | null
      } | null>(null)
      const [loading, setLoading] = useState(true)

      useEffect(() => {
        async function loadService() {
          if (serviceSlug) {
            // Fetch from database
            const dbService = await getServiceBySlug(serviceSlug)
            if (dbService) {
              setServiceInfo({
                id: dbService.id,
                name: dbService.name,
                logo: getServiceLogoUrl(dbService, dbService.domain),
                logoColor: dbService.logo_color,
                domain: dbService.domain,
                priceMonthly: dbService.price_monthly,
                priceYearly: dbService.price_yearly,
                cancelUrl: dbService.cancel_url,
              })
            } else {
              // Fallback if service not found
              const fallbackName = serviceSlug
              setServiceInfo({
                id: currentSelectedService,
                name: fallbackName,
                logo: getFallbackLogoUrl(nameToDomain(fallbackName)),
                logoColor: stringToColor(fallbackName),
                domain: nameToDomain(fallbackName),
              })
            }
          } else if (customName) {
            // Custom service - generate info
            const domain = nameToDomain(customName)
            setServiceInfo({
              id: currentSelectedService,
              name: customName,
              logo: getFallbackLogoUrl(domain),
              logoColor: stringToColor(customName),
              domain: domain,
            })
          } else {
            // Shouldn't happen, but handle gracefully
            setServiceInfo({
              id: currentSelectedService,
              name: "Unknown Service",
              logo: "",
              logoColor: "#6366f1",
              domain: null,
            })
          }
          setLoading(false)
        }
        loadService()
      }, [])

      if (loading || !serviceInfo) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="h-8 w-8 motion-safe:animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )
      }

      return (
        <AddSubscriptionStep2
          service={serviceInfo}
          onBack={() => window.history.back()}
          onSave={async (data) => {
            const priceNum = parseFloat(data.price.replace(/[^0-9.]/g, "")) || 0

            handleAddSubscription({
              name: serviceInfo.name,
              logo: serviceInfo.domain
                ? getFallbackLogoUrl(serviceInfo.domain)
                : getInitials(serviceInfo.name),
              logoColor: serviceInfo.logoColor,
              price: priceNum,
              billingCycle: data.cycle as BillingCycle,
              renewalDate: data.date,
              cancelUrl: serviceInfo.cancelUrl ?? undefined,
            })
          }}
        />
      )
    }

    return <ServiceStep2Wrapper />
  }

  if (screen === "manage" && selectedSub) {
    return (
      <>
        <SubscriptionManagement
          subscription={selectedSub}
          onBack={returnToPrevious}
          onRestore={async () => {
            try {
              await restoreSubscription(selectedSub.id)
              toast(`${selectedSub.name} restored!`, "success")
            } catch (error) {
              console.error("Failed to restore subscription:", error)
              toast("Failed to restore subscription", "error")
            }
            returnToPrevious()
          }}
          onDelete={async () => {
            try {
              await deleteSubscription(selectedSub.id)
              toast(`${selectedSub.name} removed`, "success")
            } catch (error) {
              console.error("Failed to delete subscription:", error)
              toast("Failed to remove subscription", "error")
            }
            returnToPrevious()
          }}
          onSave={async (data) => {
            try {
              await updateSubscription(selectedSub.id, {
                price: data.price,
                billingCycle: data.billingCycle as BillingCycle,
                renewalDate: data.renewalDate,
              })
              toast("Changes saved", "success")
            } catch (error) {
              console.error("Failed to update subscription:", error)
              toast("Failed to save changes", "error")
            }
            returnToPrevious()
          }}
          onCancelProceed={async () => {
            try {
              await recordCancelAttempt(selectedSub.id)
            } catch (error) {
              console.error("Failed to record cancel attempt:", error)
            }
          }}
          onCancelConfirm={async () => {
            try {
              await verifyCancellation(selectedSub.id)
              toast(`${selectedSub.name} cancelled — nice work!`, "success")
            } catch (error) {
              console.error("Failed to verify cancellation:", error)
              toast("Failed to confirm cancellation", "error")
            }
          }}
          onCancelNotYet={async () => {
            try {
              await resetCancelAttempt(selectedSub.id)
            } catch (error) {
              console.error("Failed to reset cancel attempt:", error)
            }
          }}
          onCancelComplete={() => {
            setSelectedSub(null)
            navigateTo("dashboard", { tab: "home" })
          }}
        />
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
        onNotificationClick={handleNotificationNav}
        notificationCount={unreadCount}
        onAddSubscription={() => navigateTo("addStep1")}
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
          onNotificationClick={handleNotificationNav}
          notificationCount={unreadCount}
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
      totalMonthly={totalMonthly}
      subscriptions={subscriptions}
      onAddSubscription={() => navigateTo("addStep1")}
      onSubscriptionClick={handleSubscriptionClick}
      onNotificationClick={handleNotificationNav}
      notificationCount={unreadCount}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  )
}
