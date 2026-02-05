"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "./useUser"
import type { Notification } from "@/types/subscription"
import { dbToNotification } from "@/types/subscription"
import * as api from "@/lib/api/notifications"

export function useNotifications() {
  const { id: userId } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const supabase = createClient()

  // Fetch first page of notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setPage(0)
      const { data, total } = await api.getNotifications(userId, 0)
      const mapped = data.map(dbToNotification)
      setNotifications(mapped)
      setHasMore(mapped.length < total)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch notifications"))
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Load next page
  const loadMore = useCallback(async () => {
    if (!userId || loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      const nextPage = page + 1
      const { data, total } = await api.getNotifications(userId, nextPage)
      const mapped = data.map(dbToNotification)
      setNotifications((prev) => [...prev, ...mapped])
      setPage(nextPage)
      setHasMore(notifications.length + mapped.length < total)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more notifications"))
    } finally {
      setLoadingMore(false)
    }
  }, [userId, loadingMore, hasMore, page, notifications.length])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [
              dbToNotification(payload.new as Parameters<typeof dbToNotification>[0]),
              ...prev,
            ])
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === payload.new.id
                  ? dbToNotification(payload.new as Parameters<typeof dbToNotification>[0])
                  : notif
              )
            )
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) =>
              prev.filter((notif) => notif.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    const prevNotifs = notifications
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    )

    try {
      await api.markAsRead(id)
    } catch (err) {
      setNotifications(prevNotifs)
      throw err
    }
  }

  // Mark single notification as unread
  const markAsUnread = async (id: string) => {
    const prevNotifs = notifications
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: false } : notif))
    )

    try {
      await api.markAsUnread(id)
    } catch (err) {
      setNotifications(prevNotifs)
      throw err
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userId) return

    const prevNotifs = notifications
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))

    try {
      await api.markAllAsRead(userId)
    } catch (err) {
      setNotifications(prevNotifs)
      throw err
    }
  }

  // Delete notification
  const deleteNotification = async (id: string) => {
    const prevNotifs = notifications
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))

    try {
      await api.deleteNotification(id)
    } catch (err) {
      setNotifications(prevNotifs)
      throw err
    }
  }

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!userId) return

    const prevNotifs = notifications
    setNotifications([])

    try {
      await api.deleteAllNotifications(userId)
    } catch (err) {
      setNotifications(prevNotifs)
      throw err
    }
  }

  // Derived data
  const unreadCount = notifications.filter((n) => !n.read).length
  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  return {
    notifications,
    unread,
    read,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    error,
    refetch: fetchNotifications,
    loadMore,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  }
}
