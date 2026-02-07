-- Add locale and currency preferences to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT NOT NULL DEFAULT 'USD';

-- Add currency to subscriptions (per-subscription currency)
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
