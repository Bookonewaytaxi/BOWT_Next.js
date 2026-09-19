-- BOWT Backlink Automation V1
-- Run this once in the Supabase SQL editor for project wjynvwqfbjhaqosohekb.

create extension if not exists pgcrypto;

create table if not exists public.backlink_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  domain_type text,
  country_code text,
  relevance_score integer default 0 check (relevance_score between 0 and 100),
  quality_score integer default 0 check (quality_score between 0 and 100),
  spam_score integer default 0 check (spam_score between 0 and 100),
  status text not null default 'new' check (status in ('new','qualified','rejected','contacted','published','lost')),
  notes text,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.backlink_opportunities (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references public.backlink_domains(id) on delete cascade,
  source_url text,
  source_title text,
  opportunity_type text,
  anchor_suggestion text,
  target_url text,
  target_route_id uuid,
  relevance_score integer default 0 check (relevance_score between 0 and 100),
  quality_score integer default 0 check (quality_score between 0 and 100),
  status text not null default 'new' check (status in ('new','qualified','rejected','outreach_ready','contacted','published','lost')),
  discovery_method text,
  discovered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (domain_id, source_url)
);

create table if not exists public.backlink_outreach (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.backlink_opportunities(id) on delete cascade,
  channel text,
  recipient text,
  subject text,
  message text,
  status text not null default 'draft' check (status in ('draft','approved','sent','replied','published','rejected')),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.backlinks (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references public.backlink_domains(id) on delete set null,
  opportunity_id uuid references public.backlink_opportunities(id) on delete set null,
  source_url text not null,
  target_url text not null,
  anchor_text text,
  rel_attribute text,
  link_status text not null default 'pending' check (link_status in ('pending','live','removed','blocked','error')),
  http_status integer,
  last_verified_at timestamptz,
  first_seen_at timestamptz not null default now(),
  notes text
);

create table if not exists public.backlink_daily_runs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null unique,
  target_count integer not null default 30,
  found_count integer not null default 0,
  qualified_count integer not null default 0,
  outreach_ready_count integer not null default 0,
  published_count integer not null default 0,
  status text not null default 'pending' check (status in ('pending','running','completed','failed')),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists backlink_opportunities_status_idx on public.backlink_opportunities(status);
create index if not exists backlink_opportunities_discovered_idx on public.backlink_opportunities(discovered_at desc);
create index if not exists backlinks_status_idx on public.backlinks(link_status);
create index if not exists backlink_domains_status_idx on public.backlink_domains(status);

alter table public.backlink_domains enable row level security;
alter table public.backlink_opportunities enable row level security;
alter table public.backlink_outreach enable row level security;
alter table public.backlinks enable row level security;
alter table public.backlink_daily_runs enable row level security;

drop policy if exists "authenticated backlink domains" on public.backlink_domains;
create policy "authenticated backlink domains" on public.backlink_domains for all to authenticated using (true) with check (true);

drop policy if exists "authenticated backlink opportunities" on public.backlink_opportunities;
create policy "authenticated backlink opportunities" on public.backlink_opportunities for all to authenticated using (true) with check (true);

drop policy if exists "authenticated backlink outreach" on public.backlink_outreach;
create policy "authenticated backlink outreach" on public.backlink_outreach for all to authenticated using (true) with check (true);

drop policy if exists "authenticated backlinks" on public.backlinks;
create policy "authenticated backlinks" on public.backlinks for all to authenticated using (true) with check (true);

drop policy if exists "authenticated backlink daily runs" on public.backlink_daily_runs;
create policy "authenticated backlink daily runs" on public.backlink_daily_runs for all to authenticated using (true) with check (true);
