"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Loader2, Plus } from "lucide-react"
import Image from "next/image"
import { colord } from "colord"
import { DetailShell } from "@/components/layout"
import { Card } from "@/components/ui"
import {
  getFallbackLogoUrl,
  getInitials,
  stringToColor,
  getPopularServices,
  searchServices,
  type SubscriptionService,
} from "@/lib/services"

interface AddSubscriptionStep1Props {
  onBack: () => void
  onSelectService: (serviceId: string, customName?: string) => void
  onSearch: (query: string) => void
}

function ServiceLogo({
  service,
  name,
  domain,
  size = 48,
}: {
  service?: SubscriptionService | null
  name: string
  domain: string
  size?: number
}) {
  // 0 = primary (from DB), 1 = fallback (Google favicon), 2 = initials
  const [logoStage, setLogoStage] = useState(() => {
    // Start at stage 1 (Google favicon) if no DB logo
    return service?.logo_url ? 0 : 1
  })

  const logoUrl = logoStage === 0
    ? service?.logo_url
    : logoStage === 1
      ? getFallbackLogoUrl(domain)
      : null

  const handleError = () => {
    setLogoStage((prev) => prev + 1)
  }

  // Reset when service/domain changes
  useEffect(() => {
    setLogoStage(service?.logo_url ? 0 : 1)
  }, [service?.id, service?.logo_url, domain])

  // Squircle border radius (~22% of size)
  const borderRadius = Math.round(size * 0.22)
  const color = service?.logo_color || stringToColor(name)

  // Show initials as final fallback
  if (logoStage >= 2) {
    return (
      <div
        className="flex items-center justify-center text-white font-bold border border-divider"
        style={{
          backgroundColor: color,
          width: size,
          height: size,
          fontSize: size * 0.35,
          borderRadius,
        }}
      >
        {getInitials(name)}
      </div>
    )
  }

  const padding = Math.round(size * 0.12) // Small padding

  // Create a light tinted background from the brand color
  const bgColor = colord(color).lighten(0.35).desaturate(0.1).toHex()

  // Image with padding and tinted background
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center border border-divider"
      style={{
        backgroundColor: bgColor,
        width: size,
        height: size,
        borderRadius,
        padding,
      }}
    >
      <Image
        src={logoUrl!}
        alt={name}
        width={size - padding * 2}
        height={size - padding * 2}
        className="object-contain"
        onError={handleError}
        unoptimized
      />
    </div>
  )
}

function capitalizeWords(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export function AddSubscriptionStep1({
  onBack,
  onSelectService,
  onSearch,
}: AddSubscriptionStep1Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [services, setServices] = useState<SubscriptionService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  // Load popular services on mount
  useEffect(() => {
    async function loadPopular() {
      setIsLoading(true)
      const popular = await getPopularServices()
      setServices(popular)
      setIsLoading(false)
    }
    loadPopular()
  }, [])

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      const popular = await getPopularServices()
      setServices(popular)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const results = await searchServices(query, 6)
    setServices(results)
    setIsSearching(false)
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, performSearch])

  const trimmedSearch = searchTerm.trim()

  const handleSelectService = (service: SubscriptionService) => {
    // Pass service slug so Step2 can fetch full details
    onSelectService(`service:${service.slug}`)
  }

  const handleAddCustom = () => {
    const capitalizedName = capitalizeWords(searchTerm)
    onSelectService(`custom:${capitalizedName}`)
  }

  // Show custom option when search has results but user may want to add custom
  const showCustomOption = trimmedSearch && !isSearching && !isLoading

  return (
    <DetailShell title="Add Subscription" onBack={onBack}>
      <div className="flex flex-col gap-6 px-6 pt-4">

        {/* Progress Indicator */}
        <div className="flex flex-col items-center gap-2 py-2">
          <span className="text-[13px] font-medium text-text-secondary">Step 1 of 2</span>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <div className="h-0.5 w-10 rounded-sm bg-divider" />
            <div className="h-2.5 w-2.5 rounded-full bg-divider" />
          </div>
          <span className="text-xs text-text-tertiary">Choose a service to track</span>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-3">
          <Card padding="none" className="flex h-12 items-center gap-3 px-4">
            {isSearching ? (
              <Loader2 className="h-[18px] w-[18px] text-text-tertiary animate-spin" />
            ) : (
              <Search className="h-[18px] w-[18px] text-text-tertiary" />
            )}
            <input
              type="text"
              name="service-search"
              placeholder="Search any brand or service…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                onSearch(e.target.value)
              }}
              className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary focus-visible:outline-none"
            />
          </Card>
        </div>

        {/* Custom subscription option when searching */}
        {showCustomOption && (
          <button
            onClick={handleAddCustom}
            className="flex items-center gap-4 rounded-xl bg-surface p-4 motion-safe:transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <Plus className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-medium text-text-primary">
                Add &quot;{capitalizeWords(searchTerm)}&quot;
              </span>
              <span className="text-xs text-text-tertiary">
                Create a custom subscription
              </span>
            </div>
          </button>
        )}

        {/* Services Grid */}
        <div className="flex flex-col gap-4">
          <span className="text-[15px] font-medium text-text-secondary">
            {trimmedSearch ? "Search results" : "Popular services"}
          </span>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-text-tertiary animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-divider bg-surface mb-3">
                <Search className="h-5 w-5 text-text-tertiary" />
              </div>
              <p className="text-sm text-text-tertiary">
                {trimmedSearch ? "No services found — use the option above to add a custom one" : "Start typing to search"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {/* Services from database */}
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  aria-label={`Select ${service.name}`}
                  className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 motion-safe:transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <ServiceLogo
                    service={service}
                    name={service.name}
                    domain={service.domain}
                  />
                  <span className="text-sm font-medium text-text-primary text-center line-clamp-1">
                    {service.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DetailShell>
  )
}
