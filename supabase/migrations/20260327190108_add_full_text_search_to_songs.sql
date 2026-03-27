-- Add generated tsvector column for full-text search
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(artist, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(notes, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(lyrics, '')), 'D')
  ) STORED;

-- GIN index for fast full-text queries
CREATE INDEX IF NOT EXISTS songs_search_vector_idx ON public.songs USING GIN (search_vector);
