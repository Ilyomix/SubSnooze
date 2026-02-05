"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getFallbackLogoUrl, getInitials, nameToDomain } from "@/lib/services"

interface ServiceIconProps {
  name: string
  logoColor: string
  logoUrl?: string
  domain?: string
  size?: number
}

export function ServiceIcon({
  name,
  logoColor,
  logoUrl,
  domain,
  size = 40,
}: ServiceIconProps) {
  // 0 = logoUrl, 1 = Google favicon, 2 = initials
  const [stage, setStage] = useState(() => (logoUrl ? 0 : 1))

  // Reset when props change
  useEffect(() => {
    setStage(logoUrl ? 0 : 1)
  }, [logoUrl, domain, name])

  const borderRadius = Math.round(size * 0.22)

  // Determine current image URL based on stage
  const currentUrl =
    stage === 0
      ? logoUrl
      : stage === 1
        ? getFallbackLogoUrl(domain ?? nameToDomain(name))
        : null

  // Stage 2: initials fallback
  if (stage >= 2 || !currentUrl) {
    return (
      <div
        className="flex items-center justify-center font-bold text-white"
        style={{
          backgroundColor: logoColor,
          width: size,
          height: size,
          fontSize: Math.round(size * 0.35),
          borderRadius,
        }}
      >
        {getInitials(name)}
      </div>
    )
  }

  const padding = Math.round(size * 0.12)

  return (
    <div
      className="relative overflow-hidden flex items-center justify-center border border-divider bg-surface"
      style={{
        width: size,
        height: size,
        borderRadius,
        padding,
      }}
    >
      <Image
        src={currentUrl}
        alt={name}
        width={size - padding * 2}
        height={size - padding * 2}
        className="object-contain"
        onError={() => setStage((prev) => prev + 1)}
        unoptimized
      />
    </div>
  )
}
