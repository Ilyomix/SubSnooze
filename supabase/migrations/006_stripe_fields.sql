-- S11: Add Stripe customer & payment fields to users table
-- Supports one-time lifetime purchase via Stripe Checkout

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_payment_id text;

-- Index for fast webhook lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id
  ON public.users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
