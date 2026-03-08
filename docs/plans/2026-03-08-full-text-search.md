# Full Text Search — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #48
**Status:** Pending

## Problem

The current song search uses a SQL `ILIKE '%query%'` pattern match against title and artist. This is slow on large libraries, doesn't rank results by relevance, and can't search inside lyrics or notes. PostgreSQL has built-in full-text search via `tsvector`/`tsquery` that Supabase exposes natively.

## Approach

Add a generated `tsvector` column to the `songs` table that indexes title, artist, lyrics, notes, and tags. Use `to_tsquery` in the server action for search. Maintain the existing client-side debounce and React Query pattern.

---

### Task 1: DB migration — add `search_vector` column

```bash
pnpm supabase migration new "add_full_text_search_to_songs"
```

```sql
-- Add the generated tsvector column
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(artist, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(notes, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(lyrics, '')), 'D')
  ) STORED;

-- GIN index for fast full-text queries
CREATE INDEX songs_search_vector_idx ON public.songs USING GIN (search_vector);
```

```bash
pnpm supabase migration up --local && pnpm types:generate
```

---

### Task 2: Update the song search query

**Files:**
- Modify: `features/songs/api/songs-api.ts` (or wherever `getSongs` lives)

Replace the current ILIKE filter with a `textsearch` filter:

```typescript
export async function getSongs(
  supabase: SupabaseClient<Database>,
  context: AppContext,
  query?: string
): Promise<Song[]> {
  let req = supabase
    .from("songs")
    .select("id, title, artist, key, bpm, tags, capo, transpose, is_draft, ...")
    .order("title")

  // Apply team/user context filter
  req = applyContextFilter(req, context)

  if (query && query.trim().length > 0) {
    // Use full-text search for queries with 2+ chars
    const tsQuery = query
      .trim()
      .split(/\s+/)
      .map((word) => `${word}:*`) // prefix matching
      .join(" & ")
    req = req.textSearch("search_vector", tsQuery, { type: "websearch" })
  }

  const { data, error } = await req
  if (error) throw error
  return (data ?? []).map(mapRowToSong)
}
```

**Note:** Supabase's `.textSearch()` wraps `@@` operator. Use `type: "websearch"` for `websearch_to_tsquery` which handles partial words gracefully.

---

### Task 3: Highlight matched terms in results (optional, v2)

For a first version, results are returned unsorted by relevance. For v2, order by `ts_rank`:

```typescript
req = req.order("ts_rank(search_vector, websearch_to_tsquery('english', query))", {
  ascending: false
})
```

This requires a raw SQL query via `.rpc()` or Supabase's `order` with a computed column. Defer to v2.

---

### Task 4: Update `useSongs` hook

**Files:**
- Modify: `features/songs/hooks/use-songs.ts`

The hook already accepts a search `query`. No changes needed if the API function is updated correctly. Verify that React Query re-fetches when `query` changes (it should, since `query` is part of the query key).

---

### Task 5: Debounce UX improvement

**Files:**
- Modify: `features/songs/components/song-list.tsx` (or wherever the search input lives)

Ensure the search input debounces at 300ms before triggering a React Query refetch. Use `useDeferredValue` or a manual debounce hook.

---

### Task 6: Tests

- Unit test the query builder: given a search string, verify the Supabase mock receives a `.textSearch()` call (not `.ilike()`).
- Test empty query falls back to returning all songs.
- Test that the generated column is indexed (integration test with local Supabase).

---

### Task 7: i18n

No new strings needed — search input label is already translated. Add placeholder text if missing:

```json
{ "songList": { "searchPlaceholder": "Search songs, artists, lyrics…" } }
```

---

### Verification

```bash
pnpm supabase migration up --local
pnpm types:generate
pnpm lint && pnpm typecheck && pnpm test
```
