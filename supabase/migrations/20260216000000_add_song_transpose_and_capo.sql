-- Add persistent transpose and capo settings to songs
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS transpose INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS capo INTEGER NOT NULL DEFAULT 0;

ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_transpose_range;
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_capo_range;

ALTER TABLE songs
ADD CONSTRAINT songs_transpose_range CHECK (
    transpose >= -6
    AND transpose <= 6
),
ADD CONSTRAINT songs_capo_range CHECK (
    capo >= 0
    AND capo <= 12
);
