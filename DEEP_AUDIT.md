# SubSnooze — Deep Production Audit (Mission-Aligned)

> Date: 2026-02-07
> Product: ADHD-friendly subscription tracker
> Core promise: **"Stop paying the ADHD tax on subscriptions"**
> Overall: The app looks 95% done. It's closer to **60% functional** — because the reminder system, the entire product, doesn't actually run.

---

## How This Audit Is Organized

Everything is evaluated against one question: **does this help an ADHD user stop wasting money on forgotten subscriptions?**

Three tiers:
- **THE PRODUCT** — the reminder pipeline. If this doesn't work, nothing else matters.
- **THE EXPERIENCE** — friction points that cause ADHD users to abandon the app.
- **THE BUSINESS** — Stripe, billing, email branding. Important but not the product.

---

## 1. THE PRODUCT: Reminder System

### 1.1 The Cron Jobs Don't Run

**This is a showstopper.** `vercel.json` has `"crons": []` — empty.

The three edge functions that ARE the product:
- `send-reminders` — sends 7/3/1-day push notifications
- `advance-renewals` — advances renewal dates when they pass
- `cancel-followup` — follows up 3 days after a cancel attempt

**None of them are scheduled.** They will never execute. The entire 3-touch reminder system is dead code in production.

**Fix:** Configure Supabase scheduled jobs (or Vercel crons):
- `advance-renewals`: daily at 05:00 UTC (must run before send-reminders)
- `send-reminders`: daily at 06:00 UTC
- `cancel-followup`: daily at 09:00 UTC

### 1.2 Email Reminders Don't Exist

The Settings UI has an "Email reminders" toggle. It saves `email_reminders_enabled` to the database. **No backend code reads this flag.** No email service is integrated. No templates exist.

This isn't just a missing feature — it breaks the product promise:
- ADHD users dismiss push notifications compulsively
- Push notifications require permission (many deny it)
- If phone is off/dead, push is lost forever
- Email is the safety net that catches what push misses

**What `send-reminders` actually does today:**
1. Checks `push_enabled && fcm_token` → sends FCM push
2. Creates in-app notification record
3. That's it. No email path exists.

**Impact:** A user who denies push permission receives **zero reminders ever**. The product doesn't work for them.

### 1.3 SMS Reminders Don't Exist (But Should)

Settings has an SMS toggle showing "Coming soon." No Twilio/SMS backend. For ADHD users, SMS is the hardest channel to ignore — it's the escalation path when push and email fail.

**Decision needed:** Is SMS part of V1 or V1.1? Either way, the `PRO_FEATURES` list in `pricing.ts` currently claims "SMS + Push + Email reminders" — advertising three channels when only one works.

### 1.4 No Escalation When Reminders Are Ignored

The 3-touch system (7/3/1 days) is brilliant in theory. In practice:
- All 3 reminders use the same format, same urgency, same channel
- If user dismisses all 3 push notifications, **nothing changes**
- No email fallback. No SMS escalation. No "URGENT" styling on the final reminder
- No way to detect if the user even saw the notification
- The subscription renews silently

For an ADHD user who will dismiss notifications reflexively, same-channel same-urgency repetition is insufficient.

### 1.5 FCM Token Goes Stale Silently

- FCM tokens expire when users clear browser data, uninstall, or switch devices
- `send-reminders` tries to send to a stale token → FCM returns error → reminder is silently dropped
- No retry logic, no token refresh, no fallback to email
- User has no idea their reminders stopped working

### 1.6 "Decide Later" Doesn't Actually Remind

**File:** `src/components/screens/modals/CancelRedirectModal.tsx`

The cancel flow offers a "Decide Later — remind me" button. This is a core ADHD UX principle.

**What it actually does:** Sets `remindMe = true`, passes it up the component tree... and it's never used. The flag is ignored. No reminder is scheduled. The user believes they'll be reminded but won't be.

This is the most ADHD-hostile bug in the app — it exploits the exact executive function deficit the product is supposed to help with.

### 1.7 Reminder Flags Are Correct (One Thing That Works)

The `subscriptions_needing_reminders` view correctly checks per-subscription flags (`reminder_7_day_sent`, `reminder_3_day_sent`, etc.) before querying. `advance-renewals` resets these flags when the renewal date advances. Duplicates are prevented.

**But this only matters if the cron jobs actually run.**

### Summary: Reminder System Reliability

| Component | Status | Impact |
|-----------|--------|--------|
| Cron job execution | **NOT CONFIGURED** | System is non-functional |
| Push notifications (FCM) | Works when token is valid | Only delivery channel |
| Email reminders | **DEAD CODE** — toggle exists, backend ignores it | No fallback for push |
| SMS reminders | **NOT IMPLEMENTED** | No escalation path |
| Escalation logic | **DOESN'T EXIST** | All 3 touches identical |
| "Decide Later" reminder | **BROKEN** — flag ignored | Betrays user trust |
| FCM token staleness | **UNHANDLED** | Silent failure |
| Reminder flags/dedup | Correct | Works if crons run |
| Notification content | Good (name + price included) | Push has no action buttons |

---

## 2. THE EXPERIENCE: ADHD Friction Points

### 2.1 Scroll-to-Top Bug

**File:** `src/app/page.tsx:175-181`

When switching between tabs (Dashboard ↔ All Subs ↔ Settings), `useScrollRestore` restores the old scroll position instead of resetting to top. For detail screens it correctly scrolls to top, but tab screens restore old positions.

Additionally, the `popstate` handler (browser back) never calls `scrollTo(0, 0)` or `restoreScroll()` at all — the screen changes but scroll position is random.

For ADHD users, unexpected scroll positions are disorienting and break spatial memory.

**Fix:** Always scroll to top on any screen change. Remove scroll restoration for tabs — it's more confusing than helpful in a single-page app.

### 2.2 Renewal Date Picker Requires Knowledge ADHD Users Don't Have

**File:** `src/components/ui/SubscriptionFormFields.tsx`

Adding a subscription requires an exact renewal date. Default: `today + 1 billing cycle`. But Netflix doesn't renew "one month from today" — it renews on the 15th, or the 3rd, or whatever day the user originally signed up.

Most ADHD users subscribed months ago and have no idea when renewal is. They'd need to check email or bank statements — exactly the kind of task ADHD users avoid.

**Recommendations:**
- Make renewal date optional with a default estimate + "we'll refine this" message
- Add a "Check your email for the exact date" helper with encouraging framing
- Or: "Not sure? We'll remind you around this time" (approximate is better than abandoned)

### 2.3 Cancel Flow Requires Leaving the App

**File:** `src/components/screens/SubscriptionManagement.tsx`

The cancel flow opens the service's cancellation URL in a new tab. User must:
1. Leave SubSnooze
2. Navigate the service's (often hostile) cancellation flow
3. Remember to come back to SubSnooze
4. Confirm they cancelled

For ADHD users, step 3 is where it breaks. Context switching is the #1 executive function deficit. They'll cancel Netflix, see a YouTube recommendation, and forget to confirm in SubSnooze.

**The `cancel-followup` edge function is designed to catch this** — it sends a "Did you actually cancel?" notification 3 days later. But it doesn't run (see 1.1 — cron not configured).

### 2.4 Session Recovery After Weeks Away

**File:** `src/app/page.tsx`, `src/hooks/useUser.ts`

When an ADHD user opens the app after 2 weeks (common pattern — use it once when motivated, forget for weeks):
- Supabase JWT is expired
- Refresh token should silently get a new JWT
- If refresh token is also expired → user should see login screen

**Problem:** The transition from "checking auth" to "show login" isn't clearly handled. There's a loading skeleton but the path from expired-session to login-redirect could leave the user staring at a skeleton indefinitely if auth recovery fails silently.

**Also missing:** No "Welcome back! Here's what happened" message. User opens app after 2 weeks and sees their dashboard with no context about what they missed. A "2 subscriptions renewed since your last visit" banner would help.

### 2.5 Generic Error Messages

Throughout the app, errors show as `toast("Couldn't add subscription", "error")`. For ADHD users, vague errors cause anxiety and abandonment. "Couldn't add" — why? Network? Did I do something wrong? Am I at the free limit?

Specific, shame-free messages like "No internet connection — try again" or "You've reached 5 subscriptions — upgrade for unlimited" are dramatically better for ADHD users.

### 2.6 ADHD Scorecard

| User Loop | Strength | Weakness | Rating |
|-----------|----------|----------|--------|
| **Adding a subscription** | Service search, chain add, auto-fill | Renewal date requires exact knowledge | 7/10 |
| **Viewing subscriptions** | Visual hierarchy, monthly spend prominence, "Coming Up" section | No "what changed since last visit" | 8/10 |
| **Cancelling** | Shame-free, celebratory, cancel URLs | Context switch to external site, broken "Decide Later" | 5/10 |
| **Returning after absence** | Real-time data, no re-onboarding | Unclear session recovery, no welcome-back | 5/10 |
| **Getting reminders** | Good architecture, 3-touch design | **Cron not configured, email dead, no escalation** | 2/10 |

---

## 3. THE BUSINESS: Stripe, Billing, Pro Plan

### 3.1 Pro Plan Is Invisible

| Touchpoint | What Happens |
|------------|-------------|
| Dashboard | Zero Pro references. No usage indicator |
| AllSubscriptions | Nothing |
| Onboarding | Nothing |
| Settings | "Upgrade to Pro" button (buried) |
| 5-sub limit hit | UpgradeModal auto-opens (user must fail first) |
| Public pricing page | Does not exist (checklist claims done, but no component/route) |

Free users have no organic way to discover Pro until they hit a wall. The Dashboard should show a "3/5 subscriptions" usage indicator — it's useful context AND natural upgrade discovery.

### 3.2 No Billing / Plan Page

The entire billing experience for Pro users is:
- Settings: "SubSnooze Pro — Lifetime access" badge + "Manage Billing" button → opens external Stripe Portal

There's no `/billing` or `/plan` screen. No in-app payment history, upgrade date, or usage dashboard.

**But is a full billing page actually needed?** It's a one-time $39 lifetime purchase. The user pays once and never thinks about it again. A complex billing dashboard is enterprise thinking — not ADHD-friendly.

**What actually makes sense:**
- Usage indicator on Dashboard ("3/5 subscriptions" for free users, "Pro" badge for premium)
- Settings already has the "Manage Billing" link to Stripe Portal (which handles receipts/refunds)
- A simple plan comparison accessible from Settings (not just hidden in the upgrade modal)

Don't build a full billing page. Build a clear plan status + usage indicator.

### 3.3 Stripe Is Code-Ready But Dashboard-Unconfigured

The code is solid:
- Checkout flow works (one-time $39)
- Webhook signature verification correct
- Customer creation + dedup correct
- receipt_email passed
- CSP correct for Stripe.js

**Missing:**
| Item | What to do |
|------|-----------|
| Create Stripe product | Dashboard → Products → "SubSnooze Pro Lifetime" |
| Create $39 one-time price | Copy Price ID → `STRIPE_PRICE_ID_PRO_LIFETIME` |
| Create webhook endpoint | `https://yourdomain.com/api/stripe/webhook` |
| Subscribe to events | `checkout.session.completed`, `charge.refunded`, `charge.dispute.created` |
| Webhook idempotency | Add `stripe_event_id` tracking to prevent duplicate processing |
| Silent portal failure | `Settings.tsx:774` — empty catch block. Add error toast |

### 3.4 PRO_FEATURES List Is Misleading

**File:** `src/lib/stripe/pricing.ts`

```typescript
PRO_FEATURES: [
  "Unlimited subscriptions",       // ✓ works
  "SMS + Push + Email reminders",  // ✗ only Push works
  "Priority support",              // ✗ no support system exists
  "CSV export",                    // ✓ works
]
```

Two of four claimed Pro features don't work. This needs to be updated to reflect reality — or the features need to be built before launch.

### 3.5 Supabase Auth Email: 3/hour Limit

Supabase free tier limits auth emails (signup confirmation, password reset) to 3 per hour. At any real scale, users won't receive confirmation emails.

**Fix:** Configure custom SMTP in Supabase Dashboard (Resend, SendGrid, or any SMTP provider). This is a dashboard configuration, not a code change.

---

## 4. SECURITY (Quick Fixes)

| Issue | File | Fix | Effort |
|-------|------|-----|--------|
| Cancel URL XSS | `SubscriptionManagement.tsx:203` | Use `url.href` instead of raw user string | 5 min |
| console.log in production | `webhook/route.ts`, `web-vitals.ts` | Gate behind `NODE_ENV === 'development'` | 15 min |
| Webhook idempotency | `webhook/route.ts` | Track `event.id`, check before processing | 1-2 hrs |

---

## 5. CODE QUALITY (Cleanup)

| Issue | Scope | Fix |
|-------|-------|-----|
| Price calc duplicated in 5 files using `* 4.33` | 5 files | Extract `toMonthlyPrice()` utility using `52/12` |
| Empty catch blocks | `Settings.tsx:774`, `layout.tsx:71` | Add error toasts / dev logging |
| 51 unit tests, 0 integration/E2E tests | Project-wide | Add Playwright for critical flows (add, cancel, upgrade) |

---

## 6. PRIORITY ACTION PLAN

### Tier 1 — The Product Doesn't Work Without These

| # | Task | Why It Matters | Effort |
|---|------|---------------|--------|
| 1 | **Configure cron jobs** for send-reminders, advance-renewals, cancel-followup | Reminder system is completely non-functional without this | 30 min |
| 2 | **Implement email reminders** — integrate Resend/SendGrid, create templates, wire into send-reminders | Push-only is single point of failure. ADHD users need redundancy | 4-6 hrs |
| 3 | **Configure custom SMTP** for Supabase auth emails | 3 emails/hour kills signup at any scale | 30 min (dashboard) |
| 4 | **Fix "Decide Later" button** — actually schedule a reminder or rename the button | Broken promise to the user. Core ADHD principle violated | 1-2 hrs |
| 5 | **Fix PRO_FEATURES list** — only claim what works | Advertising non-functional features is dishonest | 15 min |

### Tier 2 — ADHD Users Will Abandon Without These

| # | Task | Why It Matters | Effort |
|---|------|---------------|--------|
| 6 | **Fix scroll-to-top** on all view/tab changes + popstate | Disorienting for ADHD users, breaks spatial memory | 30 min |
| 7 | **Add usage indicator to Dashboard** ("3/5 subs" for free, "Pro" badge for premium) | Users need context without thinking. Also natural upgrade discovery | 1-2 hrs |
| 8 | **Add escalation to final reminder** — 1-day reminder should be visually urgent + different channel | Same-format 3x repetition doesn't break through ADHD dismissal | 2 hrs |
| 9 | **Make renewal date optional or approximate** in add subscription flow | ADHD users don't know exact dates, will abandon the form | 1-2 hrs |
| 10 | **Fix cancel URL XSS** (`url.href` not original string) | Security vulnerability | 5 min |
| 11 | **Improve session recovery** — clear login redirect when session expires, "welcome back" banner | ADHD users returning after weeks shouldn't see infinite skeleton | 1-2 hrs |

### Tier 3 — Business / Polish

| # | Task | Why It Matters | Effort |
|---|------|---------------|--------|
| 12 | **Create Stripe product + price** in Dashboard | Can't accept payments without it | 30 min |
| 13 | **Add webhook idempotency** (event ID tracking) | Duplicate webhooks could grant/revoke Pro twice | 1-2 hrs |
| 14 | **Add plan comparison accessible from Settings** (not just hidden in modal) | Users should be able to compare Free vs Pro without hitting a wall | 1-2 hrs |
| 15 | **Handle silent Stripe portal failure** — add error toast | Empty catch block = user clicks, nothing happens | 10 min |
| 16 | **Remove console.log** from production paths | Leaks user IDs and payment data | 15 min |
| 17 | **Extract price calculation** to shared utility (fix 4.33 → 52/12) | Duplicated in 5 files, slightly inaccurate | 30 min |
| 18 | **Add specific error messages** (not generic toasts) | "Couldn't add" is anxiety-inducing for ADHD users | 1 hr |

### Tier 4 — Future (V1.1+)

| # | Task | Notes |
|---|------|-------|
| 19 | **SMS reminders** (Twilio integration) | Hardest-to-ignore channel for ADHD users |
| 20 | **Push notification action buttons** ("Cancel now", "Snooze") | Reduce friction from notification to action |
| 21 | **FCM token refresh logic** | Prevent silent stale-token failures |
| 22 | **Weekly digest email** | "Here's what's coming up this week" |
| 23 | **Welcome back banner** | "2 subs renewed since last visit" |
| 24 | **Integration / E2E tests** | Playwright for critical flows |
| 25 | **Read-only subscription detail view** | View without edit mode |

---

## What NOT to Build

These were in previous audits but don't serve the product:

| Item | Why Skip It |
|------|------------|
| Full billing/account page | One-time $39 purchase. Stripe Portal handles everything. Don't add screens |
| In-app payment history | Stripe Portal shows this. Don't duplicate |
| In-app refund flow | Email support is fine for a small app |
| MFA / 2FA | Adds login friction. ADHD users will forget their 2FA device |
| Audit logs | Enterprise feature, not relevant |
| Public pricing page | Nice-to-have but the upgrade modal already shows the comparison |
| Subscription drafts | Over-engineering. Just let users save incomplete subs normally |
