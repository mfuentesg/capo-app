ALTER TABLE public.user_song_settings
  ADD COLUMN IF NOT EXISTS chord_variations jsonb DEFAULT NULL;
