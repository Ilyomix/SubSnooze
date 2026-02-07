# SubSnooze — Backlog

> Last updated: 2026-02-07

---

## Manual Actions (You — Dashboard / Account / Config)

> **Claude:** At the start of every session, read this section and ask the user which items they've completed. Update checkboxes and add notes based on their feedback.

### Before Launch (Blocking)

- [ ] **M1 — Supabase: Run database migrations**
  Apply all 8 migrations in `supabase/migrations/` to your production project.

- [ ] **M2 — Supabase: Configure Google OAuth**
  Google Cloud Console: create OAuth 2.0 credentials. Supabase Dashboard: enable Google provider, add redirect URI `https://your-domain.com/auth/callback`.

- [ ] **M3 — Supabase: Configure custom SMTP**
  Free tier limits auth emails to 3/hour. Dashboard > Auth > SMTP Settings. Use Resend, SendGrid, or any SMTP provider. Required for signup/password reset at scale.

- [ ] **M4 — Stripe: Create product + price**
  Dashboard > Products > "SubSnooze Pro Lifetime", one-time $39. Copy Price ID (`price_...`) to `STRIPE_PRICE_ID_PRO_LIFETIME`.

- [ ] **M5 — Stripe: Create webhook endpoint**
  Dashboard > Webhooks > Add endpoint: `https://your-domain.com/api/stripe/webhook`. Subscribe to: `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`. Copy signing secret to `STRIPE_WEBHOOK_SECRET`.

- [ ] **M6 — Vercel: Deploy + set env vars**
  Deploy to Vercel. Set ALL env vars from `.env.local.example`. Critical: set `CRON_SECRET` (`openssl rand -hex 32`) — cron jobs won't authenticate without it.

- [ ] **M7 — Vercel: Verify cron jobs**
  After deploy, check Dashboard > Cron Jobs. 3 jobs: advance-renewals (5am UTC), send-reminders (6am UTC), cancel-followup (9am UTC). Trigger one manually to verify.

- [ ] **M8 — Vercel: Staging + production environments**
  Separate Vercel projects or use env var scopes (preview/production). Point staging to a separate Supabase project.

- [ ] **M9 — DNS: Custom domain + SSL**
  Buy domain, point DNS to Vercel, enable SSL. Update `NEXT_PUBLIC_APP_URL` to match.

### Before Launch (Recommended)

- [ ] **M10 — Resend: Create account + verify domain**
  resend.com > verify sender domain (add DNS records). Emails sent as `SubSnooze <reminders@subsnooze.com>` — domain must match. Copy API key to `RESEND_API_KEY`. Without this, email reminders silently skip.

- [ ] **M11 — Firebase: Create project + Cloud Messaging**
  Firebase Console > create project, enable Cloud Messaging, get VAPID key. Set all 7 `NEXT_PUBLIC_FIREBASE_*` env vars. Without this, push notifications don't work.

- [ ] **M12 — Sentry: Create project**
  sentry.io > new Next.js project. Copy DSN to `NEXT_PUBLIC_SENTRY_DSN`. Graceful degradation if not set.

- [ ] **M13 — PostHog: Create project**
  posthog.com > new project. Copy API key to `NEXT_PUBLIC_POSTHOG_KEY`. Respects cookie consent + DNT. Analytics won't record until configured.

### Can Do Later

- [ ] **M14 — Uptime monitoring** (UptimeRobot / Better Stack)
- [ ] **M15 — Google Play Developer account** ($25 one-time, for TWA/PWABuilder)
- [ ] **M16 — Apple Developer Program** ($99/yr, for Capacitor + StoreKit IAP)

### Env Vars Checklist

| Variable | Required? | Where to get it |
|----------|-----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase > Settings > API (secret!) |
| `CRON_SECRET` | Yes | Generate: `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | Your production URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe > API keys |
| `STRIPE_SECRET_KEY` | Yes | Stripe > API keys (secret!) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe > Webhooks > Signing secret |
| `STRIPE_PRICE_ID_PRO_LIFETIME` | Yes | Stripe > Products > Price ID |
| `RESEND_API_KEY` | Recommended | resend.com > API Keys |
| `NEXT_PUBLIC_FIREBASE_*` (7 vars) | Recommended | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Recommended | Firebase > Cloud Messaging > Web Push certificates |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry > Project Settings > DSN |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional | PostHog > Project Settings > API Key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional | Default: `https://us.i.posthog.com` |

---

## Code Tasks (Development Work)

### Tier 1 — Showstoppers

- [ ] **C1 — Implement FCM push sending** (2-3 hrs)
  `send-reminders/route.ts:117-123` is a placeholder: `// FCM sending would go here`. Push notifications are never delivered. Implement FCM HTTP v1 API or Firebase Admin SDK.

- [ ] **C2 — Fix "Decide Later" button** (1-2 hrs)
  `CancelRedirectModal.tsx` sets `remindMe = true` but the flag is never used — no reminder is scheduled. Core ADHD principle violated.

### Tier 2 — Critical UX

- [ ] **C3 — Fix scroll-to-top** (30 min)
  Tab switches restore old scroll position. `popstate` handler doesn't call `scrollTo(0, 0)`.

- [ ] **C4 — Add usage indicator to Dashboard** (1-2 hrs)
  "3/5 subscriptions" for free, "Pro" badge for premium. Natural upgrade discovery.

- [ ] **C5 — Add escalation to final reminder** (2 hrs)
  All 3 touches use same format/urgency/channel. 1-day reminder should be visually urgent + use email if push ignored.

- [ ] **C6 — Make renewal date optional or approximate** (1-2 hrs)
  ADHD users don't know exact dates. Default estimate + "we'll refine this" message.

- [ ] **C7 — Fix cancel URL XSS** (5 min)
  `SubscriptionManagement.tsx` — use `url.href` instead of raw user string.

- [ ] **C8 — Improve session recovery** (1-2 hrs)
  Clear login redirect on expired session. Add "Welcome back" banner for returning users.

- [ ] **C9 — Specific error messages** (1 hr)
  Replace generic toasts with shame-free specifics ("No internet", "5 subscription limit").

### Tier 3 — Business & Polish

- [ ] **C10 — Handle silent Stripe portal failure** (10 min)
  `Settings.tsx` has empty catch block on portal redirect. Add error toast.

- [ ] **C11 — Extract shared price calculation utility** (30 min)
  `* 4.33` duplicated in 5 files. Extract `toMonthlyPrice()` using `52/12`.

### Tier 4 — PWA & Integration Hardening

- [ ] **C12 — Install prompt (A2HS)** — Detect `beforeinstallprompt`, show install banner.
- [ ] **C13 — Standalone mode detection** — Detect `display-mode: standalone`, adjust UI.
- [ ] **C14 — Update available toast** — Show refresh prompt on new SW version.
- [ ] **C15 — iOS PWA meta tags audit** — Verify apple-mobile-web-app-capable, splash screens.
- [ ] **C16 — Keyboard-aware layout** — `visualViewport` listener for mobile keyboard.
- [ ] **C17 — Bottom sheet modals** — Convert modals to drag-to-dismiss bottom sheets.
- [ ] **C18 — Landscape mode** — Test and fix layout at landscape orientations.
- [ ] **C19 — Supabase realtime reconnect** — Handle disconnect, show stale data indicator.
- [ ] **C20 — Offline mutation queue** — Queue mutations offline, replay on reconnect.
- [ ] **C21 — Auth session edge cases** — Expired token, concurrent tabs, incognito.
- [ ] **C22 — Edge function error handling** — Structured logging, FCM retry, dead letter.
- [ ] **C23 — CSP audit** — Review with CSP-evaluator, ensure no inline script leaks.

### Tier 5 — Test Coverage

- [ ] **C24 — useSubscriptions hook tests** — Optimistic add/rollback, realtime dedup, cancel.
- [ ] **C25 — useNotifications hook tests** — Mark read/unread, delete, pagination.
- [ ] **C26 — Stripe webhook handler tests** — Signature validation, duplicates, unknown events.
- [ ] **C27 — Auth flow integration tests** — Login, signup, password reset, token refresh.
- [ ] **C28 — Component interaction tests** — Dashboard, AddSubscriptionWizard, cancel flow.
- [ ] **C29 — E2E smoke test (Playwright)** — Signup -> add -> dashboard -> cancel -> verify.
- [ ] **C30 — Accessibility tests (axe-core)** — Flag WCAG AA violations.
- [ ] **C31 — Edge function tests** — send-reminders stage detection, batch processing.

### Tier 6 — Feature Polish

- [ ] **C32 — `selectedSub` stale data** — Realtime updates don't reflect on manage screen.
- [ ] **C33 — Chain-add paywall UX** — Inline limit message instead of redirect + modal.
- [ ] **C34 — Notification deep link** — Push tap opens specific subscription.
- [ ] **C35 — Export CSV completeness** — Verify all fields exported.
- [ ] **C36 — Dark mode edge cases** — Audit modals, toasts, landing, login, offline page.
- [ ] **C37 — Reminder preset persistence** — Verify DB update + cron respects preset.

### Tier 7 — New Features (V1.1)

- [ ] **C38 — i18n foundation (next-intl)** — Extract strings, locale detection, FR + EN, currency/date.
- [ ] **C39 — Do Not Disturb hours** — `dnd_start`/`dnd_end` fields, cron respects DND, Settings UI.

### Tier 8 — Future (V2+)

- [ ] **C40 — SMS reminders (Twilio)** — Hardest-to-ignore channel. Pro-only.
- [ ] **C41 — Push notification action buttons** — "Cancel now", "Snooze".
- [ ] **C42 — FCM token refresh logic** — Prevent silent stale-token failures.
- [ ] **C43 — Weekly digest email** — "Here's what's coming up this week."
- [ ] **C44 — Welcome back banner** — "2 subs renewed since your last visit."
- [ ] **C45 — Family/shared subscriptions** — Multi-user management.
- [ ] **C46 — Google Play Store (TWA)** — PWABuilder/Bubblewrap.
- [ ] **C47 — iOS App Store (Capacitor)** — StoreKit IAP required.

---

## Not Building

| Item | Why |
|------|-----|
| Full billing/account page | One-time $39. Stripe Portal handles it. |
| In-app payment history | Stripe Portal shows this. |
| MFA / 2FA | Adds login friction. ADHD users forget 2FA devices. |
| Audit logs | Enterprise feature, not relevant. |
| Subscription drafts | Over-engineering. |
| AI cancellation assistant | Post-traction. |
| Browser extension | Post-traction. |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-07 | Initial consolidation from 8 audit/plan files. Added manual actions tracking. |
| 2026-02-07 | Removed 5 already-done items: cron config, email reminders, PRO_FEATURES fix, webhook idempotency, console.log gating. |
| 2026-02-07 | Switched to checkbox format. Added session start workflow in CLAUDE.md. |
