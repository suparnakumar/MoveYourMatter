-- ============================================================
-- MoveYourMatter — Admin + Cohort Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================


-- ============================================================
-- 1. Admin flag on profiles
-- ============================================================

alter table profiles
  add column if not exists is_admin boolean default false;

-- After running, set your account as admin:
-- update profiles set is_admin = true where id = '<your-user-id>';


-- ============================================================
-- 2. COHORTS
-- ============================================================

create table if not exists cohorts (
  id             uuid default gen_random_uuid() primary key,
  name           text not null,
  start_date     date not null,
  whatsapp_link  text,
  active         boolean default true,
  created_at     timestamptz default now()
);


-- ============================================================
-- 3. COHORT MEMBERS
-- ============================================================

create table if not exists cohort_members (
  id          uuid default gen_random_uuid() primary key,
  cohort_id   uuid references cohorts(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(cohort_id, user_id)
);


-- ============================================================
-- 4. COHORT SCHEDULE
-- ============================================================

create table if not exists cohort_schedule (
  id          uuid default gen_random_uuid() primary key,
  cohort_id   uuid references cohorts(id) on delete cascade,
  day_number  int not null,
  video_id    uuid references videos(id),
  message     text,
  created_at  timestamptz default now(),
  unique(cohort_id, day_number)
);


-- ============================================================
-- 5. RLS — enable + policies (all tables exist by now)
-- ============================================================

alter table cohorts enable row level security;
alter table cohort_members enable row level security;
alter table cohort_schedule enable row level security;

-- Cohorts: admin full access
create policy "cohorts: admin full access" on cohorts
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Cohorts: member can read their own cohort
create policy "cohorts: member read" on cohorts for select
  using (exists (
    select 1 from cohort_members
    where cohort_id = cohorts.id and user_id = auth.uid()
  ));

-- Cohort members: admin full access
create policy "cohort_members: admin full access" on cohort_members
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Cohort members: member can read their own row
create policy "cohort_members: self read" on cohort_members for select
  using (user_id = auth.uid());

-- Cohort schedule: admin full access
create policy "cohort_schedule: admin full access" on cohort_schedule
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Cohort schedule: member can read schedule for their cohort
create policy "cohort_schedule: member read" on cohort_schedule for select
  using (exists (
    select 1 from cohort_members
    where cohort_id = cohort_schedule.cohort_id and user_id = auth.uid()
  ));
