-- =====================================================================
--  WulfTek Tuning — Events
--  Supabase schema and row-level security
--
--  Run this once in the Supabase SQL Editor after creating the project.
--  Project region MUST be London (eu-west-2): the region is permanent and
--  cannot be changed after any data is stored.
--
--  What is held here is public listings information, not personal data.
--  Do not add attendee names, emails or phone numbers to these tables.
-- =====================================================================


-- ---------------------------------------------------------------------
--  1. Who may edit
--
--  Membership of this table is the ONLY thing that grants write access.
--  Any allow-list in the browser is a courtesy check to save a pointless
--  email; it is not a gate. The gate is here, plus sign-ups being
--  disabled in the project's auth settings.
--
--  Add the owner after their auth user exists:
--    insert into public.admins (user_id, note)
--    select id, 'WulfTek owner' from auth.users where email = 'you@example.com';
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.admins force row level security;

-- Deliberately no policies at all. The table is read only through the
-- security-definer helper below, so no role can select or modify it
-- through the API. Manage it from the SQL editor.


-- ---------------------------------------------------------------------
--  2. Admin check
--
--  Created BEFORE the table whose policies call it, so no table ever
--  exists with RLS off or a placeholder policy. Security definer so the
--  policy can read public.admins without the caller needing rights to it,
--  which also avoids two policies referencing each other and recursing.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ---------------------------------------------------------------------
--  3. Events
--
--  Dates are plain dates and the time is free text ("6pm till late",
--  "gates 9am"), which is how meets and shows are actually advertised.
--  That keeps timezone handling out of a listing the owner types by hand.
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),

  title       text not null check (length(btrim(title)) between 1 and 160),
  kind        text not null default 'meet'
                check (kind in ('meet','show','charity','trade')),

  starts_on   date not null,
  ends_on     date check (ends_on is null or ends_on >= starts_on),
  time_note   text check (time_note is null or length(time_note) <= 80),

  venue       text check (venue is null or length(venue) <= 160),
  town        text check (town  is null or length(town)  <= 120),

  blurb       text check (blurb is null or length(blurb) <= 600),
  url         text check (url is null or url ~ '^https?://'),

  published   boolean not null default false,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table  public.events           is 'Public event listings for the website. No personal data.';
comment on column public.events.published is 'Only published rows are readable by the public.';
comment on column public.events.time_note is 'Free text, e.g. "from 6pm". Deliberately not a time column.';


-- ---------------------------------------------------------------------
--  4. Keep updated_at honest
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at
  before update on public.events
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------
--  5. Row-level security
--
--  Default-deny, then two intentions:
--    read  — anyone, but only rows the owner has published
--    write — admins only, proven by public.is_admin()
--
--  An unpublished event is invisible to the public even by direct id,
--  so the owner can draft a listing before it is announced.
-- ---------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.events force row level security;

drop policy if exists events_read_published on public.events;
create policy events_read_published on public.events
  for select to anon, authenticated
  using (published = true);

drop policy if exists events_read_all_admin on public.events;
create policy events_read_all_admin on public.events
  for select to authenticated
  using (public.is_admin());

drop policy if exists events_insert_admin on public.events;
create policy events_insert_admin on public.events
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists events_update_admin on public.events;
create policy events_update_admin on public.events
  for update to authenticated
  using      (public.is_admin())
  with check (public.is_admin());

drop policy if exists events_delete_admin on public.events;
create policy events_delete_admin on public.events
  for delete to authenticated
  using (public.is_admin());


-- ---------------------------------------------------------------------
--  6. Indexes
--  The public page asks for published events from today onwards, newest
--  date first; the admin panel lists everything by date.
-- ---------------------------------------------------------------------
create index if not exists events_public_idx on public.events (published, starts_on);
create index if not exists events_date_idx   on public.events (starts_on desc);
