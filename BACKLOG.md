# SubSnooze — Backlog

> Consolidated from previous audit files, sprint plans, and commercialization checklist.
> Last updated: 2026-02-07

---

## Tier 1 — Showstoppers (Product doesn't work without these)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 1 | **Configure cron jobs** | `vercel.json` has `"crons": []` — empty. `send-reminders`, `advance-renewals`, `cancel-followup` never execute. The entire 3-touch reminder system is dead code in production. Schedule: advance-renewals 05:00 UTC, send-reminders 06:00 UTC, cancel-followup 09:00 UTC. | 30 min |
| 2 | **Implement email reminders** | Settings has "Email reminders" toggle but no backend reads the flag. No email service integrated, no templates. Push-only is a single point of failure — ADHD users who deny push permission receive zero reminders. Integrate Resend/SendGrid, create templates, wire into `send-reminders`. | 4-6 hrs |
| 3 | **Configure custom SMTP for Supabase auth** | Free tier limits auth emails (signup confirmation, password reset) to 3/hour. Configure custom SMTP in Supabase Dashboard. | 30 min (dashboard) |
| 4 | **Fix "Decide Later" button** | `CancelRedirectModal.tsx` sets `remindMe = true` but the flag is never used — no reminder is scheduled. This exploits the exact executive function deficit the product is supposed to help with. | 1-2 hrs |
| 5 | **Fix PRO_FEATURES list** | `src/lib/stripe/pricing.ts` claims "SMS + Push + Email reminders" and "Priority support" — only Push works, no support system exists. Update to reflect reality. | 15 min |

---

## Tier 2 — Critical UX (ADHD users will abandon without these)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 6 | **Fix scroll-to-top** | Tab switches restore old scroll position instead of resetting. `popstate` handler doesn't call `scrollTo(0, 0)`. Disorienting for ADHD users. | 30 min |
| 7 | **Add usage indicator to Dashboard** | "3/5 subscriptions" for free users, "Pro" badge for premium. Natural upgrade discovery without hitting a wall. | 1-2 hrs |
| 8 | **Add escalation to final reminder** | All 3 touches use same format/urgency/channel. 1-day reminder should be visually urgent + different channel if available. | 2 hrs |
| 9 | **Make renewal date optional or approximate** | ADHD users don't know exact renewal dates and will abandon the form. Default estimate + "we'll refine this" message. | 1-2 hrs |
| 10 | **Fix cancel URL XSS** | `SubscriptionManagement.tsx:203` — use `url.href` instead of raw user string. | 5 min |
| 11 | **Improve session recovery** | Clear login redirect when session expires. Add "Welcome back" banner for users returning after weeks. | 1-2 hrs |
| 12 | **Specific error messages** | Replace vague "Couldn't add subscription" toasts with specific, shame-free messages ("No internet", "5 subscription limit reached"). | 1 hr |

---

## Tier 3 — Business & Infrastructure (Before launch)

| # | Task | Details | Effort |
|---|------|---------|--------|
| 13 | **Staging + production environments** | Requires Vercel/Supabase environment configuration. | Medium |
| 14 | **Custom domain + SSL** | Requires domain purchase + DNS setup. | Medium |
| 15 | **Create Stripe product + price in Dashboard** | Create "SubSnooze Pro Lifetime" product, $39 one-time price, copy Price ID to env. | 30 min |
| 16 | **Create Stripe webhook endpoint** | `https://yourdomain.com/api/stripe/webhook`, subscribe to `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`. | 30 min |
| 17 | **Add webhook idempotency** | Track `stripe_event_id` to prevent duplicate processing on retries. | 1-2 hrs |
| 18 | **Handle silent Stripe portal failure** | `Settings.tsx:774` has empty catch block. Add error toast. | 10 min |
| 19 | **Remove console.log from production** | `webhook/route.ts`, `web-vitals.ts` — gate behind `NODE_ENV === 'development'`. Leaks user IDs and payment data. | 15 min |
| 20 | **Extract shared price calculation utility** | `* 4.33` duplicated in 5 files. Extract `toMonthlyPrice()` using `52/12`. | 30 min |
| 21 | **Uptime monitoring** | Requires external service (UptimeRobot/Better Stack). | Low |

---

## Tier 4 — PWA & Integration Hardening

| # | Task | Details |
|---|------|---------|
| 22 | **Install prompt (A2HS)** | Detect `beforeinstallprompt`, show contextual install banner. `src/hooks/useInstallPrompt.ts`, AppShell. |
| 23 | **Standalone mode detection** | Detect `display-mode: standalone` via `matchMedia`. Hide install prompt, show update toast. |
| 24 | **Update available toast** | When new SW version detected, show "Update available — tap to refresh". Currently SW updates silently. |
| 25 | **iOS PWA meta tags audit** | Verify `apple-mobile-web-app-capable`, status-bar-style, splash screens. |
| 26 | **Keyboard-aware layout** | Virtual keyboard pushes fixed bottom elements on mobile. Add `visualViewport` resize listener. |
| 27 | **Bottom sheet modals** | Convert UpgradeModal/CancelRedirectModal to mobile-friendly bottom sheets with drag-to-dismiss. |
| 28 | **Landscape mode** | Test and fix layout at landscape orientations. Currently untested. |
| 29 | **Supabase realtime reconnect** | Handle channel disconnect/reconnect gracefully. Show stale data indicator. |
| 30 | **Offline mutation queue** | Queue add/update/delete mutations when offline, replay when back online. Currently fails silently. |
| 31 | **Auth session edge cases** | Test: expired refresh token, concurrent tabs, incognito, cookies blocked. Ensure graceful redirect. |
| 32 | **Edge function error handling** | Structured error logging, retry logic for FCM failures, dead letter handling. |
| 33 | **CSP audit** | Review Content-Security-Policy with CSP-evaluator. Ensure no inline script leaks. |

---

## Tier 5 — Test Coverage

| # | Task | Coverage Target |
|---|------|----------------|
| 34 | **useSubscriptions hook tests** | Add (optimistic + rollback), realtime dedup, cancel, restore. `renderHook`. |
| 35 | **useNotifications hook tests** | Mark read/unread, delete, pagination, realtime sync. |
| 36 | **Stripe webhook handler tests** | Valid/invalid signature, duplicate events, unknown event types. |
| 37 | **Auth flow integration tests** | Login, signup, password reset, token refresh, logout. Mock Supabase. |
| 38 | **Component snapshot/interaction tests** | Dashboard (0/1/many subs), AddSubscriptionWizard flow, cancel flow. |
| 39 | **E2E smoke test (Playwright)** | Signup -> add sub -> dashboard -> cancel -> verify. |
| 40 | **Accessibility tests (axe-core)** | Integrate axe-core into component tests, flag WCAG AA violations. |
| 41 | **Edge function tests** | send-reminders stage detection, skip already-sent, batch processing. |

---

## Tier 6 — Feature Polish

| # | Task | Details |
|---|------|---------|
| 42 | **`selectedSub` stale data** | `page.tsx` — when realtime updates a subscription, manage screen doesn't reflect changes. Sync from array. |
| 43 | **Chain-add paywall UX** | When user hits free limit mid-chain-add, show inline limit message instead of redirect to dashboard + modal. |
| 44 | **Notification deep link** | Push notification tap should deep-link to specific subscription manage screen. |
| 45 | **Export CSV completeness** | Verify all fields: name, price, cycle, status, renewal date, cancel date, cancel URL. |
| 46 | **Dark mode edge cases** | Audit modals, toasts, landing page, login, offline page, badges in dark mode. |
| 47 | **Reminder preset persistence** | Verify changing preset (Aggressive/Relaxed/Minimal) updates `reminder_days` in DB and is respected by edge functions. |

---

## Tier 7 — New Features (V1.1)

| # | Feature | Details |
|---|---------|---------|
| 48 | **i18n foundation (next-intl)** | Extract all strings to message files, locale detection, FR + EN translations, currency/date localization. |
| 49 | **Do Not Disturb hours** | `dnd_start`/`dnd_end` fields in user profile. Edge functions respect DND window. Settings UI with time pickers. |

---

## Tier 8 — Future (V2+)

| # | Feature | Notes |
|---|---------|-------|
| 50 | **SMS reminders (Twilio)** | Hardest-to-ignore channel for ADHD users. Pro-only. |
| 51 | **Push notification action buttons** | "Cancel now", "Snooze" — reduce friction from notification to action. |
| 52 | **FCM token refresh logic** | Prevent silent stale-token failures. Handle `onMessage` callback for token rotation. |
| 53 | **Weekly digest email** | "Here's what's coming up this week." |
| 54 | **Welcome back banner** | "2 subscriptions renewed since your last visit." |
| 55 | **Family/shared subscriptions** | Multi-user subscription management. |
| 56 | **Google Play Store (TWA)** | Requires $25 Google Play Developer account + PWABuilder/Bubblewrap. |
| 57 | **iOS App Store (Capacitor)** | Requires Apple Developer Program ($99/yr) + StoreKit IAP. |

---

## Not Building

| Item | Why |
|------|-----|
| Full billing/account page | One-time $39 purchase. Stripe Portal handles receipts/refunds. |
| In-app payment history | Stripe Portal shows this. Don't duplicate. |
| In-app refund flow | Email support is fine for a small app. |
| MFA / 2FA | Adds login friction. ADHD users will forget their 2FA device. |
| Audit logs | Enterprise feature, not relevant. |
| Subscription drafts | Over-engineering. Just let users save incomplete subs normally. |
| AI cancellation assistant | Post-traction feature. |
| Browser extension | Post-traction feature. |
