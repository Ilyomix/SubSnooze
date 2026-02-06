import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { rateLimit } from "../rate-limit"

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 6, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows first request", () => {
    const result = rateLimit("192.168.1.1", { maxRequests: 5, windowMs: 60_000 })
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it("decrements remaining on each request", () => {
    const ip = "10.0.0.1"
    const opts = { maxRequests: 3, windowMs: 60_000 }

    const r1 = rateLimit(ip, opts)
    expect(r1.remaining).toBe(2)

    const r2 = rateLimit(ip, opts)
    expect(r2.remaining).toBe(1)

    const r3 = rateLimit(ip, opts)
    expect(r3.remaining).toBe(0)
  })

  it("blocks after max requests exceeded", () => {
    const ip = "10.0.0.2"
    const opts = { maxRequests: 2, windowMs: 60_000 }

    rateLimit(ip, opts) // 1
    rateLimit(ip, opts) // 2
    const r3 = rateLimit(ip, opts) // 3 — should be blocked

    expect(r3.allowed).toBe(false)
    expect(r3.remaining).toBe(0)
  })

  it("resets after window expires", () => {
    const ip = "10.0.0.3"
    const opts = { maxRequests: 1, windowMs: 60_000 }

    rateLimit(ip, opts) // 1 — allowed
    const blocked = rateLimit(ip, opts) // 2 — blocked
    expect(blocked.allowed).toBe(false)

    // Advance past the window
    vi.advanceTimersByTime(61_000)

    const reset = rateLimit(ip, opts)
    expect(reset.allowed).toBe(true)
    expect(reset.remaining).toBe(0)
  })

  it("tracks different IPs independently", () => {
    const opts = { maxRequests: 1, windowMs: 60_000 }

    const r1 = rateLimit("1.1.1.1", opts)
    const r2 = rateLimit("2.2.2.2", opts)

    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
  })

  it("uses default options when none provided", () => {
    const result = rateLimit("3.3.3.3")
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9) // default maxRequests=10, so 10-1=9
  })
})
