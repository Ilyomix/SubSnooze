"use client"

import { useState } from "react"
import { ChevronDown, Calendar } from "lucide-react"
import { DetailShell } from "@/components/layout"
import { Card, Button } from "@/components/ui"

interface ServiceInfo {
  id: string
  name: string
  logo: string
  logoColor: string
}

interface AddSubscriptionStep2Props {
  service: ServiceInfo
  onBack: () => void
  onSave: (data: { price: string; cycle: string; date: Date }) => void
}

export function AddSubscriptionStep2({
  service,
  onBack,
  onSave,
}: AddSubscriptionStep2Props) {
  const [price, setPrice] = useState("")
  const [cycle, setCycle] = useState("Monthly")
  const [date, setDate] = useState<Date>(new Date())

  return (
    <DetailShell
      title={service.name}
      onBack={onBack}
      headerRight={
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: service.logoColor }}
        >
          {service.logo}
        </div>
      }
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
          <span className="text-xs text-text-tertiary">Almost there\u2026 Add the details</span>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Price */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-medium text-text-primary">Monthly price</label>
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
          </div>

          {/* Billing Cycle */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-medium text-text-primary">Billing cycle</label>
            <Card padding="none" className="flex h-12 items-center justify-between px-4">
              <span className="text-[15px] text-text-primary">{cycle}</span>
              <ChevronDown className="h-5 w-5 text-text-tertiary" />
            </Card>
          </div>

          {/* Renewal Date */}
          <div className="flex flex-col gap-2">
            <label className="text-[15px] font-medium text-text-primary">Next renewal date</label>
            <Card padding="none" className="flex h-12 items-center justify-between px-4">
              <span className="text-[15px] text-text-primary">
                {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <Calendar className="h-5 w-5 text-text-tertiary" />
            </Card>
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
