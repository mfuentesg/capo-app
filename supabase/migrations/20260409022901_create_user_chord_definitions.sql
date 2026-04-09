-- Migration: Create user_chord_definitions table
-- Stores per-user custom chord fingerings, reusable across all songs.

create table user_chord_definitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chord_name text not null,
  base_fret integer not null default 1,
  frets integer[] not null,
  fingers integer[] not null default '{}',
  barres integer[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, chord_name)
);

alter table user_chord_definitions enable row level security;

create policy "Users manage their own chord definitions"
  on user_chord_definitions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index idx_user_chord_definitions_user_id on user_chord_definitions(user_id);
