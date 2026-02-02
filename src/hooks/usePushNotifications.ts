"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useUser } from "./useUser"
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  onForegroundMessage,
  showNotification,
} from "@/lib/firebase/messaging"

export function usePushNotifications() {
  const { id: userId, pushEnabled } = useUser()
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const supabase: SupabaseClient<Database> = createClient()

  // Check initial permission status
  useEffect(() => {
    setPermission(getNotificationPermissionStatus())
  }, [])

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload: unknown) => {
      const p = payload as {
        notification?: { title?: string; body?: string }
        data?: Record<string, unknown>
      }
      // Show notification even when app is in foreground
      if (p.notification) {
        showNotification(p.notification.title || "SubSnooze", {
          body: p.notification.body,
          icon: "/icon-192.png",
        })
      }
    })

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [])

  // Request permission and save token
  const requestPermission = useCallback(async () => {
    if (!userId) {
      setError(new Error("User not authenticated"))
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const fcmToken = await requestNotificationPermission()

      if (fcmToken) {
        // Save token to database
        const { error: updateError } = await supabase
          .from("users")
          .update({
            fcm_token: fcmToken,
            push_enabled: true,
          })
          .eq("id", userId)

        if (updateError) throw updateError

        setToken(fcmToken)
        setPermission("granted")
        return true
      } else {
        setPermission(getNotificationPermissionStatus())
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to enable notifications"))
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  // Disable push notifications
  const disableNotifications = useCallback(async () => {
    if (!userId) return false

    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          push_enabled: false,
        })
        .eq("id", userId)

      if (updateError) throw updateError

      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to disable notifications"))
      return false
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (pushEnabled) {
      return await disableNotifications()
    } else {
      return await requestPermission()
    }
  }, [pushEnabled, disableNotifications, requestPermission])

  return {
    permission,
    token,
    loading,
    error,
    isEnabled: pushEnabled,
    isSupported: typeof window !== "undefined" && "Notification" in window,
    requestPermission,
    disableNotifications,
    toggleNotifications,
  }
}
