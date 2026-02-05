-- Enable Supabase Realtime on subscriptions and notifications tables
-- Without this, postgres_changes events are never fired to clients
alter publication supabase_realtime add table public.subscriptions;
alter publication supabase_realtime add table public.notifications;
