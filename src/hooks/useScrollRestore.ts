"use client"

import { useRef, useCallback, useEffect } from "react"

/**
 * Saves and restores scroll position keyed by screen name.
 * Call `save(screen)` before navigating away, and `restore(screen)` after navigating back.
 */
export function useScrollRestore() {
  const positions = useRef<Map<string, number>>(new Map())

  const save = useCallback((screen: string) => {
    positions.current.set(screen, window.scrollY)
  }, [])

  const restore = useCallback((screen: string) => {
    const pos = positions.current.get(screen)
    if (pos !== undefined) {
      // Use requestAnimationFrame to ensure DOM has updated before scrolling
      requestAnimationFrame(() => {
        window.scrollTo(0, pos)
      })
    } else {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0)
      })
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    const map = positions.current
    return () => {
      map.clear()
    }
  }, [])

  return { save, restore }
}
