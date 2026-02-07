# SubSnooze — Environment Variables

## Configured in `.env.local` (17 vars)

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Set |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Set |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Set |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Set |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Set |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Set |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Set |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Set |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Set |
| `STRIPE_SECRET_KEY` | Set |
| `STRIPE_WEBHOOK_SECRET` | Set |
| `STRIPE_PRICE_ID_PRO_LIFETIME` | Set |
| `CRON_SECRET` | Set |
| `NEXT_PUBLIC_APP_URL` | Set (`http://localhost:3000`) |
| `RESEND_API_KEY` | **Placeholder** (`re_REPLACE_ME`) — needs real key from [resend.com](https://resend.com) |

## Missing — Optional (3 vars)

| Variable | Purpose | Where to get it |
|----------|---------|-----------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring | Sentry Dashboard > Project > Settings > Client Keys |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics | PostHog Dashboard > Project > Settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog API host (defaults to `us.i.posthog.com`) | Same as above |

## Vercel (Production) Differences

When deploying to Vercel, set all 17 configured vars with these overrides:

| Variable | Local value | Production value |
|----------|-------------|------------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://yourdomain.com` |
| `RESEND_API_KEY` | `re_REPLACE_ME` | Real key from Resend |
| `STRIPE_WEBHOOK_SECRET` | Current value (CLI) | New value from Stripe Dashboard webhook endpoint |
| `STRIPE_PRICE_ID_PRO_LIFETIME` | Current value | Verify it matches your live Stripe product |

The 3 optional vars (Sentry, PostHog) can be added whenever you set up those services — the app runs fine without them.
