"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Loader2, Plus, ChevronDown } from "lucide-react"
import { DetailShell } from "@/components/layout"
import { Card, ServiceIcon, StepProgress } from "@/components/ui"
import {
  stringToColor,
  getPopularServices,
  searchServices,
  getAllServicesAlphabetical,
  getCategories,
  getServicesByCategory,
  type SubscriptionService,
} from "@/lib/services"

interface AddSubscriptionStep1Props {
  onBack: () => void
  onSelectService: (serviceId: string, customName?: string) => void
  onSearch: (query: string) => void
  embedded?: boolean
  showProgress?: boolean
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
        Add &quot;{capitalizedName}&quot;
      </span>
    </button>
  )
}

export function AddSubscriptionStep1({
  onBack,
  onSelectService,
  onSearch,
  embedded = false,
  showProgress = true,
}: AddSubscriptionStep1Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [services, setServices] = useState<SubscriptionService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [browseMode, setBrowseMode] = useState<"popular" | "az" | "categories">("popular")
  const [allServices, setAllServices] = useState<SubscriptionService[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [categoryServices, setCategoryServices] = useState<Record<string, SubscriptionService[]>>({})
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

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

  // Load all services when switching to A-Z mode
  useEffect(() => {
    if (browseMode !== "az" || allServices.length > 0) return
    async function loadAll() {
      setIsLoading(true)
      const all = await getAllServicesAlphabetical()
      setAllServices(all)
      setIsLoading(false)
    }
    loadAll()
  }, [browseMode, allServices.length])

  // Load categories when switching to categories mode
  useEffect(() => {
    if (browseMode !== "categories" || categories.length > 0) return
    async function loadCategories() {
      setIsLoading(true)
      const cats = await getCategories()
      setCategories(cats)
      setIsLoading(false)
    }
    loadCategories()
  }, [browseMode, categories.length])

  // Load services for an expanded category
  useEffect(() => {
    if (!expandedCategory || categoryServices[expandedCategory]) return
    async function loadCategoryServices() {
      const services = await getServicesByCategory(expandedCategory!)
      setCategoryServices((prev) => ({ ...prev, [expandedCategory!]: services }))
    }
    loadCategoryServices()
  }, [expandedCategory, categoryServices])

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

  const content = (
    <div className="flex flex-col gap-6 px-6 pt-4">

        {/* Progress Indicator */}
        {showProgress && (
          <StepProgress current={1} total={2} subtitle="Choose a service to track" className="py-2" />
        )}

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

        {/* Browse Mode Toggle */}
        {!trimmedSearch && (
          <div className="flex items-center gap-1 rounded-xl bg-surface p-1">
            <button
              onClick={() => setBrowseMode("popular")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                browseMode === "popular" ? "bg-primary/10 text-primary" : "text-text-secondary"
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setBrowseMode("categories")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                browseMode === "categories" ? "bg-primary/10 text-primary" : "text-text-secondary"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setBrowseMode("az")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                browseMode === "az" ? "bg-primary/10 text-primary" : "text-text-secondary"
              }`}
            >
              A — Z
            </button>
          </div>
        )}

        {/* Services Grid */}
        <div className="flex flex-col gap-4">
          <span className="text-[15px] font-medium text-text-secondary">
            {trimmedSearch ? "Search results" : browseMode === "az" ? "All services" : browseMode === "categories" ? "Browse by category" : "Popular services"}
          </span>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-text-tertiary animate-spin" />
            </div>
          ) : browseMode === "categories" && !trimmedSearch ? (
            /* Category browsing */
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <div key={category}>
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    className="flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="text-[15px] font-medium text-text-primary capitalize">{category}</span>
                    <ChevronDown className={`h-4 w-4 text-text-muted motion-safe:transition-transform ${expandedCategory === category ? "rotate-180" : ""}`} />
                  </button>
                  {expandedCategory === category && (
                    <div className="mt-2 grid grid-cols-3 gap-3 px-1 pb-2">
                      {categoryServices[category] ? (
                        categoryServices[category].map((service) => (
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
                        ))
                      ) : (
                        <div className="col-span-3 flex items-center justify-center py-6">
                          <Loader2 className="h-5 w-5 text-text-tertiary animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : browseMode === "az" && !trimmedSearch ? (
            /* Alphabetical browsing */
            <div className="flex flex-col gap-4">
              {Object.entries(
                allServices.reduce<Record<string, SubscriptionService[]>>((groups, service) => {
                  const letter = service.name[0]?.toUpperCase() || "#"
                  if (!groups[letter]) groups[letter] = []
                  groups[letter].push(service)
                  return groups
                }, {})
              ).map(([letter, letterServices]) => (
                <div key={letter}>
                  <div className="sticky top-32 z-10 bg-background/90 backdrop-blur-sm px-1 py-1.5">
                    <span className="text-sm font-bold text-primary">{letter}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {letterServices.map((service) => (
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
                </div>
              ))}
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
  )

  if (embedded) return content

  return (
    <DetailShell
      title="Add Subscription"
      onBack={onBack}
      headerRight={(
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Plus className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
      )}
    >
      {content}
    </DetailShell>
  )
}
