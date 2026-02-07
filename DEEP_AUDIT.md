# SubSnooze — Deep Production Audit (Revised)

> Date: 2026-02-07 (revised)
> Product: ADHD-friendly subscription tracker
> Core promise: **"Stop paying the ADHD tax on subscriptions"**
> Overall: **Production-ready.** The reminder system works end-to-end. The core product delivers on its promise. What remains is dashboard configuration and V1.1 features.

---

## How This Audit Is Organized

Everything is evaluated against one question: **does this help an ADHD user stop wasting money on forgotten subscriptions?**

Three tiers:
- **THE PRODUCT** — the reminder pipeline.
- **THE EXPERIENCE** — friction points that cause ADHD users to abandon the app.
- **THE BUSINESS** — Stripe, billing, email branding.

---

## 1. THE PRODUCT: Reminder System ✅

### 1.1 Cron Jobs — ✅ Configured

`vercel.json` has all 3 cron jobs configured:
- `advance-renewals`: daily at 05:00 UTC (runs before send-reminders)
- `send-reminders`: daily at 06:00 UTC
- `cancel-followup`: daily at 09:00 UTC

All paths match their route handlers. Auth is via `CRON_SECRET` bearer token.

### 1.2 Email Reminders — ✅ Implemented

**Files:** `api/cron/send-reminders/route.ts`, `api/email/send-reminder/route.ts`

- `send-reminders` checks `email_reminders_enabled && email` → calls `/api/email/send-reminder`
- Email endpoint uses Resend API with proper auth, HTML templates, and urgency-aware styling
- Graceful degradation: if `RESEND_API_KEY` not set, returns `{ sent: false }` without error
- **Requires:** `RESEND_API_KEY` env var to be configured (see Launch Checklist below)

### 1.3 Push Notifications — ✅ Working

FCM push notifications work when token is valid. Token refresh logic runs on app load (`usePushNotifications.ts:24-49`).

### 1.4 Escalation on Final Reminder — ✅ Implemented

The 1-day reminder is visually and textually distinct:
- Push: `⚠️ {name} renews TOMORROW` — "LAST CHANCE!" body, `warning` type
- Email: Coral accent `#C9553D`, `⚠️` icon, "Review Now" CTA (vs. teal/"Open SubSnooze" for normal)
- In-app notification type: `warning` (vs. `info` for 14/7-day)

### 1.5 "Decide Later" — ✅ Works

`CancelRedirectModal` → `onDecideLater` → `recordCancelAttempt()` → sets `cancel_attempt_date` in DB → `cancel-followup` cron sends "Did you cancel?" notification 3 days later.

### 1.6 Reminder Flags / Deduplication — ✅ Correct

`advance-renewals` cron resets all 4 reminder flags (`reminder_14/7/3/1_day_sent`) + `reminders_sent` counter when a renewal date passes. Prevents duplicate reminders for the next cycle.

### 1.7 FCM Token Refresh — ✅ Handled

`usePushNotifications` hook refreshes FCM token on mount when push is enabled and permission is granted. Stale tokens are updated in the `users` table.

### Summary: Reminder System Reliability

| Component | Status |
|-----------|--------|
| Cron job execution | ✅ Configured |
| Push notifications (FCM) | ✅ Working + token refresh |
| Email reminders | ✅ Implemented (needs RESEND_API_KEY) |
| SMS reminders | ⏳ V1.1 — "Coming soon" in UI |
| Escalation on 1-day | ✅ Visual + copy differentiation |
| "Decide Later" reminder | ✅ Triggers cancel-followup cron |
| Reminder flags / dedup | ✅ Reset on renewal advance |

---

## 2. THE EXPERIENCE: ADHD Friction Points

### 2.1 Scroll-to-Top — ✅ Fixed

`navigateTo()` and `popstate` handler both call `window.scrollTo(0, 0)` on every screen change. No scroll restoration on tabs — intentionally removed as it's disorienting for ADHD users.

### 2.2 Renewal Date — ✅ "Don't Know" Option

`SubscriptionFormFields` shows "I don't know — estimate for me" when the date field is empty. Auto-calculates `today + 1 billing cycle`.

### 2.3 Cancel Flow Context Switch — ⚠️ Mitigated

Opening the service's cancellation URL in a new tab is unavoidable. The `cancel-followup` cron catches users who forget to come back — sends "Did you cancel?" 3 days later.

### 2.4 Session Recovery — ✅ Timeout + Retry

10-second timeout shows "Taking longer than usual…" with a retry button. Prevents infinite skeleton for ADHD users returning after weeks.

**V1.1:** "Welcome back! 2 subs renewed since last visit" banner.

### 2.5 Error Messages — ✅ Specific + Shame-Free

All error handlers check `navigator.onLine` first → show "No internet connection" when offline. Each action has its own message:
- "our server hit a snag" (add/restore/remove/save)
- "your data is safe" (cancel confirmation)
- "nothing changed" (cancel flow start)

### ADHD Scorecard (Updated)

| User Loop | Rating | Notes |
|-----------|--------|-------|
| Adding a subscription | 8/10 | Service search + chain add + "don't know" date option |
| Viewing subscriptions | 8/10 | Visual hierarchy, monthly spend, "Coming Up" section |
| Cancelling | 7/10 | Shame-free flow, "Decide Later" works, followup cron catches drop-offs |
| Returning after absence | 7/10 | Session recovery works, no "welcome back" banner yet (V1.1) |
| Getting reminders | 8/10 | 3-touch system works, email + push, escalation on final day |

---

## 3. THE BUSINESS: Stripe, Billing, Pro Plan

### 3.1 Pro Plan Visibility — ✅ Fixed

| Touchpoint | What Happens |
|------------|-------------|
| Dashboard | Usage indicator: "3/5" for free, "Pro" badge for premium |
| Settings | Side-by-side Free vs Pro comparison + upgrade CTA |
| 5-sub limit hit | UpgradeModal auto-opens |

### 3.2 PRO_FEATURES — ✅ Accurate

```typescript
FREE_FEATURES: ["Track up to 5 subscriptions", "Push notifications", "Renewal reminders"]
PRO_FEATURES: ["Unlimited subscriptions", "Push notifications", "CSV export"]
```

### 3.3 Stripe — ✅ Code Complete

- Checkout flow (one-time $39) ✅
- Webhook signature verification ✅
- Webhook idempotency (stripe_events table) ✅
- Customer creation + dedup ✅
- Portal session with error toast ✅

**Dashboard config needed:** Create product + $39 one-time price → set `STRIPE_PRICE_ID_PRO_LIFETIME`

### 3.4 Supabase Auth Email Limit

Free tier: 3 auth emails/hour. **Fix:** Configure custom SMTP in Supabase Dashboard.

---

## 4. SECURITY ✅

| Issue | Status |
|-------|--------|
| Cancel URL XSS | ✅ `new URL()` + protocol whitelist + `url.href` |
| console.error in production API routes | ✅ All gated behind `NODE_ENV === "development"` |
| Webhook idempotency | ✅ `stripe_events` table check before processing |

---

## 5. CODE QUALITY

| Issue | Status |
|-------|--------|
| Price calc duplication | ✅ `toMonthlyPrice()` shared utility using `52/12` |
| Empty catch blocks | ✅ All catches have error handling or explanatory comments |
| E2E tests | ⏳ V1.1 — 51 unit tests exist, 0 Playwright tests |

---

## 6. LAUNCH CHECKLIST (Dashboard Config Only)

These require no code changes — they're service dashboard configuration:

| # | Task | Where |
|---|------|-------|
| 1 | Create Stripe product + $39 one-time price | Stripe Dashboard → Products |
| 2 | Set `STRIPE_PRICE_ID_PRO_LIFETIME` env var | Vercel → Environment Variables |
| 3 | Create Stripe webhook endpoint | Stripe Dashboard → Webhooks |
| 4 | Subscribe to: `checkout.session.completed`, `charge.refunded`, `charge.dispute.created` | Stripe webhook config |
| 5 | Set `RESEND_API_KEY` env var | Resend Dashboard → API Keys |
| 6 | Configure custom SMTP for Supabase auth | Supabase Dashboard → Auth → SMTP |
| 7 | Set `CRON_SECRET` env var | Vercel → Environment Variables |
| 8 | Configure staging + production environments | Vercel project settings |
| 9 | Domain name + SSL | Domain registrar + Vercel |

---

## 7. V1.1 ROADMAP

| # | Feature | Notes |
|---|---------|-------|
| 1 | SMS reminders (Twilio) | Hardest-to-ignore channel for ADHD users |
| 2 | Push notification action buttons | "Cancel now" / "Snooze" from notification |
| 3 | Weekly digest email | "Here's what's coming up this week" |
| 4 | Welcome back banner | "2 subs renewed since last visit" |
| 5 | E2E tests (Playwright) | Critical flows: add, cancel, upgrade |
| 6 | i18n (next-intl) + currency localization | Full internationalization |
| 7 | "Do not disturb" hours | Respect ADHD sleep patterns |

---

## What NOT to Build

| Item | Why Skip It |
|------|------------|
| Full billing/account page | One-time $39 purchase. Stripe Portal handles everything |
| In-app payment history | Stripe Portal shows this |
| In-app refund flow | Email support is fine for a small app |
| MFA / 2FA | Adds login friction. ADHD users will forget their 2FA device |
| Audit logs | Enterprise feature, not relevant |
| Public pricing page | Upgrade modal already shows the comparison |
| Subscription drafts | Over-engineering. Just let users save incomplete subs normally |
