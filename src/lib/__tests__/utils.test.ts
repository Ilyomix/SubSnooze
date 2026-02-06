import { describe, it, expect } from "vitest"
import { cn, formatCurrency } from "../utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("deduplicates conflicting tailwind classes", () => {
    // tailwind-merge should keep the last conflicting utility
    expect(cn("px-2", "px-4")).toBe("px-4")
  })

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end")
  })

  it("handles empty call", () => {
    expect(cn()).toBe("")
  })
})

describe("formatCurrency", () => {
  it("formats with cents by default", () => {
    expect(formatCurrency(9.99)).toBe("$9.99")
  })

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00")
  })

  it("formats whole number with cents", () => {
    expect(formatCurrency(100)).toBe("$100.00")
  })

  it("formats as whole number when whole=true", () => {
    expect(formatCurrency(247, true)).toBe("$247")
  })

  it("rounds down fractional when whole=true", () => {
    expect(formatCurrency(247.89, true)).toBe("$248")
  })

  it("formats large amounts with commas", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56")
  })
})
