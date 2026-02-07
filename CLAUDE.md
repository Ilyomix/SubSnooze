# SubSnooze

ADHD-friendly subscription tracker. "Stop paying the ADHD tax on subscriptions."

## Session Start Checklist

**At the beginning of every session, do this:**

1. Read `BACKLOG.md` — check the **Manual Actions** section
2. List all unchecked `[ ]` manual actions to the user, grouped by priority
3. Ask: *"Have you completed any of these since last time? Any blockers?"*
4. Based on the user's answers:
   - Check off completed items (`[x]`)
   - Add notes if partially done or blocked
   - Update `BACKLOG.md` immediately
5. Then proceed with whatever the user asked for

This ensures manual actions (Stripe dashboard, Supabase config, DNS, etc.) don't silently drift out of sync with the codebase.

## Commands

```bash
pnpm dev          # Dev server (localhost:3000)
pnpm build        # Production build (must pass before claiming work complete)
pnpm lint         # ESLint (must pass before claiming work complete)
pnpm test         # Vitest
```

## Tech Stack

Next.js 15 (App Router) + React 19 + TypeScript 5 + Tailwind CSS v4 + Supabase (auth/DB/realtime) + Firebase Cloud Messaging + Stripe (one-time $39 Pro) + Resend (email) + Sentry + PostHog. Package manager: **pnpm**.

## Project Structure

```
src/
├── app/              # Next.js App Router (pages, API routes, auth callback)
├── components/
│   ├── ui/           # Primitives (Card, Button, Badge, SegmentedControl)
│   ├── layout/       # AppShell, DetailShell, TabBar
│   ├── screens/      # Full views (Dashboard, AllSubscriptions, Settings, Notifications)
│   │   └── modals/   # UpgradeModal, CancelRedirectModal, ConfirmCancellation, CancellationSuccess
│   └── auth/         # LoginForm, SignupForm
├── contexts/         # AuthContext
├── hooks/            # useUser, useSubscriptions, useNotifications, useToast, useDarkMode, etc.
├── lib/
│   ├── supabase/     # client.ts, server.ts, middleware.ts
│   ├── stripe/       # pricing.ts, server.ts
│   ├── firebase/     # messaging.ts
│   ├── analytics/    # PostHog provider + events + web-vitals
│   ├── sentry/       # client.ts (error tracking)
│   ├── i18n/         # config.ts, context.tsx (FR/EN)
│   └── *.ts          # date-utils, utils, export-csv, rate-limit, haptics, services, env
├── messages/         # en.json, fr.json (i18n strings)
├── types/            # database.ts (auto-generated), subscription.ts
└── styles/           # globals.css (Tailwind v4 @theme)
supabase/
├── migrations/       # 8 SQL migrations (run in order)
└── functions/        # Edge functions (legacy — prefer /api/cron/ routes)
```

## Conventions

**Imports:** Path alias `@/*` -> `./src/*`. Barrel exports in `components/index.ts` and `hooks/index.ts`.

**Components:** Server Components by default. `"use client"` only for interactive components.

**Styling:** Tailwind v4 with `@theme` block for design tokens. `cn()` helper (clsx + tailwind-merge). `motion-safe:` prefix for animations.

**Types:** DB<->UI transformers: `dbToSubscription()`, `subscriptionToDb()`. Auto-generated Supabase types in `src/types/database.ts`.

**Design tokens:**
```
Primary:    #237A5A (teal — positive states)
Accent:     #C9553D (coral — warnings/cancel)
Background: #F8F7F4 (warm off-white)
Font:       Outfit
```

## Architecture Decisions

- **SPA routing inside `page.tsx`** — screen state managed via `screen` + `activeTab` state, not Next.js file-based routing. `history.pushState` for browser back support.
- **Optimistic updates** — `useSubscriptions` and `useNotifications` use optimistic state + Supabase realtime sync.
- **One-time purchase** — Pro tier is $39 lifetime via Stripe Checkout (not subscription). Config in `src/lib/stripe/pricing.ts`.
- **3-touch reminders** — Cron jobs at 5/6/9 AM UTC via Vercel crons. Push (FCM) + email (Resend) + in-app notifications.
- **Graceful degradation** — Firebase, Sentry, PostHog, Resend all silently disabled if env vars not set.

## ADHD UX Principles

- Max 3 options per screen
- One primary action per view
- "Decide Later" always available
- Shame-free messaging (no guilt language)
- Celebrate wins (confetti on cancel success)

## Environment Variables

See `.env.local.example` for the full list with comments. See `BACKLOG.md > Env Vars Checklist` for where to get each value.

## Backlog & Manual Actions

All remaining work is tracked in `BACKLOG.md`:
- **Manual Actions (M1-M16)** — Dashboard configs, account setups, DNS, etc.
- **Code Tasks (C1-C47)** — Dev work organized by priority tier
- **Not Building** — Explicitly scoped out items

Always consult `BACKLOG.md` before starting work to understand current state.
