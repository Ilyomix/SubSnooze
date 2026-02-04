// Subscription services utilities for SubSnooze
// Fetches services from Supabase database with logo URLs stored directly
// Falls back to Google Favicons API when logo_url is missing

import { createClient } from "@/lib/supabase/client"
import type { DbSubscriptionService } from "@/types/database"

// Re-export the service type for convenience
export type SubscriptionService = DbSubscriptionService

// Popular service slugs (shown on initial screen before search)
export const POPULAR_SERVICE_SLUGS = [
  "netflix", "spotify", "disney-plus", "youtube-premium", "amazon-prime",
  "apple-music", "hbo-max", "hulu", "chatgpt", "adobe-creative-cloud",
  "microsoft-365", "notion", "figma", "github", "slack",
  "dropbox", "icloud", "google-one", "nordvpn", "canva",
  "audible", "duolingo", "linkedin-premium", "coursera", "masterclass",
]

// Google Favicons API as fallback (lower quality but reliable)
export function getFallbackLogoUrl(domain: string, size: number = 128): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
}

// Get logo URL from service or generate fallback
export function getServiceLogoUrl(service: SubscriptionService | null, domain?: string): string {
  if (service?.logo_url) {
    return service.logo_url
  }
  const d = service?.domain || domain
  if (d) {
    return getFallbackLogoUrl(d)
  }
  return ""
}

// Convert a service name to a probable domain
export function nameToDomain(name: string): string {
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
  return `${cleaned}.com`
}

// Generate initials for fallback avatar
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Generate color from string (deterministic)
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    "#E50914", "#1DB954", "#113CCF", "#FF9900", "#0078D4",
    "#4A154B", "#F24E1E", "#00A8E1", "#FC4C02", "#9146FF"
  ]
  return colors[Math.abs(hash) % colors.length]
}

// Fetch popular services from database
export async function getPopularServices(): Promise<SubscriptionService[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("subscription_services")
    .select("*")
    .in("slug", POPULAR_SERVICE_SLUGS)
    .eq("status", "active")
    .order("name")

  if (error) {
    console.error("Error fetching popular services:", error)
    return []
  }

  // Sort by the order defined in POPULAR_SERVICE_SLUGS
  const slugOrder = new Map(POPULAR_SERVICE_SLUGS.map((slug, i) => [slug, i]))
  return (data || []).sort((a, b) => {
    const orderA = slugOrder.get(a.slug) ?? 999
    const orderB = slugOrder.get(b.slug) ?? 999
    return orderA - orderB
  })
}

// Search services by name/domain
export async function searchServices(query: string, limit: number = 20): Promise<SubscriptionService[]> {
  if (!query.trim()) {
    return getPopularServices()
  }

  const supabase = createClient()
  const searchTerm = query.trim().toLowerCase()

  // Use ILIKE search for simplicity (RPC function requires additional DB setup)
  const { data, error } = await supabase
    .from("subscription_services")
    .select("*")
    .or(`name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%,domain.ilike.%${searchTerm}%`)
    .eq("status", "active")
    .order("name")
    .limit(limit)

  if (error) {
    console.error("Error searching services:", error)
    return []
  }

  // Sort results to prioritize exact matches
  const sortedData = (data || []).sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const aSlug = a.slug.toLowerCase()
    const bSlug = b.slug.toLowerCase()

    // Exact name match first
    if (aName === searchTerm && bName !== searchTerm) return -1
    if (bName === searchTerm && aName !== searchTerm) return 1

    // Exact slug match second
    if (aSlug === searchTerm && bSlug !== searchTerm) return -1
    if (bSlug === searchTerm && aSlug !== searchTerm) return 1

    // Starts with match third
    if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1
    if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1

    // Alphabetical
    return aName.localeCompare(bName)
  })

  return sortedData
}

// Get a single service by slug
export async function getServiceBySlug(slug: string): Promise<SubscriptionService | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("subscription_services")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("Error fetching service by slug:", error)
    return null
  }

  return data
}

// Get a service by domain
export async function getServiceByDomain(domain: string): Promise<SubscriptionService | null> {
  const supabase = createClient()

  // Normalize domain (remove www., etc.)
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, "")

  const { data, error } = await supabase
    .from("subscription_services")
    .select("*")
    .or(`domain.eq.${normalizedDomain},domain.eq.www.${normalizedDomain}`)
    .eq("status", "active")
    .limit(1)
    .single()

  if (error) {
    return null
  }

  return data
}

// Get all services in a category
export async function getServicesByCategory(category: string): Promise<SubscriptionService[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("subscription_services")
    .select("*")
    .eq("category", category)
    .eq("status", "active")
    .order("name")

  if (error) {
    console.error("Error fetching services by category:", error)
    return []
  }

  return data || []
}

// Get all unique categories
export async function getCategories(): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("subscription_services")
    .select("category")
    .eq("status", "active")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  const categories = [...new Set((data || []).map(d => d.category))]
  return categories.sort()
}
