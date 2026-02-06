"use client"

import { useEffect, useRef } from "react"
import { colord } from "colord"

export type ConfettiBurst = {
  x: number
  y: number
}

type ConfettiShape = "rect" | "circle"

interface ConfettiParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  size: number
  color: string
  shape: ConfettiShape
  ageMs: number
  ttlMs: number
}

export const CONFETTI_FALLBACK_COLORS = ["#237A5A", "#3CAA7A", "#C9553D", "#F59E0B", "#6366F1", "#EC4899"]

export const DEFAULT_CONFETTI_DURATION_MS = 10500
export const DEFAULT_CONFETTI_FLOW_EMIT_MS = 3500
export const DEFAULT_CONFETTI_FLOW_PPS = 140

export interface ConfettiProps {
  bursts?: ConfettiBurst[]
  flow?: boolean
  durationMs?: number
  flowEmitMs?: number
  flowPps?: number
  className?: string
}

export function Confetti({
  bursts,
  flow,
  durationMs = DEFAULT_CONFETTI_DURATION_MS,
  flowEmitMs = DEFAULT_CONFETTI_FLOW_EMIT_MS,
  flowPps = DEFAULT_CONFETTI_FLOW_PPS,
  className,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let rafId: number | null = null
    let running = true
    const start = performance.now()

    const particles: ConfettiParticle[] = []
    let nextId = 0

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const rand = (min: number, max: number) => min + Math.random() * (max - min)

    const getCssVar = (name: string) =>
      window.getComputedStyle(document.documentElement).getPropertyValue(name).trim()

    const primary = getCssVar("--color-primary")
    const accent = getCssVar("--color-accent")
    const accentLight = getCssVar("--color-accent-light")

    const confettiColors =
      primary && accent
        ? [
            primary,
            colord(primary).lighten(0.12).toHex(),
            colord(primary).lighten(0.28).toHex(),
            accent,
            accentLight || colord(accent).lighten(0.18).toHex(),
            colord(accent).darken(0.08).toHex(),
          ]
        : CONFETTI_FALLBACK_COLORS

    const spawnParticle = (opts: {
      originX: number
      originY: number
      angleMinRad: number
      angleMaxRad: number
      speedMin: number
      speedMax: number
      vxJitter: number
      xJitter: number
      yJitter: number
      sizeMin: number
      sizeMax: number
      ttlMinMs: number
      ttlMaxMs: number
    }) => {
      const angle = rand(opts.angleMinRad, opts.angleMaxRad)
      const speed = rand(opts.speedMin, opts.speedMax)
      const vx = Math.cos(angle) * speed + rand(-opts.vxJitter, opts.vxJitter)
      const vy = Math.abs(Math.sin(angle) * speed)
      const size = rand(opts.sizeMin, opts.sizeMax)
      const shape: ConfettiShape = Math.random() < 0.75 ? "rect" : "circle"
      const ttlMs = rand(opts.ttlMinMs, opts.ttlMaxMs)

      particles.push({
        id: nextId++,
        x: opts.originX + rand(-opts.xJitter, opts.xJitter),
        y: opts.originY + rand(-opts.yJitter, opts.yJitter),
        vx,
        vy,
        rotation: rand(0, Math.PI * 2),
        rotationSpeed: rand(-10, 10),
        size,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        shape,
        ageMs: 0,
        ttlMs,
      })
    }

    const spawnBurst = (originX: number, originY: number) => {
      const count = 200
      const angleMinRad = (25 * Math.PI) / 180
      const angleMaxRad = (155 * Math.PI) / 180
      for (let i = 0; i < count; i++) {
        spawnParticle({
          originX,
          originY,
          angleMinRad,
          angleMaxRad,
          speedMin: 140,
          speedMax: 340,
          vxJitter: 220,
          xJitter: 8,
          yJitter: 8,
          sizeMin: 5,
          sizeMax: 12,
          ttlMinMs: 5200,
          ttlMaxMs: 7600,
        })
      }
    }

    resize()
    window.addEventListener("resize", resize)

    if (!flow) {
      const initialBursts: ConfettiBurst[] =
        bursts && bursts.length > 0
          ? bursts
          : [
              {
                x: window.innerWidth * 0.5,
                y: 0,
              },
            ]

      for (const b of initialBursts) spawnBurst(b.x, b.y)
    }

    let emitCarry = 0

    let last = performance.now()
    const frame = (now: number) => {
      if (!running) return

      const dt = Math.min(0.033, (now - last) / 1000)
      last = now

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const elapsed = now - start
      if (flow && elapsed < flowEmitMs) {
        const toEmit = (flowPps * dt) + emitCarry
        const emitCount = Math.floor(toEmit)
        emitCarry = toEmit - emitCount

        for (let i = 0; i < emitCount; i++) {
          spawnParticle({
            originX: rand(0, window.innerWidth),
            originY: rand(-16, 0),
            angleMinRad: (60 * Math.PI) / 180,
            angleMaxRad: (120 * Math.PI) / 180,
            speedMin: 60,
            speedMax: 180,
            vxJitter: 80,
            xJitter: 0,
            yJitter: 0,
            sizeMin: 5,
            sizeMax: 11,
            ttlMinMs: 4200,
            ttlMaxMs: 6400,
          })
        }
      }

      const gravity = 320
      const drag = 0.997
      const flutter = 8

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.ageMs += dt * 1000
        if (p.ageMs >= p.ttlMs) {
          particles.splice(i, 1)
          continue
        }

        p.vx *= drag
        p.vy *= drag
        p.vy += gravity * dt
        p.vx += Math.sin((now / 1000) * 6 + p.id) * flutter * dt

        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rotation += p.rotationSpeed * dt

        const life = p.ageMs / p.ttlMs
        const alpha = life < 0.7 ? 1 : Math.max(0, 1 - (life - 0.7) / 0.3)

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color

        if (p.shape === "circle") {
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        } else {
          const ww = p.size
          const hh = p.size * 0.45
          ctx.fillRect(-ww / 2, -hh / 2, ww, hh)
        }
        ctx.restore()
      }

      if (elapsed > durationMs && particles.length === 0) return

      rafId = window.requestAnimationFrame(frame)
    }

    rafId = window.requestAnimationFrame(frame)

    return () => {
      running = false
      window.removeEventListener("resize", resize)
      if (rafId != null) window.cancelAnimationFrame(rafId)
    }
  }, [bursts, durationMs, flow, flowEmitMs, flowPps])

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "pointer-events-none absolute inset-0"}
      aria-hidden="true"
    />
  )
}
