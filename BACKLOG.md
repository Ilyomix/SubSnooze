# SubSnooze — Backlog

> Last updated: 2026-02-07
> Consolidated from previous audit/plan files + codebase audit.

---

## Manual Actions (You — Dashboard / Account / Config)

Things that require human action outside of the codebase. No code changes needed.

### Before Launch (Blocking)

| # | Service | Action | Details |
|---|---------|--------|---------|
| M1 | **Supabase** | Run database migrations | Apply all 8 migrations in `supabase/migrations/` to your production project. |
| M2 | **Supabase** | Configure Google OAuth provider | Google Cloud Console: create OAuth 2.0 credentials. Supabase Dashboard: enable Google provider, add redirect URI `https://your-domain.com/auth/callback`. |
| M3 | **Supabase** | Configure custom SMTP | Free tier limits auth emails to 3/hour. Go to Supabase Dashboard > Auth > SMTP Settings. Use Resend, SendGrid, or any SMTP provider. Required for signup/password reset at any real scale. |
| M4 | **Stripe** | Create product + price | Dashboard > Products > "SubSnooze Pro Lifetime", one-time $39. Copy the Price ID (starts with `price_`) to `STRIPE_PRICE_ID_PRO_LIFETIME` env var. |
| M5 | **Stripe** | Create webhook endpoint | Dashboard > Webhooks > Add endpoint: `https://your-domain.com/api/stripe/webhook`. Subscribe to: `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`. Copy signing secret to `STRIPE_WEBHOOK_SECRET`. |
| M6 | **Vercel** | Deploy + set env vars | Deploy the app to Vercel. Set ALL env vars from `.env.local.example`. Critically: set `CRON_SECRET` (any random string, e.g. `openssl rand -hex 32`) — cron jobs won't authenticate without it. |
| M7 | **Vercel** | Verify cron jobs run | After deploy, check Vercel Dashboard > Cron Jobs. 3 jobs should appear: advance-renewals (5am UTC), send-reminders (6am UTC), cancel-followup (9am UTC). Trigger one manually to verify. |
| M8 | **Vercel** | Set up staging + production environments | Create separate Vercel projects or use Environment Variables with preview/production scopes. Point staging to a separate Supabase project. |
| M9 | **DNS** | Custom domain + SSL | Buy domain, point DNS to Vercel, enable SSL. Update `NEXT_PUBLIC_APP_URL` env var to match. |

### Before Launch (Recommended)

| # | Service | Action | Details |
|---|---------|--------|---------|
| M10 | **Resend** | Create account + configure sender domain | Create account at resend.com. Verify your domain (add DNS records). Emails are sent as `SubSnooze <reminders@subsnooze.com>` — your domain must match. Copy API key to `RESEND_API_KEY`. Without this, email reminders silently skip. |
| M11 | **Firebase** | Create project + enable Cloud Messaging | Firebase Console: create project, enable Cloud Messaging, get VAPID key + app credentials. Set all 7 `NEXT_PUBLIC_FIREBASE_*` env vars. Without this, push notifications don't work. |
| M12 | **Sentry** | Create project | Create Next.js project at sentry.io. Copy DSN to `NEXT_PUBLIC_SENTRY_DSN`. Code handles graceful degradation if not set. |
| M13 | **PostHog** | Create project | Already wired in code. Create project at posthog.com. Copy API key to `NEXT_PUBLIC_POSTHOG_KEY`. Respects cookie consent + DNT. Analytics won't record until configured. |

### Can Do Later

| # | Service | Action | Details |
|---|---------|--------|---------|
| M14 | **Uptime monitoring** | Set up UptimeRobot / Better Stack | External service to monitor app availability. |
| M15 | **Google Play** | Developer account ($25 one-time) | Required for Play Store publication (TWA/PWABuilder). |
| M16 | **Apple** | Developer Program ($99/yr) | Required for App Store publication (Capacitor + StoreKit IAP). |

### Env Vars Checklist

| Variable | Required? | Where to get it |
|----------|-----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Dashboard > Settings > API (secret!) |
| `CRON_SECRET` | Yes | Generate: `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | Your production URL (e.g. `https://subsnooze.com`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe Dashboard > API keys |
| `STRIPE_SECRET_KEY` | Yes | Stripe Dashboard > API keys (secret!) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe Dashboard > Webhooks > Signing secret |
| `STRIPE_PRICE_ID_PRO_LIFETIME` | Yes | Stripe Dashboard > Products > Price ID |
| `RESEND_API_KEY` | Recommended | resend.com > API Keys |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Recommended | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Recommended | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Recommended | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Recommended | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Recommended | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Recommended | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Recommended | Firebase Console > Cloud Messaging > Web Push certificates |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry > Project Settings > DSN |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional | PostHog > Project Settings > API Key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional | Default: `https://us.i.posthog.com` |

---

## Code Tasks (Development Work)

### Tier 1 — Showstoppers

| # | Task | Details | Effort |
|---|------|---------|--------|
| C1 | **Implement FCM push sending** | `send-reminders/route.ts:117-123` is a placeholder comment: `// FCM sending would go here`. Push notifications are never actually delivered. Implement using FCM HTTP v1 API or Firebase Admin SDK. | 2-3 hrs |
| C2 | **Fix "Decide Later" button** | `CancelRedirectModal.tsx` sets `remindMe = true` but the flag is never used — no reminder is scheduled. Core ADHD principle violated. | 1-2 hrs |

### Tier 2 — Critical UX

| # | Task | Details | Effort |
|---|------|---------|--------|
| C3 | **Fix scroll-to-top** | Tab switches restore old scroll position instead of resetting. `popstate` handler doesn't call `scrollTo(0, 0)`. | 30 min |
| C4 | **Add usage indicator to Dashboard** | "3/5 subscriptions" for free, "Pro" badge for premium. Natural upgrade discovery. | 1-2 hrs |
| C5 | **Add escalation to final reminder** | All 3 touches use same format/urgency/channel. 1-day reminder should be visually urgent + use email if push was ignored. | 2 hrs |
| C6 | **Make renewal date optional or approximate** | ADHD users don't know exact dates. Default estimate + "we'll refine this" message. | 1-2 hrs |
| C7 | **Fix cancel URL XSS** | `SubscriptionManagement.tsx` — use `url.href` instead of raw user string. | 5 min |
| C8 | **Improve session recovery** | Clear login redirect on expired session. Add "Welcome back" banner for returning users. | 1-2 hrs |
| C9 | **Specific error messages** | Replace generic toasts with shame-free specifics ("No internet", "5 subscription limit"). | 1 hr |

### Tier 3 — Business & Polish

| # | Task | Details | Effort |
|---|------|---------|--------|
| C10 | **Handle silent Stripe portal failure** | `Settings.tsx` has empty catch block on portal redirect. Add error toast. | 10 min |
| C11 | **Extract shared price calculation utility** | `* 4.33` duplicated in 5 files. Extract `toMonthlyPrice()` using `52/12`. | 30 min |

### Tier 4 — PWA & Integration Hardening

| # | Task | Details |
|---|------|---------|
| C12 | **Install prompt (A2HS)** | Detect `beforeinstallprompt`, show contextual install banner. |
| C13 | **Standalone mode detection** | Detect `display-mode: standalone` via `matchMedia`. Hide install prompt, show update toast. |
| C14 | **Update available toast** | Show "Update available — tap to refresh" when new SW version detected. |
| C15 | **iOS PWA meta tags audit** | Verify `apple-mobile-web-app-capable`, status-bar-style, splash screens. |
| C16 | **Keyboard-aware layout** | Virtual keyboard pushes fixed bottom elements on mobile. Add `visualViewport` listener. |
| C17 | **Bottom sheet modals** | Convert modals to mobile-friendly bottom sheets with drag-to-dismiss. |
| C18 | **Landscape mode** | Test and fix layout at landscape orientations. |
| C19 | **Supabase realtime reconnect** | Handle channel disconnect/reconnect. Show stale data indicator. |
| C20 | **Offline mutation queue** | Queue mutations when offline, replay when back online. |
| C21 | **Auth session edge cases** | Test: expired refresh token, concurrent tabs, incognito, cookies blocked. |
| C22 | **Edge function error handling** | Structured logging, FCM retry logic, dead letter handling. |
| C23 | **CSP audit** | Review Content-Security-Policy with CSP-evaluator. |

### Tier 5 — Test Coverage

| # | Task | Coverage Target |
|---|------|----------------|
| C24 | **useSubscriptions hook tests** | Add (optimistic + rollback), realtime dedup, cancel, restore. |
| C25 | **useNotifications hook tests** | Mark read/unread, delete, pagination, realtime sync. |
| C26 | **Stripe webhook handler tests** | Valid/invalid signature, duplicate events, unknown event types. |
| C27 | **Auth flow integration tests** | Login, signup, password reset, token refresh, logout. |
| C28 | **Component snapshot/interaction tests** | Dashboard (0/1/many subs), AddSubscriptionWizard, cancel flow. |
| C29 | **E2E smoke test (Playwright)** | Signup -> add sub -> dashboard -> cancel -> verify. |
| C30 | **Accessibility tests (axe-core)** | Integrate axe-core, flag WCAG AA violations. |
| C31 | **Edge function tests** | send-reminders stage detection, skip already-sent, batch processing. |

### Tier 6 — Feature Polish

| # | Task | Details |
|---|------|---------|
| C32 | **`selectedSub` stale data** | Realtime updates don't reflect on manage screen. |
| C33 | **Chain-add paywall UX** | Show inline limit message instead of redirect to dashboard + modal. |
| C34 | **Notification deep link** | Push notification tap should deep-link to specific subscription. |
| C35 | **Export CSV completeness** | Verify all fields exported. |
| C36 | **Dark mode edge cases** | Audit modals, toasts, landing page, login, offline page. |
| C37 | **Reminder preset persistence** | Verify preset changes update DB and are respected by cron. |

### Tier 7 — New Features (V1.1)

| # | Feature | Details |
|---|---------|---------|
| C38 | **i18n foundation (next-intl)** | Extract all strings, locale detection, FR + EN, currency/date localization. |
| C39 | **Do Not Disturb hours** | `dnd_start`/`dnd_end` fields, cron respects DND window, Settings UI. |

### Tier 8 — Future (V2+)

| # | Feature | Notes |
|---|---------|-------|
| C40 | **SMS reminders (Twilio)** | Hardest-to-ignore channel for ADHD users. Pro-only. |
| C41 | **Push notification action buttons** | "Cancel now", "Snooze" — reduce friction. |
| C42 | **FCM token refresh logic** | Prevent silent stale-token failures. |
| C43 | **Weekly digest email** | "Here's what's coming up this week." |
| C44 | **Welcome back banner** | "2 subscriptions renewed since your last visit." |
| C45 | **Family/shared subscriptions** | Multi-user subscription management. |
| C46 | **Google Play Store (TWA)** | PWABuilder/Bubblewrap wrapper. |
| C47 | **iOS App Store (Capacitor)** | StoreKit IAP required by Apple. |

---

## Not Building

| Item | Why |
|------|-----|
| Full billing/account page | One-time $39 purchase. Stripe Portal handles receipts/refunds. |
| In-app payment history | Stripe Portal shows this. Don't duplicate. |
| MFA / 2FA | Adds login friction. ADHD users will forget their 2FA device. |
| Audit logs | Enterprise feature, not relevant. |
| Subscription drafts | Over-engineering. Just let users save incomplete subs normally. |
| AI cancellation assistant | Post-traction feature. |
| Browser extension | Post-traction feature. |

---

## Already Done (removed from previous backlog)

- ~~Configure cron jobs~~ — `vercel.json` now has 3 crons (advance-renewals, send-reminders, cancel-followup)
- ~~Implement email reminders~~ — Resend integration in `/api/email/send-reminder`, called by send-reminders cron
- ~~Fix PRO_FEATURES list~~ — Updated to "Push + Email reminders", removed SMS and "Priority support" claims
- ~~Add webhook idempotency~~ — `stripe_events` table (migration 008) + dedup check in webhook handler
- ~~Remove console.log from production~~ — Gated behind `NODE_ENV === 'development'`
