import { describe, it, expect } from "vitest"
import { cn, formatCurrency } from "./utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("merges tailwind conflicts correctly", () => {
    // tailwind-merge should pick the last conflicting class
    expect(cn("px-4", "px-6")).toBe("px-6")
  })

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end")
  })
})

describe("formatCurrency", () => {
  it("formats with cents by default", () => {
    const result = formatCurrency(9.99)
    expect(result).toBe("$9.99")
  })

  it("formats whole numbers when flag is set", () => {
    const result = formatCurrency(120, true)
    expect(result).toBe("$120")
  })

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00")
  })

  it("formats large amounts with commas", () => {
    const result = formatCurrency(1234.56)
    expect(result).toBe("$1,234.56")
  })
})
