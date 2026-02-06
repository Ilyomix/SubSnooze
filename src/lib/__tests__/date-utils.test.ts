import { describe, it, expect, vi, afterEach } from "vitest"
import {
  parseLocalDate,
  formatLocalDate,
  calculateNextRenewalDate,
  getNextRenewalDate,
  daysUntilRenewal,
} from "../date-utils"

describe("parseLocalDate", () => {
  it("parses YYYY-MM-DD to local midnight", () => {
    const d = parseLocalDate("2026-03-15")
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(2) // 0-indexed: March = 2
    expect(d.getDate()).toBe(15)
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
  })

  it("handles single-digit month/day strings", () => {
    const d = parseLocalDate("2026-01-05")
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(5)
  })

  it("handles end of year", () => {
    const d = parseLocalDate("2026-12-31")
    expect(d.getMonth()).toBe(11)
    expect(d.getDate()).toBe(31)
  })
})

describe("formatLocalDate", () => {
  it("formats Date to YYYY-MM-DD", () => {
    const d = new Date(2026, 2, 15) // March 15
    expect(formatLocalDate(d)).toBe("2026-03-15")
  })

  it("pads single-digit month and day", () => {
    const d = new Date(2026, 0, 5) // Jan 5
    expect(formatLocalDate(d)).toBe("2026-01-05")
  })

  it("roundtrips with parseLocalDate", () => {
    const original = "2026-07-04"
    expect(formatLocalDate(parseLocalDate(original))).toBe(original)
  })
})

describe("calculateNextRenewalDate", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("adds 7 days for weekly", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6)) // Feb 6, 2026
    expect(calculateNextRenewalDate("weekly")).toBe("2026-02-13")
  })

  it("adds 1 month for monthly", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6))
    expect(calculateNextRenewalDate("monthly")).toBe("2026-03-06")
  })

  it("adds 1 year for yearly", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6))
    expect(calculateNextRenewalDate("yearly")).toBe("2027-02-06")
  })
})

describe("getNextRenewalDate", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("advances past renewal date forward until future", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6)) // Feb 6

    // Renewal was Jan 1 — monthly should advance to Feb 1, then Mar 1
    const result = getNextRenewalDate(new Date(2026, 0, 1), "monthly")
    expect(result.getMonth()).toBe(2) // March
    expect(result.getDate()).toBe(1)
  })

  it("returns same date if already in the future", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6))

    const future = new Date(2026, 5, 15) // June 15
    const result = getNextRenewalDate(future, "monthly")
    expect(result.getTime()).toBe(future.getTime())
  })

  it("handles weekly cycle advancing multiple weeks", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6)) // Feb 6

    // Renewal was Jan 5 — weekly: Jan 12, 19, 26, Feb 2, Feb 9
    const result = getNextRenewalDate(new Date(2026, 0, 5), "weekly")
    expect(result.getMonth()).toBe(1) // February
    expect(result.getDate()).toBe(9)
  })

  it("handles yearly cycle", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6))

    const past = new Date(2025, 0, 1) // Jan 1 2025
    const result = getNextRenewalDate(past, "yearly")
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(0)
    expect(result.getDate()).toBe(1)
  })
})

describe("daysUntilRenewal", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns positive days for future date", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6))

    expect(daysUntilRenewal(new Date(2026, 1, 13))).toBe(7)
  })

  it("returns 0 for today", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6))

    expect(daysUntilRenewal(new Date(2026, 1, 6))).toBe(0)
  })

  it("returns negative days for past date", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6))

    expect(daysUntilRenewal(new Date(2026, 1, 3))).toBe(-3)
  })
})
