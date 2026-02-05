"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Loader2 } from "lucide-react"
import { DetailShell } from "@/components/layout"
import { Card, ServiceIcon } from "@/components/ui"
import {
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

function capitalizeWords(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function CustomServiceCard({
  name,
  onSelect,
}: {
  name: string
  onSelect: () => void
}) {
  const capitalizedName = capitalizeWords(name)
  const color = stringToColor(capitalizedName)

  return (
    <button
      onClick={onSelect}
      aria-label={`Add ${capitalizedName} as custom subscription`}
      className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 motion-safe:transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 border-2 border-dashed border-primary/30"
    >
      <ServiceIcon
        name={capitalizedName}
        logoColor={color}
        size={48}
      />
      <span className="text-sm font-medium text-primary text-center line-clamp-1">
        Add "{capitalizedName}"
      </span>
    </button>
  )
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

  const handleSelectCustom = () => {
    const capitalizedName = capitalizeWords(trimmedSearch)
    onSelectService(`custom:${capitalizedName}`)
  }

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

        {/* Services Grid */}
        <div className="flex flex-col gap-4">
          <span className="text-[15px] font-medium text-text-secondary">
            {trimmedSearch ? "Search results" : "Popular services"}
          </span>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-text-tertiary animate-spin" />
            </div>
          ) : services.length === 0 && !trimmedSearch ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-divider bg-surface mb-3">
                <Search className="h-5 w-5 text-text-tertiary" />
              </div>
              <p className="text-sm text-text-tertiary">
                Start typing to search
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {/* Custom subscription option when searching */}
              {trimmedSearch && (
                <CustomServiceCard
                  name={trimmedSearch}
                  onSelect={handleSelectCustom}
                />
              )}
              {/* Services from database */}
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  aria-label={`Select ${service.name}`}
                  className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 motion-safe:transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <ServiceIcon
                    name={service.name}
                    logoColor={service.logo_color}
                    domain={service.domain}
                    size={48}
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
