"use client"

import { useRef, useEffect, useCallback, useState } from "react"

const THRESHOLD = 80 // px to pull before triggering refresh
const MAX_PULL = 120

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  enabled?: boolean
}

export function usePullToRefresh({ onRefresh, enabled = true }: UsePullToRefreshOptions) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startYRef = useRef(0)
  const pullingRef = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || refreshing) return
    // Only start pull if scrolled to top
    if (window.scrollY > 0) return
    startYRef.current = e.touches[0].clientY
  }, [enabled, refreshing])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || refreshing || startYRef.current === 0) return
    const diff = e.touches[0].clientY - startYRef.current
    if (diff > 10) {
      pullingRef.current = true
      setPulling(true)
      setPullDistance(Math.min(diff, MAX_PULL))
    }
  }, [enabled, refreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!pullingRef.current) {
      startYRef.current = 0
      return
    }
    const wasPastThreshold = pullDistance >= THRESHOLD
    pullingRef.current = false
    setPulling(false)
    startYRef.current = 0

    if (wasPastThreshold) {
      setRefreshing(true)
      setPullDistance(THRESHOLD / 2) // Snap to indicator position
      try {
        await onRefresh()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, onRefresh])

  useEffect(() => {
    if (!enabled) return
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd)
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(pullDistance / THRESHOLD, 1)

  return { pulling, refreshing, pullDistance, progress }
}
