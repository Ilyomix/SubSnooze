"use client"

import { Search, Music, Dumbbell, Package } from "lucide-react"
import { Header } from "@/components/layout"
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
  onSelectService: (serviceId: string) => void
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

export function AddSubscriptionStep1({
  onBack,
  onSelectService,
  onSearch,
}: AddSubscriptionStep1Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background pt-12">
      <div className="flex flex-col gap-6 px-6">
        <Header title="Add Subscription" showBack onBack={onBack} />

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

        {/* Popular Services */}
        <div className="flex flex-col gap-4">
          <span className="text-[15px] font-medium text-text-secondary">Popular services</span>
          <div className="grid grid-cols-3 gap-3">
            {POPULAR_SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className="flex flex-col items-center gap-2 rounded-xl bg-surface p-4 transition-colors hover:bg-surface/80"
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

        {/* Search */}
        <div className="flex flex-col gap-3">
          <span className="text-[15px] font-medium text-text-secondary">Or search:</span>
          <Card padding="none" className="flex h-12 items-center gap-3 px-4">
            <Search className="h-[18px] w-[18px] text-text-tertiary" />
            <input
              type="text"
              placeholder="Type service name..."
              onChange={(e) => onSearch(e.target.value)}
              className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
