-- Subscription Services Database
-- A catalog of 1000+ subscription services with logos, pricing, and cancel URLs
-- Updated weekly via Edge Function cron job

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable trigram extension for fuzzy search (must be done first)
create extension if not exists pg_trgm;

-- ============================================================================
-- SUBSCRIPTION SERVICES TABLE
-- ============================================================================

create type service_status as enum ('active', 'discontinued', 'needs_review');

create table public.subscription_services (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,              -- "netflix", "spotify"
  name text not null,                     -- "Netflix"
  domain text not null,                   -- "netflix.com"
  category text not null,                 -- "streaming", "music", etc.

  -- Logo (stored directly, no external API)
  logo_url text,                          -- Direct URL to logo image
  logo_color text not null default '#6366f1', -- Brand color for fallback

  -- Pricing (nullable - not all services have public pricing)
  price_monthly numeric(10,2),
  price_yearly numeric(10,2),
  currency text default 'USD',

  -- URLs
  website_url text,
  cancel_url text,
  manage_url text,

  -- Status
  status service_status default 'active' not null,
  last_verified_at timestamptz,

  -- Metadata
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes for efficient queries
create index idx_services_slug on public.subscription_services(slug);
create index idx_services_name on public.subscription_services using gin(name gin_trgm_ops);
create index idx_services_category on public.subscription_services(category);
create index idx_services_status on public.subscription_services(status);

-- Enable trigram extension for fuzzy search (if not already enabled)
create extension if not exists pg_trgm;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
alter table public.subscription_services enable row level security;

-- Public read access (no auth required for reading service catalog)
create policy "Anyone can view subscription services"
  on public.subscription_services for select
  using (true);

-- Only service role can modify (via Edge Functions)
create policy "Service role can insert subscription services"
  on public.subscription_services for insert
  with check (true);

create policy "Service role can update subscription services"
  on public.subscription_services for update
  using (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Reuse existing updated_at trigger function
create trigger update_subscription_services_updated_at
  before update on public.subscription_services
  for each row execute function update_updated_at_column();

-- ============================================================================
-- SEARCH FUNCTION
-- ============================================================================

-- Function for fuzzy search with ranking
create or replace function search_subscription_services(
  search_query text,
  result_limit int default 20
)
returns table (
  id uuid,
  slug text,
  name text,
  domain text,
  category text,
  logo_url text,
  logo_color text,
  price_monthly numeric,
  price_yearly numeric,
  currency text,
  website_url text,
  cancel_url text,
  manage_url text,
  status service_status,
  similarity_score real
)
language sql
stable
as $$
  select
    s.id,
    s.slug,
    s.name,
    s.domain,
    s.category,
    s.logo_url,
    s.logo_color,
    s.price_monthly,
    s.price_yearly,
    s.currency,
    s.website_url,
    s.cancel_url,
    s.manage_url,
    s.status,
    greatest(
      similarity(s.name, search_query),
      similarity(s.slug, search_query),
      similarity(s.domain, search_query)
    ) as similarity_score
  from public.subscription_services s
  where
    s.status = 'active'
    and (
      s.name ilike '%' || search_query || '%'
      or s.slug ilike '%' || search_query || '%'
      or s.domain ilike '%' || search_query || '%'
      or similarity(s.name, search_query) > 0.2
    )
  order by
    -- Exact matches first
    case when lower(s.name) = lower(search_query) then 0 else 1 end,
    case when lower(s.slug) = lower(search_query) then 0 else 1 end,
    -- Then by similarity
    similarity_score desc,
    -- Then alphabetically
    s.name
  limit result_limit;
$$;

-- ============================================================================
-- POPULAR SERVICES VIEW
-- ============================================================================

-- View for commonly used services (shown on initial screen)
create view popular_subscription_services as
select *
from public.subscription_services
where
  status = 'active'
  and slug in (
    'netflix', 'spotify', 'disney-plus', 'youtube-premium', 'amazon-prime',
    'apple-music', 'hbo-max', 'hulu', 'chatgpt', 'adobe-creative-cloud',
    'microsoft-365', 'notion', 'figma', 'github', 'slack',
    'dropbox', 'icloud', 'google-one', 'nordvpn', 'canva',
    'audible', 'duolingo', 'linkedin-premium', 'coursera', 'masterclass'
  )
order by
  case slug
    when 'netflix' then 1
    when 'spotify' then 2
    when 'disney-plus' then 3
    when 'youtube-premium' then 4
    when 'amazon-prime' then 5
    when 'apple-music' then 6
    when 'hbo-max' then 7
    when 'hulu' then 8
    when 'chatgpt' then 9
    when 'adobe-creative-cloud' then 10
    else 100
  end;
