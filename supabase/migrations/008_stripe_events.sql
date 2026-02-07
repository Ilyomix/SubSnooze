-- Stripe webhook idempotency tracking
-- Prevents duplicate event processing from Stripe webhook retries
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by event_id
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(event_id);

-- Auto-clean old events after 30 days to keep table small
-- (Stripe won't retry events older than 3 days)
CREATE OR REPLACE FUNCTION clean_old_stripe_events()
RETURNS void AS $$
BEGIN
  DELETE FROM stripe_events WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
