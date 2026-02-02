-- SubSnooze Initial Database Schema
-- Targeting ADHD users with 3-touch reminder system

-- Note: Using gen_random_uuid() which is built into PostgreSQL 13+

-- ============================================================================
-- USERS TABLE (extends Supabase Auth)
-- ============================================================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,

  -- Push notification settings
  fcm_token text,
  push_enabled boolean default false,
  email_reminders_enabled boolean default true,
  sms_reminders_enabled boolean default false,
  phone_number text,

  -- Subscription tier
  is_premium boolean default false,
  premium_expires_at timestamptz,

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
create type billing_cycle as enum ('weekly', 'monthly', 'yearly');
create type subscription_status as enum ('active', 'renewing_soon', 'cancelled', 'expired');

create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,

  -- Basic info
  name text not null,
  logo text not null, -- letter or icon identifier
  logo_color text not null, -- hex color

  -- Billing info
  price numeric(10,2) not null,
  billing_cycle billing_cycle not null,
  renewal_date date not null,

  -- Status
  status subscription_status default 'active' not null,
  cancel_url text, -- external cancellation URL

  -- 3-Touch Reminder System
  reminders_sent integer default 0 not null, -- 0, 1, 2, or 3
  last_reminder_date date,
  reminder_7_day_sent boolean default false,
  reminder_3_day_sent boolean default false,
  reminder_1_day_sent boolean default false,

  -- Cancel verification flow
  cancel_attempt_date timestamptz,
  cancel_verified boolean,

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for efficient queries
create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_renewal_date on public.subscriptions(renewal_date);
create index idx_subscriptions_status on public.subscriptions(status);
create index idx_subscriptions_cancel_attempt on public.subscriptions(cancel_attempt_date)
  where cancel_attempt_date is not null and cancel_verified = false;

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
create type notification_type as enum ('warning', 'info', 'success', 'cancel_followup');

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subscription_id uuid references public.subscriptions(id) on delete cascade,

  -- Content
  title text not null,
  message text not null,
  type notification_type not null,

  -- Status
  read boolean default false not null,

  -- Action data (for cancel verification, etc.)
  action_type text, -- 'verify_cancel', 'remind_again', etc.
  action_data jsonb,

  -- Timestamps
  created_at timestamptz default now() not null
);

-- Index for efficient queries
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_subscription_id on public.notifications(subscription_id);
create index idx_notifications_read on public.notifications(user_id, read) where read = false;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.notifications enable row level security;

-- Users policies
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- Subscriptions policies
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- Notifications policies
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- Service role policy for Edge Functions to insert notifications
create policy "Service role can insert notifications"
  on public.notifications for insert
  with check (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_users_updated_at
  before update on public.users
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function update_updated_at_column();

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on auth signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update subscription status based on renewal date
create or replace function update_subscription_status()
returns trigger as $$
begin
  -- Calculate days until renewal
  if new.status != 'cancelled' then
    if new.renewal_date <= current_date then
      new.status = 'expired';
    elsif new.renewal_date <= current_date + interval '7 days' then
      new.status = 'renewing_soon';
    else
      new.status = 'active';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger update_subscription_status_trigger
  before insert or update of renewal_date on public.subscriptions
  for each row execute function update_subscription_status();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- View for subscriptions needing reminders (used by Edge Function)
create view subscriptions_needing_reminders as
select
  s.*,
  u.email,
  u.fcm_token,
  u.push_enabled,
  u.email_reminders_enabled,
  s.renewal_date - current_date as days_until_renewal
from public.subscriptions s
join public.users u on s.user_id = u.id
where
  s.status in ('active', 'renewing_soon')
  and s.renewal_date > current_date
  and (
    -- 7-day reminder not sent yet
    (s.renewal_date = current_date + interval '7 days' and not s.reminder_7_day_sent)
    or
    -- 3-day reminder not sent yet
    (s.renewal_date = current_date + interval '3 days' and not s.reminder_3_day_sent)
    or
    -- 1-day reminder not sent yet
    (s.renewal_date = current_date + interval '1 day' and not s.reminder_1_day_sent)
  );

-- View for unverified cancellations (used by Edge Function)
create view unverified_cancellations as
select
  s.*,
  u.email,
  u.fcm_token,
  u.push_enabled,
  u.email_reminders_enabled
from public.subscriptions s
join public.users u on s.user_id = u.id
where
  s.cancel_attempt_date is not null
  and s.cancel_verified = false
  and s.cancel_attempt_date < now() - interval '24 hours';
