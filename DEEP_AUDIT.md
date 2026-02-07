# SubSnooze — Deep Production Audit

> Date: 2026-02-07
> Overall status: **~95% feature-complete, ~75% production-ready**
> Key blockers: Custom email, Stripe hardening, scroll bugs, security fixes

---

## Table of Contents

1. [Critical Bugs](#1-critical-bugs)
2. [Supabase Auth & Email](#2-supabase-auth--email)
3. [Stripe Production Readiness](#3-stripe-production-readiness)
4. [Scroll-to-Top Bug](#4-scroll-to-top-bug)
5. [Security Issues](#5-security-issues)
6. [UX/UI Issues](#6-uxui-issues)
7. [Code Quality](#7-code-quality)
8. [Missing Features](#8-missing-features)
9. [Infrastructure & Ops](#9-infrastructure--ops)
10. [Priority Action Plan](#10-priority-action-plan)

---

## 1. Critical Bugs

### 1.1 Cancel URL XSS Vulnerability
**File:** `src/components/screens/SubscriptionManagement.tsx` ~line 203

```tsx
const url = new URL(subscription.cancelUrl)
if (url.protocol === "https:" || url.protocol === "http:") {
  window.open(subscription.cancelUrl, "_blank", "noopener,noreferrer")
  //          ^^^^^^^^^^^^^^^^^^^^^^^^ USES ORIGINAL, NOT VALIDATED url.href
}
```

**Problem:** Opens the original user-supplied string, not the validated `URL` object. A crafted input could bypass the protocol check.
**Fix:** Use `url.href` instead of `subscription.cancelUrl`.

### 1.2 Inaccurate Weekly-to-Monthly Price Conversion (5 locations)
Uses `* 4.33` in 5 separate files. Correct value is `52/12 ≈ 4.3333`. Off by ~0.08% per weekly subscription — compounds across a user's subscriptions.

**Affected files:**
- `src/hooks/useSubscriptions.ts`
- `src/app/page.tsx`
- `src/components/screens/AllSubscriptions.tsx`
- `src/components/screens/SubscriptionManagement.tsx`
- `src/components/screens/modals/CancelRedirectModal.tsx`

**Fix:** Extract to a shared utility function using `52/12`.

### 1.3 Stripe Webhook Has No Idempotency Protection
**File:** `src/app/api/stripe/webhook/route.ts`

Stripe retries failed webhooks. Without checking `event.id`, a `checkout.session.completed` event could be processed multiple times.

**Fix:** Add a `stripe_events` table or `stripe_event_id` column with UNIQUE constraint. Check before processing.

---

## 2. Supabase Auth & Email

### 2.1 Current State

| Email Type | Implemented | How |
|------------|------------|-----|
| Signup confirmation | Yes | Supabase Auth built-in |
| Password reset | Yes | Supabase Auth built-in |
| Subscription reminders | **NO** | FCM push notifications only |
| Cancel follow-up | **NO** | FCM push notifications only |
| Weekly digest | **NO** | Not implemented |

### 2.2 Supabase Free Tier Limit: **3 emails/hour**

This is a hard blocker for production. With even moderate signups, confirmation emails will be delayed or dropped.

### 2.3 `email_reminders_enabled` Is Dead Code

The Settings UI has an "Email reminders" toggle that saves to the database, but:
- `send-reminders` edge function **ignores** this flag entirely
- `cancel-followup` edge function **ignores** this flag entirely
- No email service (Resend, SendGrid, etc.) is integrated
- No email templates exist

### 2.4 What Needs to Happen

**Option A — Full email support (recommended):**
1. Integrate an email service (Resend is simplest for Next.js)
2. Configure custom SMTP in Supabase Dashboard for auth emails (removes 3/hr limit, adds branding)
3. Create HTML email templates for reminders (7-day, 3-day, 1-day)
4. Update `send-reminders` edge function to check `email_reminders_enabled` and send emails
5. Add email env vars: `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`

**Option B — Push-only (minimal):**
1. Remove the `email_reminders_enabled` toggle from Settings (it's misleading)
2. Still configure custom SMTP for auth emails to remove the 3/hr limit
3. Document that reminders are push-notification-only

### 2.5 Missing Environment Variables for Email

```
# Not in .env.local.example yet:
RESEND_API_KEY=             # or SENDGRID_API_KEY
EMAIL_FROM_ADDRESS=         # e.g. notifications@subsnooze.com
SUPABASE_SMTP_HOST=         # Custom SMTP for auth emails
SUPABASE_SMTP_PORT=
SUPABASE_SMTP_USER=
SUPABASE_SMTP_PASS=
```

---

## 3. Stripe Production Readiness

### 3.1 What's Working

| Component | Status |
|-----------|--------|
| Checkout flow (one-time $39) | Working |
| Webhook signature verification | Correct |
| Customer creation & dedup | Working |
| `receipt_email` passed | Yes |
| CSP for Stripe.js | Correct |
| Env-var based keys (no hardcoded test keys) | Correct |
| Billing Portal | Working |
| Tier enforcement (5 free subs) | Working |

### 3.2 What's Missing

| Issue | Severity | Details |
|-------|----------|---------|
| **No webhook idempotency** | Critical | Duplicate events could grant/revoke Pro twice |
| **Silent portal failure** | High | `Settings.tsx` catches Stripe portal errors silently — no user feedback |
| **No structured logging** | Medium | Webhook uses `console.log` for payment events — should use Sentry |
| **No checkout rate limiting** | Medium | Users could spam the checkout endpoint |
| **No webhook retry tracking** | Medium | No dead-letter queue for failed webhook processing |

### 3.3 Stripe Dashboard Setup Checklist

```
[ ] Create "SubSnooze Pro Lifetime" product
[ ] Create $39 USD one-time price → copy ID to STRIPE_PRICE_ID_PRO_LIFETIME
[ ] Create webhook endpoint → https://yourdomain.com/api/stripe/webhook
[ ] Subscribe to events: checkout.session.completed, charge.refunded, charge.dispute.created
[ ] Copy webhook signing secret → STRIPE_WEBHOOK_SECRET
[ ] Enable Billing Portal in Settings
[ ] Switch from test keys to live keys
[ ] Test end-to-end with a real $1 charge
```

---

## 4. Scroll-to-Top Bug

### 4.1 Root Cause

**File:** `src/app/page.tsx` ~line 156 (`navigateTo` function)

The `useScrollRestore` hook **intentionally saves and restores scroll positions** per screen. When switching tabs:
1. Current scroll position is saved for the old screen
2. New screen renders
3. Old scroll position is **restored** for the new screen (if previously visited)

This means going back to Dashboard after scrolling down will **return you to the old scroll position**, not the top.

### 4.2 Timing Race Condition

```tsx
setScreen(newScreen)          // React queues re-render (async)
restoreScroll(newScreen)      // Called IMMEDIATELY before render completes
```

`restoreScroll` uses `requestAnimationFrame`, but the new screen may not be fully rendered by then — especially with animations (`screen-slide-in`) or async data loading.

### 4.3 Browser Back Button Doesn't Restore Scroll

**File:** `src/app/page.tsx` ~line 195

The `popstate` handler restores the screen and tab but **never calls** `restoreScroll()` or `window.scrollTo(0, 0)`.

### 4.4 Recommended Fixes

1. **Always scroll to top on tab switch** — more ADHD-friendly, less confusing:
   ```tsx
   // In navigateTo, replace restoreScroll with:
   requestAnimationFrame(() => window.scrollTo(0, 0))
   ```
2. **Move scroll logic into a `useEffect`** triggered by `screen` state change (ensures render is complete)
3. **Add `window.scrollTo(0, 0)` to the popstate handler**
4. **If scroll restore is desired**, use `useLayoutEffect` after the screen dependency changes, not inline in the callback

---

## 5. Security Issues

### 5.1 Cancel URL Bypass (Critical — see 1.1)

### 5.2 console.log Leaks Internal Data
**Files:**
- `src/lib/analytics/web-vitals.ts:9` — logs metrics to browser console
- `src/app/api/stripe/webhook/route.ts:57,74,98,125` — logs user IDs and payment status

**Fix:** Remove or gate behind `NODE_ENV === 'development'`.

### 5.3 dangerouslySetInnerHTML in Layout
**File:** `src/app/layout.tsx:81`

Used for the dark-mode FOUC-prevention script. Currently safe (hardcoded string), but fragile. Consider using `next/script` with `strategy="beforeInteractive"` instead.

---

## 6. UX/UI Issues

### 6.1 Currency Selector Doesn't Convert Prices
Changing currency in Settings just swaps the symbol ($ → €) without converting values. A $10/mo subscription shows as €10/mo — misleading.

**Options:**
- A) Implement real-time currency conversion (complex, needs API)
- B) Store prices per-currency and clarify the setting is for **new** subscriptions only
- C) Add a disclaimer: "Currency symbol only — prices are stored as entered"

### 6.2 No Read-Only Subscription Detail View
Users must enter edit mode to see full subscription details. Consider a detail view that shows info without edit affordances.

### 6.3 Generic Error Messages
`toast(t("toast.couldntAdd"), "error")` — doesn't tell users WHY (network error? validation? free tier limit?). Should differentiate error types.

### 6.4 Silent Stripe Portal Failure (see 3.2)
Button click → nothing happens. Should show error toast.

### 6.5 Cancel Tracking Not Exposed
`cancel_attempt_date` and `cancel_verified` are tracked in DB but never shown to users. Consider a "Cancellation pending — verify by [date]" status.

### 6.6 SMS Toggle Shows "Coming Soon" Forever
`email_reminders_enabled` works (even though backend doesn't use it), but SMS toggle shows "Coming soon" with no timeline. Consider removing it entirely until implemented.

---

## 7. Code Quality

### 7.1 Duplicated Price Calculation Logic (5 files)
The weekly→monthly conversion (`* 4.33`) is copy-pasted in 5 locations. Should be a single utility:
```tsx
// src/lib/price-utils.ts
export function toMonthlyPrice(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "weekly": return price * (52 / 12)
    case "yearly": return price / 12
    case "monthly": return price
  }
}
```

### 7.2 Empty Catch Blocks
- `src/app/layout.tsx:71` — theme detection script swallows all errors
- `src/components/screens/Settings.tsx:774` — Stripe portal errors silently caught

### 7.3 No Integration/E2E/Component Tests
- 51 unit tests exist (date-utils, rate-limit, services, utils)
- 0 integration tests (auth flow, API routes, database)
- 0 E2E tests (no Playwright/Cypress)
- 0 component tests (no React Testing Library)

---

## 8. Missing Features

| Feature | Status | Priority |
|---------|--------|----------|
| Email reminders (backend) | Not implemented — toggle is dead code | High |
| Custom SMTP for auth emails | Not configured | High (blocks production scale) |
| Webhook idempotency | Missing | High |
| SMS reminders | UI says "Coming soon", no backend | Low — remove or implement |
| MFA / 2FA | Not implemented | Medium (V1.1) |
| Weekly summary digest | Not implemented | Low (V1.1) |
| Audit logs | Not implemented | Low (V1.1) |
| Family/multi-user sharing | Not implemented | Low (V2) |
| Subscription drafts | Not implemented | Low (V1.1) |
| Do Not Disturb hours | Not implemented | Low (V1.1) |
| Uptime monitoring | Not configured | Medium |

---

## 9. Infrastructure & Ops

| Item | Status |
|------|--------|
| Staging environment | Not configured |
| Production environment | Not configured |
| Custom domain | Not acquired |
| Custom SMTP | Not configured |
| Uptime monitoring | Not set up |
| Database backups | Script exists, not automated/scheduled |
| Stripe Dashboard setup | Not done |

---

## 10. Priority Action Plan

### P0 — Fix Before Launch

| # | Task | Effort |
|---|------|--------|
| 1 | Fix cancel URL XSS (`url.href` not original string) | 5 min |
| 2 | Fix scroll-to-top: always reset on tab switch + add to popstate handler | 30 min |
| 3 | Configure custom SMTP in Supabase (removes 3 email/hr limit) | 30 min (dashboard) |
| 4 | Add Stripe webhook idempotency (event ID tracking) | 1-2 hrs |
| 5 | Remove `console.log` from production paths or gate behind dev check | 15 min |
| 6 | Add error feedback for Stripe portal failure in Settings | 10 min |
| 7 | Either implement email reminders or remove the dead toggle | 2-4 hrs or 10 min |

### P1 — Important for V1

| # | Task | Effort |
|---|------|--------|
| 8 | Extract price calculation to shared utility (fix 4.33 → 52/12) | 30 min |
| 9 | Add Stripe Dashboard products/prices/webhooks | 30 min (dashboard) |
| 10 | Set up staging + production on Vercel | 1 hr (dashboard) |
| 11 | Acquire custom domain | 10 min |
| 12 | Add detailed error messages (not generic toasts) | 1 hr |
| 13 | Clarify currency selector behavior | 30 min |

### P2 — Nice to Have

| # | Task | Effort |
|---|------|--------|
| 14 | Add integration tests for auth + Stripe flows | 4-8 hrs |
| 15 | Add E2E tests (Playwright) | 4-8 hrs |
| 16 | Set up uptime monitoring | 30 min |
| 17 | Add read-only subscription detail view | 2 hrs |
| 18 | Remove or implement SMS toggle | 10 min |
| 19 | Expose cancel tracking status in UI | 1 hr |
| 20 | Add `next/script` instead of dangerouslySetInnerHTML | 15 min |
