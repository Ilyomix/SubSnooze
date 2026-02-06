import { describe, it, expect } from "vitest"
import {
  getFallbackLogoUrl,
  getServiceLogoUrl,
  nameToDomain,
  getInitials,
  stringToColor,
  POPULAR_SERVICE_SLUGS,
} from "./services"

describe("getFallbackLogoUrl", () => {
  it("generates Google Favicons API URL", () => {
    const url = getFallbackLogoUrl("netflix.com")
    expect(url).toBe("https://www.google.com/s2/favicons?domain=netflix.com&sz=128")
  })

  it("accepts custom size", () => {
    const url = getFallbackLogoUrl("spotify.com", 64)
    expect(url).toBe("https://www.google.com/s2/favicons?domain=spotify.com&sz=64")
  })
})

describe("getServiceLogoUrl", () => {
  it("returns logo_url when available on service", () => {
    const service = { logo_url: "https://example.com/logo.png", domain: "example.com" } as any
    expect(getServiceLogoUrl(service)).toBe("https://example.com/logo.png")
  })

  it("falls back to Google Favicons when no logo_url", () => {
    const service = { logo_url: null, domain: "netflix.com" } as any
    expect(getServiceLogoUrl(service)).toContain("google.com/s2/favicons")
    expect(getServiceLogoUrl(service)).toContain("netflix.com")
  })

  it("uses provided domain when service has no domain", () => {
    expect(getServiceLogoUrl(null, "test.com")).toContain("test.com")
  })

  it("returns empty string when no logo and no domain", () => {
    expect(getServiceLogoUrl(null)).toBe("")
  })
})

describe("nameToDomain", () => {
  it("converts simple name to domain", () => {
    expect(nameToDomain("Netflix")).toBe("netflix.com")
  })

  it("removes spaces", () => {
    expect(nameToDomain("Disney Plus")).toBe("disneyplus.com")
  })

  it("removes special characters", () => {
    expect(nameToDomain("HBO Max!")).toBe("hbomax.com")
  })

  it("handles mixed case", () => {
    expect(nameToDomain("YouTube Premium")).toBe("youtubepremium.com")
  })

  it("trims whitespace", () => {
    expect(nameToDomain("  Spotify  ")).toBe("spotify.com")
  })
})

describe("getInitials", () => {
  it("returns first two chars for single word", () => {
    expect(getInitials("Netflix")).toBe("NE")
  })

  it("returns first char of first two words for multi-word", () => {
    expect(getInitials("Disney Plus")).toBe("DP")
  })

  it("handles uppercase correctly", () => {
    expect(getInitials("hbo max")).toBe("HM")
  })

  it("trims whitespace", () => {
    expect(getInitials("  Spotify  ")).toBe("SP")
  })
})

describe("stringToColor", () => {
  it("returns a valid hex color", () => {
    const color = stringToColor("Netflix")
    expect(color).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it("returns the same color for the same string", () => {
    expect(stringToColor("test")).toBe(stringToColor("test"))
  })

  it("returns different colors for different strings", () => {
    // Not guaranteed, but highly likely for different inputs
    const colors = new Set([
      stringToColor("Netflix"),
      stringToColor("Spotify"),
      stringToColor("Disney"),
      stringToColor("Apple"),
    ])
    expect(colors.size).toBeGreaterThan(1)
  })
})

describe("POPULAR_SERVICE_SLUGS", () => {
  it("contains expected popular services", () => {
    expect(POPULAR_SERVICE_SLUGS).toContain("netflix")
    expect(POPULAR_SERVICE_SLUGS).toContain("spotify")
    expect(POPULAR_SERVICE_SLUGS).toContain("disney-plus")
  })

  it("has at least 20 services", () => {
    expect(POPULAR_SERVICE_SLUGS.length).toBeGreaterThanOrEqual(20)
  })

  it("has no duplicates", () => {
    const unique = new Set(POPULAR_SERVICE_SLUGS)
    expect(unique.size).toBe(POPULAR_SERVICE_SLUGS.length)
  })
})
