CREATE TABLE user_song_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  capo INTEGER NOT NULL DEFAULT 0 CHECK (capo >= 0 AND capo <= 12),
  transpose INTEGER NOT NULL DEFAULT 0 CHECK (transpose >= -6 AND transpose <= 6),
  font_size NUMERIC(4,2) CHECK (font_size IS NULL OR (font_size >= 0.5 AND font_size <= 3)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, song_id)
);

ALTER TABLE user_song_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own song settings"
  ON user_song_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
