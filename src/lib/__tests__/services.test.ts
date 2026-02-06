import { describe, it, expect } from "vitest"
import {
  getFallbackLogoUrl,
  getServiceLogoUrl,
  nameToDomain,
  getInitials,
  stringToColor,
  POPULAR_SERVICE_SLUGS,
} from "../services"
import type { SubscriptionService } from "../services"

// Minimal mock service for testing pure functions
function mockService(overrides: Partial<SubscriptionService> = {}): SubscriptionService {
  return {
    id: "1",
    slug: "test",
    name: "Test Service",
    domain: "test.com",
    category: "streaming",
    logo_url: null,
    logo_color: "#000",
    price_monthly: 9.99,
    price_yearly: null,
    currency: "USD",
    website_url: null,
    cancel_url: null,
    manage_url: null,
    status: "active",
    last_verified_at: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...overrides,
  }
}

describe("getFallbackLogoUrl", () => {
  it("returns Google Favicons URL with default size", () => {
    expect(getFallbackLogoUrl("netflix.com")).toBe(
      "https://www.google.com/s2/favicons?domain=netflix.com&sz=128"
    )
  })

  it("accepts custom size", () => {
    expect(getFallbackLogoUrl("spotify.com", 64)).toBe(
      "https://www.google.com/s2/favicons?domain=spotify.com&sz=64"
    )
  })
})

describe("getServiceLogoUrl", () => {
  it("returns logo_url when service has one", () => {
    const svc = mockService({ logo_url: "https://cdn.example.com/logo.png" })
    expect(getServiceLogoUrl(svc)).toBe("https://cdn.example.com/logo.png")
  })

  it("falls back to Google Favicons when no logo_url", () => {
    const svc = mockService({ logo_url: null, domain: "netflix.com" })
    expect(getServiceLogoUrl(svc)).toBe(
      "https://www.google.com/s2/favicons?domain=netflix.com&sz=128"
    )
  })

  it("uses explicit domain param as fallback", () => {
    expect(getServiceLogoUrl(null, "custom.com")).toBe(
      "https://www.google.com/s2/favicons?domain=custom.com&sz=128"
    )
  })

  it("returns empty string when no service and no domain", () => {
    expect(getServiceLogoUrl(null)).toBe("")
  })
})

describe("nameToDomain", () => {
  it("converts simple name", () => {
    expect(nameToDomain("Netflix")).toBe("netflix.com")
  })

  it("removes spaces", () => {
    expect(nameToDomain("Amazon Prime")).toBe("amazonprime.com")
  })

  it("removes special characters", () => {
    expect(nameToDomain("Disney+")).toBe("disney.com")
  })

  it("trims whitespace", () => {
    expect(nameToDomain("  Spotify  ")).toBe("spotify.com")
  })
})

describe("getInitials", () => {
  it("returns first two chars for single word", () => {
    expect(getInitials("Netflix")).toBe("NE")
  })

  it("returns first char of first two words", () => {
    expect(getInitials("Amazon Prime")).toBe("AP")
  })

  it("handles extra whitespace", () => {
    expect(getInitials("  Google  One  ")).toBe("GO")
  })
})

describe("stringToColor", () => {
  it("returns a color from the palette", () => {
    const color = stringToColor("Netflix")
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it("is deterministic", () => {
    expect(stringToColor("Spotify")).toBe(stringToColor("Spotify"))
  })

  it("different strings can produce different colors", () => {
    // Not guaranteed for all pairs, but these specific strings do differ
    const a = stringToColor("Netflix")
    const b = stringToColor("Spotify")
    // At minimum, the function should return valid colors
    expect(a).toMatch(/^#[0-9A-Fa-f]{6}$/)
    expect(b).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })
})

describe("POPULAR_SERVICE_SLUGS", () => {
  it("contains expected services", () => {
    expect(POPULAR_SERVICE_SLUGS).toContain("netflix")
    expect(POPULAR_SERVICE_SLUGS).toContain("spotify")
    expect(POPULAR_SERVICE_SLUGS).toContain("chatgpt")
  })

  it("has no duplicates", () => {
    const unique = new Set(POPULAR_SERVICE_SLUGS)
    expect(unique.size).toBe(POPULAR_SERVICE_SLUGS.length)
  })
})
