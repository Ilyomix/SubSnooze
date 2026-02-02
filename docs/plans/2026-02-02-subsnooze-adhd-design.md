# SubSnooze ADHD-Focused Design Document

**Date:** 2026-02-02
**Status:** Approved
**Target Audience:** Adults with ADHD struggling with subscription management

---

## 1. Problem Statement

ADHD users face unique challenges with subscription management:

| Pain Point | Root Cause |
|------------|-----------|
| Forget to cancel | "Out of sight, out of mind" - poor working memory |
| Decision paralysis | Executive function deficit makes cancellation overwhelming |
| Emotional avoidance | Shame/guilt prevents action |
| Time blindness | Can't anticipate future renewal dates |
| Subscription creep | Impulsive sign-ups accumulate |

**Market Gap:** No subscription tracker is specifically designed for ADHD brains with empathy, simplicity, and shame-free messaging.

---

## 2. Value Proposition

**Tagline:** "Stop paying the ADHD tax on subscriptions"

**Core Promise:** SubSnooze acts as your external memory, nudging you at the right moment with zero judgment.

**Differentiators:**
- 3-touch reminder system (not just one alert)
- One-tap actions (Keep/Cancel/Decide Later)
- Shame-free, empathetic messaging
- "Did you actually cancel?" follow-up
- One-time purchase (we practice what we preach)

---

## 3. Monetization Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 5 subscriptions, email reminders, basic dashboard |
| **Pro** | $29-39 (one-time) | Unlimited subs, push/SMS/email, money saved tracker, cancellation templates, "remind me to cancel" feature |

**Rationale:** A subscription-based subscription tracker would be hypocritical and could trigger the exact shame we're trying to prevent.

---

## 4. Feature Specification

### 4.1 P0 - MVP (Must Have)

#### 4.1.1 Backend + Database
- Supabase for auth, database, and edge functions
- Postgres schema for users, subscriptions, notifications
- Row-level security for user data isolation

#### 4.1.2 Authentication
- Email/password signup
- Google OAuth option
- Password reset flow

#### 4.1.3 Real Push Notifications
- Firebase Cloud Messaging integration
- Web push for PWA
- Notification permission request flow

#### 4.1.4 3-Touch Reminder System
Instead of one reminder, send three:

| Stage | When | Message Tone |
|-------|------|--------------|
| 1 | 7 days before | Gentle heads-up: "Netflix renews in a week" |
| 2 | 3 days before | Decision prompt: "Time to decide on Netflix" |
| 3 | Day of | Final nudge: "Netflix renews today - Keep or Cancel?" |

Each notification includes one-tap actions.

#### 4.1.5 "Did You Actually Cancel?" Follow-up
When user clicks "Cancel" and visits external site:
1. Set `cancel_attempt_date` timestamp
2. Schedule follow-up notification for 24 hours later
3. Ask: "Did you finish canceling Netflix?"
4. Options: "Yes, I canceled" / "No, remind me again" / "I decided to keep it"

### 4.2 P1 - Should Have (Week 2-3)

#### 4.2.1 One-Tap Actions on Dashboard
Add action buttons directly to subscription rows:
- **Keep** → Snooze reminders for this billing cycle
- **Cancel** → Opens cancellation flow
- **Later** → Reschedule decision (no guilt)

#### 4.2.2 Shame-Free Copy Guidelines
All app copy must follow:
- Use "You" not "You failed to..."
- Present tense, not past ("Time to decide" not "You forgot")
- Celebrate wins ("$247 saved!") over highlighting losses
- No exclamation marks on negative states
- Normalize forgetting: "It happens to everyone"

#### 4.2.3 Cancellation Email Templates
Pre-written templates for common services:
- Netflix, Spotify, Disney+, gym memberships, etc.
- Copy-paste ready with personalized details filled in
- Reduces decision paralysis and friction

#### 4.2.4 Pro Tier + Stripe Payment
- One-time payment via Stripe Checkout
- Unlock: unlimited subscriptions, all reminder channels
- Store `is_pro` flag in user record

### 4.3 P2 - Nice to Have (Post-Launch)

#### 4.3.1 Post-Charge Refund Helper
When a subscription renews and user didn't want it:
- Show: "It happens. Here's how to get a refund."
- Direct link to company's refund policy
- Pre-written refund request email template
- Track refund success rate per company

#### 4.3.2 Bank Sync (Plaid)
- Auto-detect subscriptions from bank transactions
- Optional feature (privacy-conscious users can skip)
- Requires Plaid integration

#### 4.3.3 SMS Reminders
- Twilio integration for SMS delivery
- Pro-only feature
- Phone number verification required

#### 4.3.4 Subscription Price Tracking
- Detect price increases automatically
- Alert: "Netflix increased from $15.99 to $17.99"

### 4.4 P3 - Future (V2+)

- Social accountability ("body doubling" feature)
- AI cancellation assistant
- Browser extension for auto-detection
- Family/shared subscription management

---

## 5. Technical Architecture

### 5.1 Stack

```
Frontend:  Next.js 15 + React 19 (existing)
Backend:   Supabase
├── Auth:        Supabase Auth (email + Google OAuth)
├── Database:    Postgres (via Supabase)
├── Push:        Supabase Edge Functions → Firebase Cloud Messaging
└── Cron:        Supabase pg_cron for scheduled reminders

Payments:  Stripe (one-time purchase)
Hosting:   Vercel
```

### 5.2 Database Schema

```sql
-- Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now(),

  -- Reminder preferences
  reminder_days integer[] default '{7, 3, 1}',
  push_enabled boolean default true,
  email_enabled boolean default true,
  sms_enabled boolean default false,
  phone text,

  -- Pro status
  is_pro boolean default false,
  pro_purchased_at timestamptz
);

-- Subscriptions table
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,

  -- Basic info
  name text not null,
  logo text not null,
  logo_color text not null,
  price decimal(10,2) not null,
  billing_cycle text check (billing_cycle in ('weekly', 'monthly', 'yearly')),
  renewal_date date not null,
  status text check (status in ('renewing_soon', 'good', 'cancelled')) default 'good',
  cancel_url text,

  -- ADHD-specific tracking
  reminders_sent integer default 0,
  last_reminder_date timestamptz,
  cancel_attempt_date timestamptz,
  cancel_verified boolean default false,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notifications table
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete cascade,

  type text check (type in ('warning', 'info', 'success')),
  title text not null,
  message text not null,
  reminder_stage integer check (reminder_stage in (1, 2, 3)),

  read boolean default false,
  sent_at timestamptz default now()
);

-- Indexes
create index idx_subscriptions_user on subscriptions(user_id);
create index idx_subscriptions_renewal on subscriptions(renewal_date);
create index idx_notifications_user on notifications(user_id);
```

### 5.3 Edge Functions (Cron Jobs)

**Daily Reminder Job** (runs at 9am user timezone):
1. Query subscriptions where renewal_date within reminder window
2. Check which reminder stage (7 days, 3 days, 1 day)
3. Skip if that stage already sent
4. Send push/email notification
5. Update `reminders_sent` and `last_reminder_date`

**Cancel Follow-up Job** (runs hourly):
1. Query subscriptions where `cancel_attempt_date` is 24+ hours ago
2. And `cancel_verified` is false
3. Send "Did you finish canceling?" notification

---

## 6. UX/UI Principles for ADHD

### 6.1 Reduce Cognitive Load
- Maximum 3 options per screen
- One primary action per view
- Progressive disclosure (hide advanced options)

### 6.2 Visual Hierarchy
- Large, tappable targets (min 44px)
- Color-coded status (teal = good, orange = warning)
- Generous whitespace

### 6.3 Immediate Feedback
- Instant visual confirmation on actions
- Celebratory animations for wins (subtle, not overwhelming)
- Progress indicators for multi-step flows

### 6.4 Gentle Nudges
- Non-intrusive notification design
- "Decide Later" is always an option
- No guilt-inducing language

---

## 7. Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Activation rate | 60%+ add 1 subscription in first session | Proves value quickly |
| Reminder → Action rate | 30%+ act within 24h of reminder | 3-touch system working |
| Cancel completion rate | 70%+ verify cancellation | Follow-up system working |
| 30-day retention | 50%+ | Users find ongoing value |
| Pro conversion | 10%+ of active users | Sustainable business |

---

## 8. Out of Scope (Explicitly Not Building)

- Complex budgeting features (not our focus)
- Investment tracking
- Bill pay / automatic payments
- Credit score monitoring
- Subscription recommendations
- Social features (V2+)

---

## 9. Open Questions

1. **Service database:** Build our own or use existing API (e.g., Brandfetch for logos)?
2. **Cancellation links:** Maintain our own database or crowdsource?
3. **Timezone handling:** Store user timezone or infer from device?

---

## 10. Next Steps

1. Create implementation plan with task breakdown
2. Set up Supabase project and schema
3. Implement authentication flow
4. Build reminder notification system
5. Integrate Stripe for Pro tier

---

*Document approved: 2026-02-02*
