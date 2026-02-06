import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  parseLocalDate,
  formatLocalDate,
  calculateNextRenewalDate,
  getNextRenewalDate,
  daysUntilRenewal,
} from "./date-utils"

describe("parseLocalDate", () => {
  it("parses YYYY-MM-DD as local midnight", () => {
    const date = parseLocalDate("2025-03-15")
    expect(date.getFullYear()).toBe(2025)
    expect(date.getMonth()).toBe(2) // 0-indexed
    expect(date.getDate()).toBe(15)
    expect(date.getHours()).toBe(0)
    expect(date.getMinutes()).toBe(0)
  })

  it("handles January correctly (month 0)", () => {
    const date = parseLocalDate("2025-01-01")
    expect(date.getMonth()).toBe(0)
    expect(date.getDate()).toBe(1)
  })

  it("handles December correctly", () => {
    const date = parseLocalDate("2025-12-31")
    expect(date.getMonth()).toBe(11)
    expect(date.getDate()).toBe(31)
  })
})

describe("formatLocalDate", () => {
  it("formats Date to YYYY-MM-DD", () => {
    const date = new Date(2025, 2, 15) // March 15, 2025
    expect(formatLocalDate(date)).toBe("2025-03-15")
  })

  it("zero-pads single digit months and days", () => {
    const date = new Date(2025, 0, 5) // Jan 5, 2025
    expect(formatLocalDate(date)).toBe("2025-01-05")
  })

  it("roundtrips with parseLocalDate", () => {
    const original = "2025-06-20"
    const result = formatLocalDate(parseLocalDate(original))
    expect(result).toBe(original)
  })
})

describe("calculateNextRenewalDate", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15)) // June 15, 2025
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("adds 7 days for weekly", () => {
    const result = calculateNextRenewalDate("weekly")
    expect(result).toBe("2025-06-22")
  })

  it("adds 1 month for monthly", () => {
    const result = calculateNextRenewalDate("monthly")
    expect(result).toBe("2025-07-15")
  })

  it("adds 1 year for yearly", () => {
    const result = calculateNextRenewalDate("yearly")
    expect(result).toBe("2026-06-15")
  })
})

describe("getNextRenewalDate", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15)) // June 15, 2025
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns the same date if it is in the future", () => {
    const future = new Date(2025, 6, 20) // July 20, 2025
    const result = getNextRenewalDate(future, "monthly")
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(6)
    expect(result.getDate()).toBe(20)
  })

  it("advances past dates forward for monthly billing", () => {
    const past = new Date(2025, 3, 10) // April 10, 2025
    const result = getNextRenewalDate(past, "monthly")
    // Should advance: Apr 10 -> May 10 -> Jun 10 -> Jul 10 (past June 15)
    expect(result.getMonth()).toBe(6) // July
    expect(result.getDate()).toBe(10)
  })

  it("advances past dates forward for yearly billing", () => {
    const past = new Date(2024, 2, 1) // March 1, 2024
    const result = getNextRenewalDate(past, "yearly")
    // Should advance: Mar 2024 -> Mar 2025 -> still past (Jun 15) ... -> Mar 2026
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(2) // March
  })

  it("advances past dates forward for weekly billing", () => {
    const past = new Date(2025, 5, 1) // June 1, 2025
    const result = getNextRenewalDate(past, "weekly")
    // Should advance weekly until after June 15
    expect(result.getTime()).toBeGreaterThan(new Date(2025, 5, 15).getTime())
  })
})

describe("daysUntilRenewal", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 14, 30)) // June 15, 2025 at 2:30 PM
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 0 for today", () => {
    const today = new Date(2025, 5, 15)
    expect(daysUntilRenewal(today)).toBe(0)
  })

  it("returns 1 for tomorrow", () => {
    const tomorrow = new Date(2025, 5, 16)
    expect(daysUntilRenewal(tomorrow)).toBe(1)
  })

  it("returns 7 for next week", () => {
    const nextWeek = new Date(2025, 5, 22)
    expect(daysUntilRenewal(nextWeek)).toBe(7)
  })

  it("returns negative for past dates", () => {
    const yesterday = new Date(2025, 5, 14)
    expect(daysUntilRenewal(yesterday)).toBe(-1)
  })

  it("ignores time of day (date-only comparison)", () => {
    // Even though it's 2:30 PM, the renewal at midnight tomorrow should be 1 day
    const tomorrow = new Date(2025, 5, 16, 0, 0)
    expect(daysUntilRenewal(tomorrow)).toBe(1)
  })
})
