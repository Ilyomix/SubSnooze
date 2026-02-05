"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "./useUser"
import type { Subscription, SubscriptionStatus } from "@/types/subscription"
import { dbToSubscription } from "@/types/subscription"
import { daysUntilRenewal, parseLocalDate, formatLocalDate } from "@/lib/date-utils"
import type { Insertable, Updatable, BillingCycle } from "@/types/database"
import * as api from "@/lib/api/subscriptions"

export function useSubscriptions() {
  const { id: userId } = useUser()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  // Fetch subscriptions (renewal date advancement happens server-side via cron)
  const fetchSubscriptions = useCallback(async () => {
    if (!userId) {
      setSubscriptions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await api.getSubscriptions(userId)
      setSubscriptions(data.map(dbToSubscription))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch subscriptions"))
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initial fetch
  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  // Real-time subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("subscriptions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSubscriptions((prev) => [
              ...prev,
              dbToSubscription(payload.new as Parameters<typeof dbToSubscription>[0]),
            ])
          } else if (payload.eventType === "UPDATE") {
            setSubscriptions((prev) =>
              prev.map((sub) =>
                sub.id === payload.new.id
                  ? dbToSubscription(payload.new as Parameters<typeof dbToSubscription>[0])
                  : sub
              )
            )
          } else if (payload.eventType === "DELETE") {
            setSubscriptions((prev) =>
              prev.filter((sub) => sub.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  // Add subscription (with optimistic update)
  const addSubscription = async (
    data: Omit<Insertable<"subscriptions">, "user_id" | "id">
  ) => {
    if (!userId) throw new Error("Not authenticated")

    const insertData: Insertable<"subscriptions"> = {
      ...data,
      user_id: userId,
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const tempSub: Subscription = {
      id: tempId,
      name: data.name,
      logo: data.logo,
      logoColor: data.logo_color,
      price: data.price,
      billingCycle: data.billing_cycle,
      renewalDate: parseLocalDate(data.renewal_date),
      status: "good",
      cancelUrl: data.cancel_url ?? undefined,
      remindersSent: 0,
      reminder14DaySent: false,
      reminder7DaySent: false,
      reminder3DaySent: false,
      reminder1DaySent: false,
    }
    setSubscriptions((prev) => [...prev, tempSub])

    try {
      const newSub = await api.createSubscription(insertData)
      // Replace temp with real data
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === tempId ? dbToSubscription(newSub) : sub))
      )
      return newSub
    } catch (err) {
      // Rollback on error
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== tempId))
      throw err
    }
  }

  // Update subscription (with optimistic update)
  const updateSubscription = async (
    id: string,
    updates: {
      price?: number
      billingCycle?: BillingCycle
      renewalDate?: Date
    }
  ) => {
    const dbUpdates: Updatable<"subscriptions"> = {}
    if (updates.price !== undefined) dbUpdates.price = updates.price
    if (updates.billingCycle !== undefined) dbUpdates.billing_cycle = updates.billingCycle
    if (updates.renewalDate !== undefined)
      dbUpdates.renewal_date = formatLocalDate(updates.renewalDate)

    // Store previous state for rollback
    const prevSub = subscriptions.find((s) => s.id === id)
    if (!prevSub) throw new Error("Subscription not found")

    // Optimistic update - recalculate status if renewal date changed
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub

        const newRenewalDate = updates.renewalDate ?? sub.renewalDate
        const days = daysUntilRenewal(newRenewalDate)

        // Recalculate status based on new renewal date
        let newStatus: SubscriptionStatus = sub.status
        if (sub.status !== "cancelled") {
          newStatus = days <= 7 ? "renewing_soon" : "good"
        }

        return {
          ...sub,
          ...(updates.price !== undefined && { price: updates.price }),
          ...(updates.billingCycle !== undefined && { billingCycle: updates.billingCycle }),
          ...(updates.renewalDate !== undefined && { renewalDate: updates.renewalDate }),
          status: newStatus,
        }
      })
    )

    try {
      await api.updateSubscription(id, dbUpdates)
    } catch (err) {
      // Rollback on error
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? prevSub : sub))
      )
      throw err
    }
  }

  // Cancel subscription (with optimistic update)
  const cancelSubscription = async (id: string) => {
    const prevSub = subscriptions.find((s) => s.id === id)
    if (!prevSub) throw new Error("Subscription not found")

    // Optimistic update
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, status: "cancelled" as const } : sub
      )
    )

    try {
      await api.cancelSubscription(id)
    } catch (err) {
      // Rollback on error
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? prevSub : sub))
      )
      throw err
    }
  }

  // Delete subscription (with optimistic update)
  const deleteSubscription = async (id: string) => {
    const prevSubs = subscriptions
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id))

    try {
      await api.deleteSubscription(id)
    } catch (err) {
      setSubscriptions(prevSubs)
      throw err
    }
  }

  // Record cancel attempt (when user goes to external site)
  const recordCancelAttempt = async (id: string) => {
    const prevSub = subscriptions.find((s) => s.id === id)
    if (!prevSub) throw new Error("Subscription not found")

    // Optimistic update
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, cancelAttemptDate: new Date(), cancelVerified: false }
          : sub
      )
    )

    try {
      await api.recordCancelAttempt(id)
    } catch (err) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? prevSub : sub))
      )
      throw err
    }
  }

  // Verify cancellation (user confirms they canceled)
  const verifyCancellation = async (id: string) => {
    const prevSub = subscriptions.find((s) => s.id === id)
    if (!prevSub) throw new Error("Subscription not found")

    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, cancelVerified: true, status: "cancelled" as const }
          : sub
      )
    )

    try {
      await api.verifyCancellation(id)
    } catch (err) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? prevSub : sub))
      )
      throw err
    }
  }

  // Reset cancel attempt (user wants to be reminded again)
  const resetCancelAttempt = async (id: string) => {
    const prevSub = subscriptions.find((s) => s.id === id)
    if (!prevSub) throw new Error("Subscription not found")

    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, cancelAttemptDate: undefined, cancelVerified: undefined }
          : sub
      )
    )

    try {
      await api.resetCancelAttempt(id)
    } catch (err) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? prevSub : sub))
      )
      throw err
    }
  }

  // Restore subscription (reactivate a cancelled subscription)
  const restoreSubscription = async (id: string) => {
    const prevSub = subscriptions.find((s) => s.id === id)
    if (!prevSub) throw new Error("Subscription not found")

    // Calculate new status based on days until renewal
    const days = daysUntilRenewal(prevSub.renewalDate)
    const newStatus: SubscriptionStatus = days <= 7 ? "renewing_soon" : "good"

    // Optimistic update
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              status: newStatus,
              cancelAttemptDate: undefined,
              cancelVerified: undefined,
            }
          : sub
      )
    )

    try {
      await api.restoreSubscription(id)
    } catch (err) {
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? prevSub : sub))
      )
      throw err
    }
  }

  // Derived data
  const renewingSoon = subscriptions.filter((s) => s.status === "renewing_soon")
  const allGood = subscriptions.filter((s) => s.status === "good")
  const cancelled = subscriptions.filter((s) => s.status === "cancelled")

  const totalMonthly = subscriptions
    .filter((s) => s.status !== "cancelled")
    .reduce((sum, s) => {
      if (s.billingCycle === "yearly") return sum + s.price / 12
      if (s.billingCycle === "weekly") return sum + s.price * 4.33
      return sum + s.price
    }, 0)

  return {
    subscriptions,
    renewingSoon,
    allGood,
    cancelled,
    totalMonthly,
    loading,
    error,
    refetch: fetchSubscriptions,
    addSubscription,
    updateSubscription,
    cancelSubscription,
    deleteSubscription,
    recordCancelAttempt,
    verifyCancellation,
    resetCancelAttempt,
    restoreSubscription,
  }
}
