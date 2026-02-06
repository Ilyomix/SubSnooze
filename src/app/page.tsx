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
  Onboarding,
  About,
  FAQ,
  Changelog,
} from "@/components"
import { useUser } from "@/hooks/useUser"
import { useSubscriptions } from "@/hooks/useSubscriptions"
import { useNotifications } from "@/hooks/useNotifications"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { useToast } from "@/hooks/useToast"
import { useServiceWorker } from "@/hooks/useServiceWorker"
import { useScrollRestore } from "@/hooks/useScrollRestore"
import { usePullToRefresh } from "@/hooks/usePullToRefresh"
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
  | "about"
  | "faq"
  | "changelog"

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

  // Register PWA service worker
  useServiceWorker()

  // Scroll position restoration
  const { save: saveScroll, restore: restoreScroll } = useScrollRestore()

  const [screen, setScreen] = useState<Screen>("dashboard")
  const [modal, setModal] = useState<Modal>(null)
  const [activeTab, setActiveTab] = useState<"home" | "subs" | "settings">("home")
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [previousScreen, setPreviousScreen] = useState<Screen>("dashboard")
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [customServiceName, setCustomServiceName] = useState<string | null>(null)
  const [totalSaved, setTotalSaved] = useState(0)

  // Onboarding state — check localStorage to see if user has completed it
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false
    return !localStorage.getItem("subsnooze_onboarded")
  })

  const isInitialLoading = userLoading || subsLoading
  const [showLoadingUI, setShowLoadingUI] = useState(false)
  const loadingShownAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (isInitialLoading) {
      const delayTimer = window.setTimeout(() => {
        loadingShownAtRef.current = Date.now()
        setShowLoadingUI(true)
      }, 150)

      return () => {
        window.clearTimeout(delayTimer)
      }
    }

    if (!showLoadingUI) return

    const shownAt = loadingShownAtRef.current ?? Date.now()
    const elapsed = Date.now() - shownAt
    const remaining = Math.max(0, 300 - elapsed)

    const hideTimer = window.setTimeout(() => {
      setShowLoadingUI(false)
      loadingShownAtRef.current = null
    }, remaining)

    return () => {
      window.clearTimeout(hideTimer)
    }
  }, [isInitialLoading, showLoadingUI])

  // Pull-to-refresh — only on tab screens
  const isTabScreen = screen === "dashboard" || screen === "allSubs" || screen === "settings"
  const { pulling, refreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh: async () => {
      await subsRefetch()
    },
    enabled: isTabScreen,
  })

  // Track whether we're handling a popstate to avoid pushing duplicate history entries
  const isPopstateRef = useRef(false)
  // Ref to always read the latest activeTab without stale closures
  const activeTabRef = useRef(activeTab)
  activeTabRef.current = activeTab
  // Ref to track previous screen for scroll save
  const prevScreenRef = useRef<Screen>(screen)

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
    // Save scroll position of current screen before navigating away
    saveScroll(prevScreenRef.current)

    if (options?.savePrevious !== undefined) setPreviousScreen(options.savePrevious)
    if (options?.sub !== undefined) setSelectedSub(options.sub)
    if (options?.service !== undefined) setSelectedService(options.service)
    if (options?.tab !== undefined) setActiveTab(options.tab)

    setScreen(newScreen)
    prevScreenRef.current = newScreen

    // Restore scroll position for tab screens, reset for detail screens
    const tabScreens: Screen[] = ["dashboard", "allSubs", "settings"]
    if (tabScreens.includes(newScreen)) {
      restoreScroll(newScreen)
    } else {
      window.scrollTo(0, 0)
    }

    // Push history entry unless we're responding to browser back/forward
    if (!isPopstateRef.current) {
      const state = { screen: newScreen, tab: options?.tab ?? activeTabRef.current }
      window.history.pushState(state, "", undefined)
    }
  }, [saveScroll, restoreScroll])

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

  // Request push notification permission (skip if onboarding not completed)
  useEffect(() => {
    if (isAuthenticated && permission === "default" && !showOnboarding) {
      const timer = setTimeout(() => {
        requestPermission()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, permission, requestPermission, showOnboarding])

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

  // Chain-add state: show "Add another?" prompt after adding a subscription
  const [showAddAnother, setShowAddAnother] = useState(false)

  // Show skeleton while loading
  if (isInitialLoading || showLoadingUI) {
    if (!showLoadingUI) {
      return <div className="min-h-screen bg-background" />
    }
    return <DashboardSkeleton />
  }

  // Show onboarding for new users
  if (isAuthenticated && showOnboarding) {
    return (
      <Onboarding
        onComplete={() => {
          localStorage.setItem("subsnooze_onboarded", "1")
          setShowOnboarding(false)
        }}
        onRequestNotifications={() => {
          requestPermission()
        }}
      />
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
      toast("Subscription added")
      setShowAddAnother(true)
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

  // Pull-to-refresh indicator
  const pullIndicator = (pulling || refreshing) && (
    <div
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center motion-safe:transition-transform"
      style={{ transform: `translateY(${pullDistance - 40}px)` }}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-card ${refreshing ? "motion-safe:animate-spin" : ""}`}>
        <svg
          className="h-5 w-5 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          style={{ transform: `rotate(${progress * 360}deg)`, opacity: Math.max(0.3, progress) }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </div>
  )

  // Render screens
  if (screen === "about") {
    return (
      <div className="motion-safe:animate-[screen-slide-in_0.25s_ease-out]">
        <About onBack={returnToPrevious} />
      </div>
    )
  }

  if (screen === "faq") {
    return (
      <div className="motion-safe:animate-[screen-slide-in_0.25s_ease-out]">
        <FAQ onBack={returnToPrevious} />
      </div>
    )
  }

  if (screen === "changelog") {
    return (
      <div className="motion-safe:animate-[screen-slide-in_0.25s_ease-out]">
        <Changelog onBack={returnToPrevious} />
      </div>
    )
  }

  if (screen === "notifications") {
    return (
      <div className="motion-safe:animate-[screen-slide-in_0.25s_ease-out]">
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
      </div>
    )
  }

  if (screen === "addStep1") {
    return (
      <div className="motion-safe:animate-[screen-slide-in_0.25s_ease-out]">
      <AddSubscriptionStep1
        onBack={() => window.history.back()}
        onSelectService={(id, customName) => {
          setCustomServiceName(customName ?? null)
          navigateTo("addStep2", { service: id })
        }}
        onSearch={() => {}}
      />
      </div>
    )
  }

  if (screen === "addStep2" && selectedService) {
    // Show "Add another?" prompt after successful save
    if (showAddAnother) {
      return (
        <div className="motion-safe:animate-[fade-in_0.2s_ease-out] flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-text-primary">Added!</h2>
            <p className="mt-1 text-sm text-text-secondary">Want to add another subscription?</p>
          </div>
          <div className="flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={() => {
                setShowAddAnother(false)
                setSelectedService(null)
                setCustomServiceName(null)
                navigateTo("addStep1")
              }}
              className="w-full rounded-xl bg-primary py-4 text-base font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Add another
            </button>
            <button
              onClick={() => {
                setShowAddAnother(false)
                navigateTo("dashboard", { tab: "home" })
              }}
              className="w-full rounded-xl border border-divider py-4 text-base font-semibold text-text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Done for now
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="motion-safe:animate-[screen-slide-in_0.25s_ease-out]">
      <ServiceStep2Loader
        selectedService={selectedService}
        customServiceName={customServiceName}
        onBack={() => window.history.back()}
        onAdd={handleAddSubscription}
      />
      </div>
    )
  }

  if (screen === "manage" && selectedSub) {
    return (
      <div className="motion-safe:animate-[screen-slide-in_0.25s_ease-out]">
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
      </div>
    )
  }

  if (screen === "allSubs") {
    return (
      <>
      {pullIndicator}
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
      </>
    )
  }

  if (screen === "settings") {
    return (
      <>
        {pullIndicator}
        <Settings
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onUpgrade={() => setModal("upgrade")}
          onNotificationClick={handleNotificationNav}
          notificationCount={unreadCount}
          onAboutClick={() => navigateTo("about", { savePrevious: "settings" })}
          onFAQClick={() => navigateTo("faq", { savePrevious: "settings" })}
          onChangelogClick={() => navigateTo("changelog", { savePrevious: "settings" })}
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
    <>
      {pullIndicator}
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
    </>
  )
}
