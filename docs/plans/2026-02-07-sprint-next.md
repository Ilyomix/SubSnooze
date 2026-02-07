# Sprint Plan — February 2026

**Date:** 2026-02-07
**Focus:** PWA UI/UX polish + Feature/Integration/Test hardening + New features (i18n, drafts, DND)
**Theme:** "Bulletproof existing + unlock next tier"

---

## Sprint Goal

Two-track sprint:
1. **Hardening** — Ensure every existing feature, integration, and automated recipe is solid and production-ready. Fix remaining bugs, harden edge cases, improve PWA responsiveness, expand test coverage.
2. **New features** — Add i18n foundation, subscription drafts, and Do Not Disturb hours to complete the V1.1 feature set.

---

## Current State

| Metric | Value |
|--------|-------|
| Checklist score | 143/150 (95%) |
| Unit tests | 51 (4 files) |
| CI pipeline | lint + tsc + test + audit |
| Known bugs fixed this sprint | Double-add on paywall, layout responsiveness |

### Remaining checklist items (unchecked)

| Item | Category | Priority |
|------|----------|----------|
| Staging + production envs | Infrastructure | Bloquant |
| Custom domain + SSL | Infrastructure | Bloquant |
| Uptime monitoring | Monitoring | Important |
| i18n | Souhaitable (V1.1) |
| MFA | Souhaitable (V1.1) |
| Audit logs | Souhaitable (V1.1) |
| Weekly digest | Souhaitable (V1.1) |
| Family sharing | Souhaitable (V1.1) |
| Subscription drafts | Souhaitable (V1.1) |
| DND hours | Souhaitable (V1.1) |

---

## Sprint Backlog

### P0 — Bug Fixes (done this session)

- [x] **BUG: Double subscription on paywall** — Race condition between optimistic update and Supabase realtime INSERT. Fixed with deduplication in both the realtime handler and the optimistic replace callback. (`src/hooks/useSubscriptions.ts`)
- [x] **UX: Summary cards layout** — Improved responsive grid, clearer labels (Monthly/Saved headers), better sizing on small screens, explicit sub count. (`src/components/screens/Dashboard.tsx`)
- [x] **UX: Subscription row clarity** — Added billing cycle indicator (/mo, /yr, /wk) next to price in all subscription rows. (`src/components/ui/SubscriptionRow.tsx`)
- [x] **UX: AllSubscriptions header** — Broke total amount onto its own line with "across N subscriptions" context. No longer crammed into header row. (`src/components/screens/AllSubscriptions.tsx`)

### P1 — PWA UI/UX Hardening

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | **Install prompt (A2HS)** | `src/hooks/useInstallPrompt.ts`, AppShell | Detect `beforeinstallprompt` event, show contextual install banner for PWA. Critical for mobile web users. |
| 2 | **Standalone mode detection** | `src/hooks/useServiceWorker.ts` | Detect `display-mode: standalone` via `matchMedia`. Adjust UI (hide install prompt, show update available toast). |
| 3 | **Update available toast** | `sw.js`, AppShell | When new SW version detected, show "Update available — tap to refresh" toast. Currently SW updates silently. |
| 4 | **iOS PWA meta tags audit** | `src/app/layout.tsx` | Verify `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, splash screens. iOS PWA has quirks. |
| 5 | **Keyboard-aware layout** | Dashboard, AddSubscriptionStep2, Settings | On mobile, virtual keyboard pushes fixed bottom elements. Add `visualViewport` resize listener to adjust. |
| 6 | **Bottom sheet modals** | UpgradeModal, CancelRedirectModal | Convert floating centered modals to mobile-friendly bottom sheets with drag-to-dismiss. Feels more native on PWA. |
| 7 | **Landscape mode** | AppShell, Dashboard | Test and fix layout at landscape orientations. Currently untested. |
| 8 | **Tablet 2-column layout** | Dashboard | On screens > 768px, show summary cards + subscription lists side-by-side instead of stacked. |

### P2 — Integration Hardening

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | **Supabase realtime reconnect** | `useSubscriptions.ts`, `useNotifications.ts` | Handle channel disconnect/reconnect gracefully. Show stale data indicator if realtime is down. |
| 2 | **Stripe webhook idempotency** | `src/app/api/stripe/webhook/route.ts` | Verify webhook events are processed idempotently (Stripe retries). Check for duplicate `checkout.session.completed`. |
| 3 | **FCM token refresh** | `src/hooks/usePushNotifications.ts` | Handle token refresh (`onMessage` callback). Currently token is stored once and never updated. |
| 4 | **Offline mutation queue** | `useSubscriptions.ts` | When offline, queue add/update/delete mutations and replay when back online. Currently mutations fail silently offline. |
| 5 | **Auth session edge cases** | `src/contexts/AuthContext.tsx` | Test: expired refresh token, concurrent tabs, incognito mode, cookie blocked. Ensure graceful redirect to /login. |
| 6 | **Edge function error handling** | `supabase/functions/send-reminders/`, etc. | Add structured error logging, retry logic for FCM failures, dead letter handling for permanently failed notifications. |
| 7 | **CSP audit** | `next.config.ts` | Review Content-Security-Policy for any gaps. Test with CSP-evaluator tool. Ensure no inline scripts leak. |

### P3 — Test Coverage Expansion

| # | Task | Coverage Target | Details |
|---|------|----------------|---------|
| 1 | **useSubscriptions hook tests** | Hook logic | Test: add (optimistic + rollback), realtime dedup, cancel, restore. Use testing-library `renderHook`. |
| 2 | **useNotifications hook tests** | Hook logic | Test: mark read/unread, delete, pagination, realtime sync. |
| 3 | **Stripe webhook handler tests** | API route | Test: valid signature, invalid signature, duplicate events, unknown event types. |
| 4 | **Auth flow integration tests** | Auth | Test: login, signup, password reset, token refresh, logout. Mock Supabase client. |
| 5 | **Component snapshot/interaction tests** | UI | Test: Dashboard renders correctly with 0/1/many subs, AddSubscriptionWizard full flow, SubscriptionManagement cancel flow. |
| 6 | **E2E smoke test (Playwright)** | Critical path | Add Playwright config + 1 smoke test: signup → add sub → see on dashboard → cancel → verify cancelled. |
| 7 | **Accessibility tests** | a11y | Add axe-core integration to component tests. Flag WCAG AA violations automatically. |
| 8 | **Edge function tests** | Backend | Test send-reminders logic: correct stage detection, skip already-sent, batch processing. |

### P4 — Feature Polish (No new features, just existing ones)

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | **selectedSub stale data** | `src/app/page.tsx` | When realtime updates a subscription, `selectedSub` in manage screen doesn't reflect changes. Sync from subscriptions array. |
| 2 | **Chain-add paywall UX** | AddSubscriptionWizard | When user hits limit mid-chain-add, transition is jarring. Show inline limit message instead of redirecting to dashboard + modal. |
| 3 | **Notification deep link** | page.tsx, Notifications | Push notification tap should deep-link to the specific subscription manage screen, not just open the app. |
| 4 | **Export CSV completeness** | `src/lib/export-csv.ts` | Verify all fields exported: name, price, cycle, status, renewal date, cancel date, cancel URL. |
| 5 | **Dark mode edge cases** | globals.css, various | Audit all screens in dark mode. Check: modals, toasts, landing page, login, offline page, badges. |
| 6 | **Reminder preset persistence** | Settings, useUser | Verify changing reminder preset (Aggressive/Relaxed/Minimal) actually updates `reminder_days` in DB and is respected by edge functions. |
| 7 | **Cancel URL validation** | AddSubscriptionStep2, SubscriptionManagement | Validate URL format on input. Prevent XSS via `cancel_url` field (already server-validated, but add client-side too). |

---

## Definition of Done

Before marking sprint complete:

```bash
pnpm lint        # 0 errors, 0 warnings
pnpm build       # Succeeds with no type errors
pnpm test        # All tests pass (target: 80+ tests)
```

- All P0 items completed
- All P1 items completed or explicitly deferred with reason
- All P2 items reviewed (at minimum: realtime reconnect, webhook idempotency)
- At least 4 new test files from P3
- Manual QA pass on: add flow, cancel flow, paywall, dark mode, offline page, PWA install

---

### P5 — New Features (in-sprint)

| # | Feature | Scope | Details |
|---|---------|-------|---------|
| 1 | **i18n foundation (next-intl)** | Framework + FR/EN | Install `next-intl`, extract all user-facing strings to message files, locale detection from browser, FR + EN translations. Currency/date localization. This is foundational — every future locale is just a JSON file. |
| 2 | **Subscription drafts** | DB + UI | Add `status: 'draft'` to subscriptions. When adding, user can "Save as draft" instead of committing. Drafts shown in a separate Dashboard section ("Drafts — finish when ready"). Aligns with ADHD "Decide Later" principle. |
| 3 | **Do Not Disturb hours** | Settings + Edge functions | Add `dnd_start`/`dnd_end` time fields to user profile. Edge functions (send-reminders) respect DND window — delay delivery until window ends. Settings UI with time pickers. |

---

## Out of Scope (deferred)

- MFA
- Audit logs
- Weekly email digest
- Family/shared subscriptions
- Play Store / App Store submission
- Bank sync (Plaid)
- SMS backend (Twilio)
- Cancellation email templates
- AI cancellation assistant

---

## Estimated Sprint Size

| Priority | Items | Effort |
|----------|-------|--------|
| P0 (bugs) | 4 | Done |
| P1 (PWA UX) | 8 | Medium |
| P2 (integrations) | 7 | Medium-High |
| P3 (tests) | 8 | Medium |
| P4 (polish) | 7 | Low-Medium |
| P5 (new features) | 3 | High |
| **Total** | **37** | |

Suggested priority order for 2-week sprint:
1. **P0** — Done
2. **P5** — i18n, drafts, DND (highest user-visible impact)
3. **P1** — PWA UX hardening (install prompt, update toast, keyboard-aware)
4. **P3** — Test coverage (hook tests, E2E smoke, webhook tests)
5. **P2 + P4** — Stretch goals (integration hardening + polish)

---

*Sprint planned: 2026-02-07*
