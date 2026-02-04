# SubSnooze

ADHD-friendly subscription tracker. "Stop paying the ADHD tax on subscriptions."

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.1.0 |
| UI | React | 19.0.0 |
| Styling | Tailwind CSS (PostCSS v4) | 4.0.0 |
| Database/Auth | Supabase | 2.74.5 |
| Push Notifications | Firebase Cloud Messaging | 12.8.0 |
| Language | TypeScript | 5.7.0 |
| Package Manager | pnpm | - |

## Commands

```bash
pnpm dev      # Start dev server (localhost:3000)
pnpm build    # Build for production
pnpm lint     # Run ESLint
```

## Project Structure

```
src/
├── app/           # Next.js App Router (layout.tsx, page.tsx, route handlers)
├── components/    # UI components
│   ├── ui/        # Reusable primitives (Card, Button, Badge)
│   ├── layout/    # AppShell, Header, TabBar
│   ├── screens/   # Full views (Dashboard, AllSubscriptions, Settings)
│   └── auth/      # LoginForm, SignupForm
├── hooks/         # useUser, useSubscriptions, useNotifications
├── lib/           # Utilities
│   ├── supabase/  # client.ts, server.ts, middleware.ts
│   ├── api/       # subscriptions.ts, notifications.ts
│   └── firebase/  # messaging.ts
├── types/         # database.ts (auto-generated), subscription.ts
└── styles/        # globals.css (Tailwind v4 @theme)
supabase/
├── migrations/    # Database migrations
└── functions/     # Edge functions
```

## Conventions

### Imports
- Path alias: `@/*` → `./src/*`
- Barrel exports in `components/index.ts`

### Components
- `"use client"` directive for interactive components
- Server Components by default in App Router

### Styling
- Tailwind v4 with `@theme` block for design tokens
- `cn()` helper for class merging (clsx + tailwind-merge)
- `motion-safe:` prefix for animations (respects prefers-reduced-motion)

### Types
- DB ↔ UI transformers: `dbToSubscription()`, `subscriptionToDb()`
- Auto-generated Supabase types in `src/types/database.ts`

### Design Tokens
```css
--color-primary: #237A5A;      /* teal - positive states */
--color-accent: #C9553D;       /* coral - warnings/cancel */
--color-background: #F8F7F4;   /* warm off-white */
--font-family-primary: Outfit;
```

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

## ADHD-Friendly UX Principles

- Max 3 options per screen (reduce cognitive load)
- One primary action per view
- Immediate visual feedback
- "Decide Later" always available
- Shame-free messaging (no guilt language)
- 3-touch reminder system (7/3/1 days before renewal)

## Verification

Before claiming work complete:
```bash
pnpm lint        # Must pass
pnpm build       # Must succeed
```
