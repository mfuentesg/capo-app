# Tags on Songs — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #47
**Status:** Pending

## Problem

Users can only filter songs by key, artist, BPM range, and status. There's no way to add custom labels (e.g. "worship", "upbeat", "Christmas", "needs practice") and filter by them. Tags are already present in the `Song` type and the database `songs` table has a `tags` column (text array), but no UI exposes them yet.

## Approach

1. Expose a tag editor in `SongDraftForm` (create/edit song).
2. Display tags as badges in `SongItem` and `SongDetail`.
3. Add a tag filter to the `SongList` filter bar.
4. All filtering happens client-side (songs are already loaded).

---

### Task 1: Verify DB schema

Check `supabase/migrations/` to confirm `songs.tags` is `text[]`. If not, create a migration:

```bash
pnpm supabase migration new "add_tags_to_songs"
```

```sql
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
```

```bash
pnpm supabase migration up --local && pnpm types:generate
```

---

### Task 2: Add tag editor to `SongDraftForm`

**Files:**
- Modify: `features/song-draft/components/song-draft-form.tsx`
- Create: `features/song-draft/components/tag-input.tsx`

**`TagInput` component:**

```tsx
// features/song-draft/components/tag-input.tsx
"use client"

import { useState, KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState("")

  const addTag = () => {
    const tag = input.trim().toLowerCase()
    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
    }
    setInput("")
  }

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag))

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className="flex flex-wrap gap-1 border rounded-md p-2 min-h-[42px]">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <button onClick={() => removeTag(tag)} type="button">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? "Add tags (press Enter or comma)" : ""}
        className="border-0 p-0 h-auto flex-1 min-w-[120px] focus-visible:ring-0"
      />
    </div>
  )
}
```

**In `SongDraftForm`:** Add a `tags` field to the form schema (zod: `z.array(z.string()).default([])`), render `<TagInput>` connected to `react-hook-form`.

---

### Task 3: Display tags in `SongItem` and `SongDetail`

**Files:**
- Modify: `features/songs/components/song-item.tsx`
- Modify: `features/songs/components/song-detail.tsx`

In `SongItem`, render tags as small `<Badge variant="outline">` chips below the title/artist line, max 3 visible + overflow count.

In `SongDetail`, render all tags in a dedicated "Tags" row.

---

### Task 4: Add tag filter to `SongList`

**Files:**
- Modify: `features/songs/components/song-list.tsx`
- Modify: `features/songs/types/index.ts` (add `selectedTags` to filter state)

**Filter logic:**

```typescript
// Filter songs by selected tags (AND logic: song must have ALL selected tags)
const filteredSongs = songs.filter((song) =>
  selectedTags.every((tag) => song.tags?.includes(tag))
)
```

**UI:** A `Popover` with a checklist of all unique tags across all songs. Selected tags appear as badge chips in the filter bar, removable with an X.

---

### Task 5: Update `updateSong` / `createSong` to include tags

Verify that the existing `updateSong` server action and `createSong` action pass `tags` through to the DB. If the Supabase upsert already uses spread/`...updates`, no change is needed as long as `tags` is in the `Song` type.

---

### Task 6: Tests

- Unit test `TagInput`: add tag on Enter, remove on Backspace, skip duplicate tags.
- Unit test the tag filter logic in `SongList`.

---

### Task 7: i18n

```json
{
  "songForm": { "tags": "Tags", "tagsPlaceholder": "Add tags…" },
  "songFilter": { "filterByTag": "Filter by tag", "noTags": "No tags" }
}
```

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
