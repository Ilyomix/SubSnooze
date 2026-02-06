"use client"

import { useState, useEffect, useCallback } from "react"

type Theme = "light" | "dark" | "system"

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return
  const resolved = theme === "system" ? getSystemTheme() : theme
  const html = document.documentElement
  if (resolved === "dark") {
    html.classList.add("dark")
  } else {
    html.classList.remove("dark")
  }
  // Update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#1A1918" : "#F8F7F4")
  }
}

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system"
    return (localStorage.getItem("subsnooze_theme") as Theme) || "system"
  })

  // Apply theme on mount and changes
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem("subsnooze_theme", theme)
  }, [theme])

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyTheme("system")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  const setLight = useCallback(() => setTheme("light"), [])
  const setDark = useCallback(() => setTheme("dark"), [])
  const setSystem = useCallback(() => setTheme("system"), [])
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const resolved = prev === "system" ? getSystemTheme() : prev
      return resolved === "dark" ? "light" : "dark"
    })
  }, [])

  const isDark = theme === "system" ? getSystemTheme() === "dark" : theme === "dark"

  return { theme, isDark, setLight, setDark, setSystem, toggle }
}
