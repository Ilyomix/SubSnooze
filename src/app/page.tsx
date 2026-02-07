"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Dashboard,
  AllSubscriptions,
  Settings,
  Notifications,
  AddSubscriptionWizard,
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
import { formatLocalDate } from "@/lib/date-utils"
import { PRICING } from "@/lib/stripe/pricing"
import { initSentry, setUser as setSentryUser } from "@/lib/sentry/client"
import { identifyUser, resetUser, trackScreenView, trackAddSubscription, trackCancelSubscription, trackDeleteSubscription, trackRestoreSubscription, trackUpgradeClick, trackUpgradeComplete, trackOnboardingComplete } from "@/lib/analytics/events"
import { reportWebVitals } from "@/lib/analytics/web-vitals"

type Screen =
  | "dashboard"
  | "allSubs"
  | "settings"
  | "notifications"
  | "addSub"
  | "manage"
  | "about"
  | "faq"
  | "changelog"

type Modal = "upgrade" | null

export default function Home() {
  const { firstName, isPremium, loading: userLoading, isAuthenticated, refreshProfile } = useUser()
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

  // Initialize monitoring
  useEffect(() => {
    initSentry()
    reportWebVitals()
  }, [])

  // Identify user for analytics + error tracking
  useEffect(() => {
    if (isAuthenticated) {
      const userId = subscriptions.length > 0 ? "authenticated" : "new"
      identifyUser(userId, { isPremium, subscriptionCount: subscriptions.length })
      setSentryUser(userId)
    } else {
      resetUser()
      setSentryUser(null)
    }
  }, [isAuthenticated, isPremium, subscriptions.length])

  // Scroll position restoration
  const { save: saveScroll, restore: restoreScroll } = useScrollRestore()

  const [screen, setScreen] = useState<Screen>("dashboard")
  const [modal, setModal] = useState<Modal>(null)
  const [activeTab, setActiveTab] = useState<"home" | "subs" | "settings">("home")
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [previousScreen, setPreviousScreen] = useState<Screen>("dashboard")
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
      savePrevious?: Screen
    }
  ) => {
    // Save scroll position of current screen before navigating away
    saveScroll(prevScreenRef.current)

    if (options?.savePrevious !== undefined) setPreviousScreen(options.savePrevious)
    if (options?.sub !== undefined) setSelectedSub(options.sub)
    if (options?.tab !== undefined) setActiveTab(options.tab)

    setScreen(newScreen)
    prevScreenRef.current = newScreen
    trackScreenView(newScreen)

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

  // Handle ?upgrade=success query param (Stripe redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const upgrade = params.get("upgrade")
    if (upgrade === "success") {
      toast("Welcome to Pro! All features unlocked.", "success")
      refreshProfile()
      trackUpgradeComplete()
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname)
    } else if (upgrade === "cancelled") {
      toast("Upgrade cancelled — no worries, decide later!", "info")
      window.history.replaceState({}, "", window.location.pathname)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Free tier subscription count
  const activeSubscriptionCount = subscriptions.filter((s) => s.status !== "cancelled").length
  const isAtFreeLimit = !isPremium && activeSubscriptionCount >= PRICING.FREE_SUBSCRIPTION_LIMIT

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
          trackOnboardingComplete()
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

  // Gate "Add subscription" behind free tier limit
  const handleAddSubClick = () => {
    if (isAtFreeLimit) {
      trackUpgradeClick()
      setModal("upgrade")
      return
    }
    navigateTo("addSub")
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
      trackAddSubscription({ name: data.name, billingCycle: data.billingCycle, price: data.price })
      return true
    } catch (error) {
      console.error("Failed to add subscription:", error)
      toast("Couldn't add subscription. Try again.", "error")
      return false
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

  if (screen === "addSub") {
    return (
      <div className="motion-safe:animate-[screen-slide-in_0.25s_ease-out]">
      <AddSubscriptionWizard
        onBack={() => window.history.back()}
        onAdd={handleAddSubscription}
        onDoneForNow={() => navigateTo("dashboard", { tab: "home" })}
        canAddMore={() => !isAtFreeLimit}
        onHitLimit={() => {
          trackUpgradeClick()
          navigateTo("dashboard", { tab: "home" })
          setModal("upgrade")
        }}
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
              trackRestoreSubscription(selectedSub.name)
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
              trackDeleteSubscription(selectedSub.name)
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
              const monthlyPrice = selectedSub.billingCycle === "yearly" ? selectedSub.price / 12 : selectedSub.billingCycle === "weekly" ? selectedSub.price * 4.33 : selectedSub.price
              trackCancelSubscription({ name: selectedSub.name, monthlyPrice })
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
        onAddSubscription={handleAddSubClick}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNotificationClick={handleNotificationNav}
        notificationCount={unreadCount}
        error={subsError}
        onRetry={subsRefetch}
      />
      {modal === "upgrade" && (
        <UpgradeModal
          onUpgrade={() => setModal(null)}
          onClose={() => setModal(null)}
          isPremium={isPremium}
        />
      )}
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
          isPremium={isPremium}
        />
        {modal === "upgrade" && (
          <UpgradeModal
            onUpgrade={() => setModal(null)}
            onClose={() => setModal(null)}
            isPremium={isPremium}
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
        onAddSubscription={handleAddSubClick}
        onSubscriptionClick={handleSubscriptionClick}
        onNotificationClick={handleNotificationNav}
        notificationCount={unreadCount}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        error={subsError}
        onRetry={subsRefetch}
      />
      {modal === "upgrade" && (
        <UpgradeModal
          onUpgrade={() => setModal(null)}
          onClose={() => setModal(null)}
          isPremium={isPremium}
        />
      )}
    </>
  )
}
