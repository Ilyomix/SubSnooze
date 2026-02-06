-- Self-service account deletion
-- Uses SECURITY DEFINER to allow users to delete their own auth record.
-- Cascade: auth.users -> public.users -> subscriptions + notifications

create or replace function delete_user_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Delete from auth.users cascades to public.users, subscriptions, notifications
  delete from auth.users where id = (select auth.uid());
end;
$$;
