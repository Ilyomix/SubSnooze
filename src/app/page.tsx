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
  DashboardSkeleton,
} from "@/components"
import { useUser } from "@/hooks/useUser"
import { useSubscriptions } from "@/hooks/useSubscriptions"
import { useNotifications } from "@/hooks/useNotifications"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { useToast } from "@/hooks/useToast"
import type { Subscription } from "@/types/subscription"
import type { BillingCycle } from "@/types/database"
import { getServiceBySlug, getServiceLogoUrl, getFallbackLogoUrl, getInitials, stringToColor, nameToDomain } from "@/lib/services"
import { formatLocalDate } from "@/lib/date-utils"

// Extracted outside Home render to prevent remount on every re-render (IC-5/ADD2-5/NAV-7)
function ServiceStep2Loader({
  selectedService,
  customServiceName,
  onBack,
  onAdd,
}: {
  selectedService: string
  customServiceName: string | null
  onBack: () => void
  onAdd: (data: { name: string; logo: string; logoColor: string; price: number; billingCycle: BillingCycle; renewalDate: Date; cancelUrl?: string }) => void
}) {
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

  const isDbService = selectedService.startsWith("service:")
  const serviceSlug = isDbService ? selectedService.replace("service:", "") : null
  const customName = selectedService.startsWith("custom:")
    ? selectedService.replace("custom:", "")
    : customServiceName

  useEffect(() => {
    async function loadService() {
      if (serviceSlug) {
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
          const fallbackName = serviceSlug
          setServiceInfo({
            id: selectedService,
            name: fallbackName,
            logo: getFallbackLogoUrl(nameToDomain(fallbackName)),
            logoColor: stringToColor(fallbackName),
            domain: nameToDomain(fallbackName),
          })
        }
      } else if (customName) {
        const domain = nameToDomain(customName)
        setServiceInfo({
          id: selectedService,
          name: customName,
          logo: getFallbackLogoUrl(domain),
          logoColor: stringToColor(customName),
          domain: domain,
        })
      } else {
        setServiceInfo({
          id: selectedService,
          name: "Unknown Service",
          logo: "",
          logoColor: "#6366f1",
          domain: null,
        })
      }
      setLoading(false)
    }
    loadService()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService])

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
      onBack={onBack}
      onSave={async (data) => {
        const priceNum = parseFloat(data.price.replace(/[^0-9.]/g, "")) || 0
        onAdd({
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
    error: subsError,
    refetch: subsRefetch,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    recordCancelAttempt,
    verifyCancellation,
    resetCancelAttempt,
    restoreSubscription,
  } = useSubscriptions()
  const { toast } = useToast()
  const { notifications, unreadCount, markAsRead, markAsUnread, deleteNotification: deleteNotif, deleteAllNotifications, hasMore, loadingMore, loadMore } = useNotifications()
  const { requestPermission, permission } = usePushNotifications()

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

  // Show skeleton while loading
  if (userLoading || subsLoading) {
    return <DashboardSkeleton />
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
      toast("Subscription added")
      navigateTo("dashboard", { tab: "home" })
    } catch (error) {
      console.error("Failed to add subscription:", error)
      toast("Couldn\u2019t add subscription. Try again.", "error")
    }
  }

  const handleNotificationClick = (id: string, subscriptionId?: string) => {
    markAsRead(id)
    // Navigate to the related subscription if available
    if (subscriptionId) {
      const sub = subscriptions.find((s) => s.id === subscriptionId)
      if (sub) {
        navigateTo("manage", { sub, savePrevious: "notifications" })
        return
      }
    }
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
        onNotificationClick={(id: string, subscriptionId?: string) => handleNotificationClick(id, subscriptionId)}
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
    return (
      <ServiceStep2Loader
        selectedService={selectedService}
        customServiceName={customServiceName}
        onBack={() => window.history.back()}
        onAdd={handleAddSubscription}
      />
    )
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
              toast("Subscription restored")
              returnToPrevious()
            } catch (error) {
              console.error("Failed to restore subscription:", error)
              toast("Couldn\u2019t restore. Try again.", "error")
            }
          }}
          onDelete={async () => {
            try {
              await deleteSubscription(selectedSub.id)
              toast("Removed from list")
              returnToPrevious()
            } catch (error) {
              console.error("Failed to delete subscription:", error)
              toast("Couldn\u2019t remove. Try again.", "error")
            }
          }}
          onSave={async (data) => {
            try {
              await updateSubscription(selectedSub.id, {
                price: data.price,
                billingCycle: data.billingCycle as BillingCycle,
                renewalDate: data.renewalDate,
              })
              toast("Changes saved")
              returnToPrevious()
            } catch (error) {
              console.error("Failed to update subscription:", error)
              toast("Couldn\u2019t save changes. Try again.", "error")
            }
          }}
          onCancelProceed={async () => {
            try {
              await recordCancelAttempt(selectedSub.id)
            } catch (error) {
              console.error("Failed to record cancel attempt:", error)
              toast("Something went wrong. Try again.", "error")
            }
          }}
          onCancelConfirm={async () => {
            try {
              await verifyCancellation(selectedSub.id)
            } catch (error) {
              console.error("Failed to verify cancellation:", error)
              toast("Couldn\u2019t confirm cancellation. Try again.", "error")
            }
          }}
          onCancelNotYet={async () => {
            try {
              await resetCancelAttempt(selectedSub.id)
            } catch (error) {
              console.error("Failed to reset cancel attempt:", error)
              toast("Something went wrong.", "error")
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
        onAddSubscription={() => navigateTo("addStep1")}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNotificationClick={handleNotificationNav}
        notificationCount={unreadCount}
        error={subsError}
        onRetry={subsRefetch}
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
      error={subsError}
      onRetry={subsRefetch}
    />
  )
}
