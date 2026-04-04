-- ============================================================
-- MoveYourMatter — Video Infrastructure
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ============================================================
-- 1. VIDEOS
-- Each row is one video clip stored in Supabase Storage
-- ============================================================

create table if not exists videos (
  id            uuid default gen_random_uuid() primary key,
  title         text not null,
  description   text,

  -- Storage
  storage_path  text not null,       -- path in Supabase Storage bucket
  url           text not null,       -- public URL

  -- Classification
  type          text not null,       -- 'continuous' | 'opening' | 'closing' | 'move'
  rasa_slug     text references rasas(slug),  -- null = shared across all rasas
  track         text default 'A',    -- A (Kathak) | B (Movement)

  -- Move metadata (for type = 'move')
  move_name     text,                -- e.g. "Namaste", "Tatkar Base"
  cognitive_focus text,              -- e.g. "attention" | "flexibility" | "presence"

  -- Playback
  duration_seconds int,
  thumbnail_url text,

  -- Status
  active        boolean default true,
  created_at    timestamptz default now()
);

-- RLS: public read (videos are not private)
alter table videos enable row level security;
create policy "videos: public read" on videos for select using (true);


-- ============================================================
-- 2. SESSION PLANS
-- Maps a session type to an ordered list of video clips
-- For 'continuous' sessions: one row with a single video
-- For 'sequenced' sessions: multiple rows with position ordering
-- ============================================================

create table if not exists session_plans (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,          -- e.g. "Week 1 · Veera · Foundation"
  rasa_slug     text references rasas(slug),
  track         text default 'A',
  plan_type     text default 'continuous', -- 'continuous' | 'sequenced'
  active        boolean default true,
  created_at    timestamptz default now()
);

create table if not exists session_plan_clips (
  id            uuid default gen_random_uuid() primary key,
  plan_id       uuid references session_plans(id) on delete cascade,
  video_id      uuid references videos(id),
  position      int not null,           -- ordering of clips
  created_at    timestamptz default now()
);

alter table session_plans enable row level security;
alter table session_plan_clips enable row level security;
create policy "session_plans: public read" on session_plans for select using (true);
create policy "session_plan_clips: public read" on session_plan_clips for select using (true);


-- ============================================================
-- 3. Link practice_sessions to the plan used
-- ============================================================

alter table practice_sessions
  add column if not exists session_plan_id uuid references session_plans(id);
