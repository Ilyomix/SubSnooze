"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Calendar, Check } from "lucide-react"
import Image from "next/image"
import { DetailShell } from "@/components/layout"
import { Card, Button } from "@/components/ui"
import { getInitials, getFallbackLogoUrl, type SubscriptionService } from "@/lib/services"

interface ServiceInfo {
  id: string
  name: string
  logo: string
  logoColor: string
  domain: string | null
  // Pre-filled from database
  priceMonthly?: number | null
  priceYearly?: number | null
  cancelUrl?: string | null
}

interface AddSubscriptionStep2Props {
  service: ServiceInfo
  onBack: () => void
  onSave: (data: { price: string; cycle: string; date: Date }) => void
}

function ServiceLogoHeader({ service }: { service: ServiceInfo }) {
  // 0 = primary, 1 = fallback (Google), 2 = initials
  const [logoStage, setLogoStage] = useState(0)
  const isUrl = service.logo.startsWith("http")

  const logoUrl = logoStage === 0
    ? service.logo
    : logoStage === 1 && service.domain
      ? getFallbackLogoUrl(service.domain)
      : null

  const handleError = () => {
    setLogoStage((prev) => prev + 1)
  }

  // Squircle border radius (~22% of 36px = 8px)
  const size = 36
  const borderRadius = 8
  const padding = 4

  if (!isUrl || logoStage >= 2 || !logoUrl) {
    return (
      <div
        className="flex items-center justify-center text-sm font-bold text-white"
        style={{
          backgroundColor: service.logoColor,
          width: size,
          height: size,
          borderRadius,
        }}
      >
        {getInitials(service.name)}
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor: service.logoColor,
        width: size,
        height: size,
        borderRadius,
        padding,
      }}
    >
      <Image
        src={logoUrl}
        alt={service.name}
        width={size - padding * 2}
        height={size - padding * 2}
        className="object-contain"
        onError={handleError}
        unoptimized
      />
    </div>
  )
}

export function AddSubscriptionStep2({
  service,
  onBack,
  onSave,
}: AddSubscriptionStep2Props) {
  // Pre-fill price from database if available
  const defaultPrice = service.priceMonthly
    ? service.priceMonthly.toFixed(2)
    : ""

  const [price, setPrice] = useState(defaultPrice)
  const [cycle, setCycle] = useState("Monthly")
  // Default to tomorrow (next renewal should be in the future)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const [date, setDate] = useState<Date>(tomorrow)

  // Minimum date is today
  const today = new Date().toISOString().split("T")[0]
  const [showCycleDropdown, setShowCycleDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCycleDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Update price when cycle changes (if we have yearly pricing)
  const handleCycleChange = (newCycle: string) => {
    setCycle(newCycle)
    setShowCycleDropdown(false)

    // Auto-fill price based on cycle if we have database pricing
    if (newCycle === "Yearly" && service.priceYearly) {
      setPrice(service.priceYearly.toFixed(2))
    } else if (newCycle === "Monthly" && service.priceMonthly) {
      setPrice(service.priceMonthly.toFixed(2))
    }
  }

  return (
    <DetailShell
      title={service.name}
      onBack={onBack}
      headerRight={<ServiceLogoHeader service={service} />}
    >
      <div className="flex flex-1 flex-col gap-8 px-6 pt-4">

        {/* Progress Indicator */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[13px] font-medium text-text-secondary">Step 2 of 2</span>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <div className="h-0.5 w-10 rounded-sm bg-primary" />
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          </div>
          <span className="text-xs text-text-tertiary">Almost there… Add the details</span>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Price */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-medium text-text-primary">
              {cycle === "Yearly" ? "Yearly price" : "Monthly price"}
            </label>
            <Card padding="none" className="h-12">
              <input
                type="text"
                name="price"
                inputMode="decimal"
                placeholder="$0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-full w-full rounded-2xl bg-transparent px-4 text-[15px] text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </Card>
            {/* Show pricing hint if we have database pricing */}
            {(service.priceMonthly || service.priceYearly) && (
              <p className="text-xs text-text-tertiary">
                {service.priceMonthly && `$${service.priceMonthly.toFixed(2)}/mo`}
                {service.priceMonthly && service.priceYearly && " · "}
                {service.priceYearly && `$${service.priceYearly.toFixed(2)}/yr`}
              </p>
            )}
          </div>

          {/* Billing Cycle */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-medium text-text-primary">Billing cycle</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowCycleDropdown(!showCycleDropdown)}
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-divider bg-surface px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="text-[15px] text-text-primary">{cycle}</span>
                <ChevronDown className={`h-5 w-5 text-text-tertiary transition-transform duration-200 ${showCycleDropdown ? "rotate-180" : ""}`} />
              </button>
              {showCycleDropdown && (
                <div className="absolute left-0 right-0 top-14 z-10 overflow-hidden rounded-2xl border border-divider bg-surface shadow-lg">
                  {["Weekly", "Monthly", "Yearly"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleCycleChange(option)}
                      className="flex h-12 w-full items-center justify-between px-4 text-left text-[15px] text-text-primary hover:bg-background focus-visible:bg-background focus-visible:outline-none"
                    >
                      {option}
                      {cycle === option && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Renewal Date */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-medium text-text-primary">Next renewal date</label>
            <div className="relative h-12 rounded-2xl border border-divider bg-surface">
              <input
                type="date"
                value={date.toISOString().split("T")[0]}
                min={today}
                onChange={(e) => {
                  if (e.target.value) {
                    const selectedDate = new Date(e.target.value + "T00:00:00")
                    // Extra safety: ensure date is not in the past
                    if (selectedDate >= new Date(today + "T00:00:00")) {
                      setDate(selectedDate)
                    }
                  }
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div className="pointer-events-none flex h-full items-center justify-between px-4">
                <span className="text-[15px] text-text-primary">
                  {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <Calendar className="h-5 w-5 text-text-tertiary" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Save Button */}
        <div className="pb-8">
          <Button
            variant="primary"
            onClick={() => onSave({ price, cycle, date })}
            className="w-full"
          >
            Save subscription
          </Button>
        </div>
      </div>
    </DetailShell>
  )
}
