"use client"

import { useState } from "react"
import { Search, Music, Dumbbell, Package, Plus } from "lucide-react"
import { DetailShell } from "@/components/layout"
import { Card } from "@/components/ui"
import { type ReactNode } from "react"

interface ServiceOption {
  id: string
  name: string
  logo: ReactNode
  logoColor: string
}

interface AddSubscriptionStep1Props {
  onBack: () => void
  onSelectService: (serviceId: string, customName?: string) => void
  onSearch: (query: string) => void
}

const POPULAR_SERVICES: ServiceOption[] = [
  { id: "netflix", name: "Netflix", logo: <span className="text-xl font-bold">N</span>, logoColor: "#E50914" },
  { id: "spotify", name: "Spotify", logo: <Music className="h-6 w-6" />, logoColor: "#1DB954" },
  { id: "disney", name: "Disney+", logo: <span className="text-sm font-bold">D+</span>, logoColor: "#113CCF" },
  { id: "gym", name: "Gym", logo: <Dumbbell className="h-6 w-6" />, logoColor: "#6B7280" },
  { id: "adobe", name: "Adobe", logo: <span className="text-sm font-bold">Ai</span>, logoColor: "#FF0000" },
  { id: "amazon", name: "Amazon", logo: <Package className="h-6 w-6" />, logoColor: "#FF9900" },
]

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
  const [searchQuery, setSearchQuery] = useState("")

  const filteredServices = searchQuery.trim()
    ? POPULAR_SERVICES.filter((service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : POPULAR_SERVICES

  const showCustomOption = searchQuery.trim() && filteredServices.length === 0
  const capitalizedName = capitalizeWords(searchQuery)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleAddCustom = () => {
    const customId = searchQuery.trim().toLowerCase().replace(/\s+/g, "-")
    onSelectService(customId, capitalizedName)
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
          <span className="text-[15px] font-medium text-text-secondary">Search or add custom:</span>
          <Card padding="none" className="flex h-12 items-center gap-3 px-4">
            <Search className="h-[18px] w-[18px] text-text-tertiary" />
            <input
              type="text"
              name="service-search"
              placeholder="Type service name…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary focus-visible:outline-none"
            />
          </Card>
        </div>

        {/* Custom subscription option when no results */}
        {showCustomOption && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAddCustom}
              className="flex items-center gap-4 rounded-xl bg-surface p-4 motion-safe:transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                <Plus className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium text-text-primary">
                  Add &quot;{capitalizedName}&quot;
                </span>
                <span className="text-xs text-text-tertiary">
                  Create a custom subscription
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Popular Services */}
        {filteredServices.length > 0 && (
          <div className="flex flex-col gap-4">
            <span className="text-[15px] font-medium text-text-secondary">
              {searchQuery.trim() ? "Matching services" : "Popular services"}
            </span>
            <div className="grid grid-cols-3 gap-3">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => onSelectService(service.id)}
                  aria-label={`Select ${service.name}`}
                  className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 motion-safe:transition-colors hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: service.logoColor }}
                  >
                    {service.logo}
                  </div>
                  <span className="text-sm font-medium text-text-primary">{service.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DetailShell>
  )
}
