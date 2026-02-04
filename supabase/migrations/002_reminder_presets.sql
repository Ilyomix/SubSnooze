-- SubSnooze: Configurable Reminder Presets
-- Migration to add user-selectable reminder schedules

-- ============================================================================
-- REMINDER PRESET ENUM
-- ============================================================================
-- Aggressive: 7, 3, 1 days before (default - current behavior)
-- Relaxed: 14, 3 days before (early warning + final reminder)
-- Minimal: 3 days before (just one reminder)

DO $$ BEGIN
  CREATE TYPE reminder_preset AS ENUM ('aggressive', 'relaxed', 'minimal');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- UPDATE USERS TABLE
-- ============================================================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS reminder_preset reminder_preset DEFAULT 'aggressive' NOT NULL;

-- ============================================================================
-- UPDATE SUBSCRIPTIONS TABLE
-- ============================================================================
-- Add 14-day reminder flag for 'relaxed' preset
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS reminder_14_day_sent boolean DEFAULT false NOT NULL;

-- ============================================================================
-- UPDATE VIEW: subscriptions_needing_reminders
-- ============================================================================
-- Drop existing view and recreate with preset awareness

DROP VIEW IF EXISTS public.subscriptions_needing_reminders;

CREATE OR REPLACE VIEW public.subscriptions_needing_reminders AS
SELECT
  s.id,
  s.user_id,
  s.name,
  s.logo,
  s.logo_color,
  s.price,
  s.billing_cycle,
  s.renewal_date,
  s.status,
  s.reminders_sent,
  s.reminder_14_day_sent,
  s.reminder_7_day_sent,
  s.reminder_3_day_sent,
  s.reminder_1_day_sent,
  u.email,
  u.fcm_token,
  u.push_enabled,
  u.email_reminders_enabled,
  u.reminder_preset,
  (s.renewal_date - current_date) as days_until_renewal
FROM public.subscriptions s
JOIN public.users u ON s.user_id = u.id
WHERE
  s.status IN ('active', 'renewing_soon')
  AND s.renewal_date >= current_date
  AND (
    -- Aggressive preset: 7, 3, 1 days
    (u.reminder_preset = 'aggressive' AND (
      (s.renewal_date = current_date + interval '7 days' AND NOT s.reminder_7_day_sent)
      OR (s.renewal_date = current_date + interval '3 days' AND NOT s.reminder_3_day_sent)
      OR (s.renewal_date = current_date + interval '1 day' AND NOT s.reminder_1_day_sent)
    ))
    OR
    -- Relaxed preset: 14, 3 days
    (u.reminder_preset = 'relaxed' AND (
      (s.renewal_date = current_date + interval '14 days' AND NOT s.reminder_14_day_sent)
      OR (s.renewal_date = current_date + interval '3 days' AND NOT s.reminder_3_day_sent)
    ))
    OR
    -- Minimal preset: 3 days only
    (u.reminder_preset = 'minimal' AND (
      s.renewal_date = current_date + interval '3 days' AND NOT s.reminder_3_day_sent
    ))
  );

-- Grant access to the view
GRANT SELECT ON public.subscriptions_needing_reminders TO authenticated;
GRANT SELECT ON public.subscriptions_needing_reminders TO service_role;
