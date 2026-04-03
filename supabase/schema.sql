-- ============================================================
-- MoveYourMatter — Supabase Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================


-- ============================================================
-- 1. PROFILES
-- Extends auth.users with app-specific data
-- ============================================================

create table if not exists profiles (
  id                  uuid references auth.users on delete cascade primary key,
  display_name        text,
  avatar_url          text,
  goal                text,                      -- focus | stress | energy | movement
  preferred_time      text,                      -- morning | midday | evening
  onboarding_complete boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ============================================================
-- 2. RASAS
-- The 8 emotional/cognitive themes. Seeded, not user-generated.
-- ============================================================

create table if not exists rasas (
  id            serial primary key,
  slug          text unique not null,
  name          text not null,
  theme         text not null,             -- e.g. "focus, courage"
  description   text,
  colour        text,                      -- hex, for UI
  week_number   int,                       -- rotating week 1–8
  created_at    timestamptz default now()
);

insert into rasas (slug, name, theme, description, colour, week_number) values
  ('veera',   'Veera',   'Focus, courage',           'The warrior mind. Attention sharpened to a point.', '#0F6E56', 1),
  ('hasya',   'Hasya',   'Joy, playfulness',          'The playful mind. Lightness unlocks creativity.',   '#EF9F27', 2),
  ('shanta',  'Shanta',  'Peace, equanimity',         'The settled mind. Calm is not passive — it is power.', '#6366f1', 3),
  ('karuna',  'Karuna',  'Compassion, groundedness',  'The open mind. Presence begins with self-awareness.', '#ec4899', 4),
  ('adbhuta', 'Adbhuta', 'Wonder, curiosity',         'The curious mind. Novelty drives neuroplasticity.',    '#f59e0b', 5),
  ('shringar','Shringar', 'Love, connection',         'The connected mind. Belonging improves cognitive resilience.', '#14b8a6', 6),
  ('vira',    'Vira',    'Heroism, strength',         'The determined mind. Grit is a trainable skill.',    '#8b5cf6', 7),
  ('raudra',  'Raudra',  'Intensity, transformation', 'The transforming mind. Discomfort is the signal of growth.', '#ef4444', 8)
on conflict (slug) do nothing;


-- ============================================================
-- 3. PRACTICE SESSIONS
-- One row per session. Stores pre/post check-in + BSS.
-- ============================================================

create table if not exists practice_sessions (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users on delete cascade not null,
  session_date        date not null default current_date,
  rasa_slug           text references rasas(slug),

  -- Pre-session check-in (1–5 scale)
  pre_focus           smallint check (pre_focus between 1 and 5),
  pre_energy          smallint check (pre_energy between 1 and 5),
  pre_calm            smallint check (pre_calm between 1 and 5),

  -- Post-session check-in (1–5 scale)
  post_focus          smallint check (post_focus between 1 and 5),
  post_energy         smallint check (post_energy between 1 and 5),
  post_calm           smallint check (post_calm between 1 and 5),

  -- Computed Brain Shift Score (0–100)
  brain_shift_score   smallint check (brain_shift_score between 0 and 100),

  -- Deltas (post - pre, -4 to +4)
  delta_focus         smallint,
  delta_energy        smallint,
  delta_calm          smallint,

  duration_seconds    int,
  completed           boolean default false,
  track               text default 'A',         -- A (Kathak) | B (Movement)

  created_at          timestamptz default now()
);

-- One session per user per day
create unique index if not exists practice_sessions_user_date
  on practice_sessions (user_id, session_date);


-- ============================================================
-- 4. STREAKS
-- One row per user, updated after each completed session.
-- ============================================================

create table if not exists streaks (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users on delete cascade not null unique,
  current_streak      int default 0,
  longest_streak      int default 0,
  last_practice_date  date,
  updated_at          timestamptz default now()
);


-- ============================================================
-- 5. COGNITIVEPRINT
-- One row per user per 90-day cycle.
-- Dimensions revealed through days 1–7 discovery experience.
-- ============================================================

create table if not exists cognitiveprint (
  id                      uuid default gen_random_uuid() primary key,
  user_id                 uuid references auth.users on delete cascade not null,
  cycle_start_date        date not null,
  cycle_end_date          date,

  -- Baseline scores (set day 7, 1–100)
  baseline_attention      smallint,   -- rhythm accuracy task (day 2)
  baseline_flexibility    smallint,   -- pattern-switch task (day 4)
  baseline_presence       smallint,   -- body awareness reflection (day 5)

  -- Reassessment scores (set day 90)
  final_attention         smallint,
  final_flexibility       smallint,
  final_presence          smallint,

  -- Discovery progress (which days completed)
  discovery_days_complete int[] default '{}',

  -- Status
  status                  text default 'in_progress', -- in_progress | complete
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);


-- ============================================================
-- 6. COMMUNITY POSTS
-- Structured practice cards. No free-form text until day 7.
-- ============================================================

create table if not exists community_posts (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users on delete cascade not null,
  session_id          uuid references practice_sessions(id),
  rasa_slug           text references rasas(slug),

  streak_day          int,
  brain_shift_score   smallint,
  reflection          text,            -- optional one-line reflection (max 140 chars)
  video_url           text,            -- optional practice video (day 14+)

  created_at          timestamptz default now()
);


-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

alter table profiles          enable row level security;
alter table practice_sessions enable row level security;
alter table streaks            enable row level security;
alter table cognitiveprint    enable row level security;
alter table community_posts   enable row level security;

-- Profiles: users can read/write their own
create policy "profiles: own read"   on profiles for select using (auth.uid() = id);
create policy "profiles: own write"  on profiles for insert with check (auth.uid() = id);
create policy "profiles: own update" on profiles for update using (auth.uid() = id);

-- Practice sessions: own only
create policy "sessions: own read"   on practice_sessions for select using (auth.uid() = user_id);
create policy "sessions: own write"  on practice_sessions for insert with check (auth.uid() = user_id);
create policy "sessions: own update" on practice_sessions for update using (auth.uid() = user_id);

-- Streaks: own only
create policy "streaks: own read"    on streaks for select using (auth.uid() = user_id);
create policy "streaks: own write"   on streaks for insert with check (auth.uid() = user_id);
create policy "streaks: own update"  on streaks for update using (auth.uid() = user_id);

-- CognitivePrint: own only
create policy "cp: own read"         on cognitiveprint for select using (auth.uid() = user_id);
create policy "cp: own write"        on cognitiveprint for insert with check (auth.uid() = user_id);
create policy "cp: own update"       on cognitiveprint for update using (auth.uid() = user_id);

-- Community posts: all authenticated users can read, own write
create policy "posts: auth read"     on community_posts for select using (auth.role() = 'authenticated');
create policy "posts: own write"     on community_posts for insert with check (auth.uid() = user_id);
create policy "posts: own update"    on community_posts for update using (auth.uid() = user_id);
create policy "posts: own delete"    on community_posts for delete using (auth.uid() = user_id);

-- Rasas: public read (no auth needed)
alter table rasas enable row level security;
create policy "rasas: public read"   on rasas for select using (true);
