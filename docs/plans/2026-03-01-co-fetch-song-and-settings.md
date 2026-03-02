# Co-fetch Song and User Settings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate the double-render flash that occurs when user-specific song settings (capo, transpose, font size) load after the lyrics view has already mounted with song defaults.

**Architecture:** Three-part fix using Approach A. (1) `LyricsPageClient`: server-prefetch both song and user settings in `page.tsx` via `Promise.all`, pass as `initialData` to `useUserSongSettings` — settings available on first render, no remount needed. (2) `SongDetail` panel + `ActiveSongLyricsForShare` drawer: add a `getAllUserSongSettings` DB function + `getAllUserSongSettingsAction` server action + `useAllUserSongSettings` hook that bulk-fetches all settings for the current user and pre-populates each song's individual React Query cache entry; call this hook once at the parent view level so settings are warm before any song is opened.

**Tech Stack:** Next.js 15 server components, React Query (`@tanstack/react-query`), Supabase, TypeScript, Jest + Testing Library.

---

### Task 1: Add `getAllUserSongSettings` to the DB layer

**Files:**
- Modify: `features/songs/api/user-song-settings-api.ts`

**Step 1: Add the function**

```typescript
export async function getAllUserSongSettings(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserSongSettings[]> {
  const { data, error } = await supabase
    .from("user_song_settings")
    .select("*")
    .eq("user_id", userId)

  if (error) throw error
  return (data ?? []).map(mapRowToSettings)
}
```

**Step 2: Run lint + typecheck**

```bash
pnpm lint && pnpm typecheck
```
Expected: no errors.

**Step 3: Commit**

```bash
git add features/songs/api/user-song-settings-api.ts
git commit -m "feat: add getAllUserSongSettings DB function"
```

---

### Task 2: Add `getAllUserSongSettingsAction` server action

**Files:**
- Modify: `features/songs/api/actions.ts`

**Step 1: Add the import and action**

Add `getAllUserSongSettings as getAllUserSongSettingsApi` to the import from `./user-song-settings-api`, then add:

```typescript
export async function getAllUserSongSettingsAction(): Promise<UserSongSettings[]> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return []
  return getAllUserSongSettingsApi(supabase, user.id)
}
```

**Step 2: Run lint + typecheck**

```bash
pnpm lint && pnpm typecheck
```
Expected: no errors.

**Step 3: Commit**

```bash
git add features/songs/api/actions.ts
git commit -m "feat: add getAllUserSongSettingsAction server action"
```

---

### Task 3: Write tests for the new server action

**Files:**
- Modify: `features/songs/api/__tests__/actions.test.ts`

**Step 1: Add mock for the new function at the top of the mock block**

In the existing `jest.mock("../songsApi", ...)` block, the `getAllUserSongSettings` mock goes in the `user-song-settings-api.ts` mock (which already mocks `getUserSongSettings` and `upsertUserSongSettings`):

```typescript
jest.mock("../user-song-settings-api", () => ({
  getUserSongSettings: jest.fn(),
  upsertUserSongSettings: jest.fn(),
  getAllUserSongSettings: jest.fn()
}))
```

**Step 2: Add the test**

```typescript
describe("getAllUserSongSettingsAction", () => {
  it("returns empty array when no user is authenticated", async () => {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
    })

    const result = await getAllUserSongSettingsAction()

    expect(result).toEqual([])
  })

  it("calls getAllUserSongSettings with supabase and userId", async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) }
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(getAllUserSongSettings as jest.Mock).mockResolvedValue([
      { songId: "song-1", capo: 2, transpose: 0, fontSize: undefined }
    ])

    const result = await getAllUserSongSettingsAction()

    expect(getAllUserSongSettings).toHaveBeenCalledWith(mockSupabase, "user-1")
    expect(result).toEqual([{ songId: "song-1", capo: 2, transpose: 0, fontSize: undefined }])
  })
})
```

**Step 3: Import the new action in the test file**

Add `getAllUserSongSettingsAction` to the import and add `getAllUserSongSettings` to the import from the mocked module.

**Step 4: Run the tests**

```bash
pnpm test -- features/songs/api/__tests__/actions.test.ts
```
Expected: all tests pass.

**Step 5: Commit**

```bash
git add features/songs/api/__tests__/actions.test.ts
git commit -m "test: add getAllUserSongSettingsAction tests"
```

---

### Task 4: Export `getAllUserSongSettingsAction` from the songs feature

**Files:**
- Modify: `features/songs/index.ts`

**Step 1: Add the export**

`getAllUserSongSettingsAction` is already exported from `features/songs/api/actions.ts`. Check if it needs to be re-exported from `features/songs/index.ts` for use in `songs-client.tsx`. Looking at the current index.ts, `api` is exported as an object. The actions are not explicitly re-exported — the hooks import directly from `"../api/actions"`. So no change needed to `index.ts` for the server action.

However, the new hook `useAllUserSongSettings` needs to be exported from `index.ts`.

**Step 2: Verify import paths**

The new hook will live at `features/songs/hooks/use-user-song-settings.ts` (alongside existing hooks). It will import `getAllUserSongSettingsAction` directly from `"../api/actions"`. Consumers (`songs-client.tsx`, `PlaylistShareView`) will import the hook from `@/features/songs`.

No changes to `index.ts` needed until the hook is written (Task 5). Skip this task — merge into Task 5.

---

### Task 5: Add `useAllUserSongSettings` hook

**Files:**
- Modify: `features/songs/hooks/use-user-song-settings.ts`

**Step 1: Add a new query key for all-settings**

In `features/songs/hooks/query-keys.ts`, add:

```typescript
allUserSettings: () => [...songsKeys.all, "user-settings", "all"] as const,
```

**Step 2: Add `useAllUserSongSettings` to `use-user-song-settings.ts`**

```typescript
import { getAllUserSongSettingsAction } from "../api/actions"

/**
 * Fetches all user song settings in a single query and pre-populates
 * individual song setting caches. Call this once at the parent view level
 * (e.g. songs list, playlist share view) so settings are warm before
 * any song detail is opened.
 */
export function useAllUserSongSettings() {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: songsKeys.allUserSettings(),
    queryFn: async () => {
      const settings = await getAllUserSongSettingsAction()
      settings.forEach((s) => {
        queryClient.setQueryData(songsKeys.userSettings(s.songId), s)
      })
      return settings
    },
    staleTime: 60_000
  })
}
```

**Step 3: Export from `features/songs/index.ts`**

Add `useAllUserSongSettings` to the export line:

```typescript
export {
  useUserSongSettings,
  useUpsertUserSongSettings,
  useEffectiveSongSettings,
  useAllUserSongSettings
} from "./hooks/use-user-song-settings"
```

**Step 4: Run lint + typecheck**

```bash
pnpm lint && pnpm typecheck
```
Expected: no errors.

**Step 5: Commit**

```bash
git add features/songs/hooks/use-user-song-settings.ts features/songs/hooks/query-keys.ts features/songs/index.ts
git commit -m "feat: add useAllUserSongSettings hook for bulk cache priming"
```

---

### Task 6: Fix `LyricsPageClient` — server prefetch settings

**Files:**
- Modify: `app/dashboard/songs/[id]/page.tsx`
- Modify: `app/dashboard/songs/[id]/lyrics-page-client.tsx`

**Step 1: Update `page.tsx` to fetch settings in parallel**

```typescript
import { api } from "@/features/songs/api"
import { getUserSongSettingsAction } from "@/features/songs/api/actions"
import { notFound } from "next/navigation"
import { LyricsPageClient } from "./lyrics-page-client"

export default async function SongLyricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [song, initialUserSettings] = await Promise.all([
    api.getSong(id),
    getUserSongSettingsAction(id).catch(() => null)
  ])

  if (!song) {
    notFound()
  }

  return <LyricsPageClient song={song} initialUserSettings={initialUserSettings} />
}
```

**Step 2: Update `lyrics-page-client.tsx` to accept and use `initialUserSettings`**

The `initialData` option in React Query treats the provided value as already-loaded data (status `'success'`). This means `useUserSongSettings` will never return `undefined` for `data` on first render, eliminating the `settingsKey` remount trick.

```typescript
"use client"

import {
  useUpdateSong,
  useUserSongSettings,
  useEffectiveSongSettings,
  useUpsertUserSongSettings
} from "@/features/songs"
import { LyricsView } from "@/features/lyrics-editor"
import type { Song, UserSongSettings } from "@/types"

interface LyricsPageClientProps {
  song: Song
  initialUserSettings: UserSongSettings | null
}

export function LyricsPageClient({ song, initialUserSettings }: LyricsPageClientProps) {
  const { mutate: updateSong, isPending: isSaving } = useUpdateSong()
  useUserSongSettings(song, initialUserSettings)
  const effectiveSettings = useEffectiveSongSettings(song)
  const { mutate: upsertSettings } = useUpsertUserSongSettings(song)

  return (
    <LyricsView
      song={song}
      onSaveLyrics={(lyrics) => updateSong({ songId: song.id, updates: { lyrics } })}
      isSaving={isSaving}
      initialSettings={effectiveSettings}
      onSettingsChange={upsertSettings}
    />
  )
}
```

Note: `useUserSongSettings` is called to prime the cache (so `useEffectiveSongSettings` which calls it internally sees the data immediately). The `settingsKey` trick is removed — no remount needed.

**Step 3: Update `useUserSongSettings` to accept `initialData`**

In `features/songs/hooks/use-user-song-settings.ts`:

```typescript
export function useUserSongSettings(song: Song, initialData?: UserSongSettings | null) {
  return useQuery({
    queryKey: songsKeys.userSettings(song.id),
    queryFn: () => getUserSongSettingsAction(song.id),
    initialData: initialData ?? undefined,
    staleTime: 60_000
  })
}
```

Note: `initialData: undefined` means "no initial data" (React Query ignores it). `initialData: null` means "confirmed no settings" — query starts as `success` with `data: null`. `initialData: UserSongSettings` means "settings loaded" — query starts as `success` with the settings.

**Step 4: Run lint + typecheck**

```bash
pnpm lint && pnpm typecheck
```
Expected: no errors.

**Step 5: Commit**

```bash
git add app/dashboard/songs/[id]/page.tsx app/dashboard/songs/[id]/lyrics-page-client.tsx features/songs/hooks/use-user-song-settings.ts
git commit -m "feat: server-prefetch user settings in LyricsPageClient to eliminate remount flash"
```

---

### Task 7: Fix `SongDetail` panel — prime cache before song is opened

**Files:**
- Modify: `features/songs/components/songs-client.tsx`

**Step 1: Call `useAllUserSongSettings` at the top of `SongsClient`**

In `songs-client.tsx`, add `useAllUserSongSettings` to the import from `@/features/songs` and call it near the top of the component:

```typescript
import { useAllUserSongSettings, ... } from "@/features/songs"

export function SongsClient() {
  useAllUserSongSettings() // pre-populates individual song setting caches
  // ... rest of component unchanged
}
```

This fires one bulk query when the songs view mounts. By the time the user clicks a song to open `SongDetail`, the settings for that song (if any) are already in the React Query cache.

**Step 2: Run lint + typecheck**

```bash
pnpm lint && pnpm typecheck
```
Expected: no errors.

**Step 3: Commit**

```bash
git add features/songs/components/songs-client.tsx
git commit -m "feat: prime user settings cache in SongsClient to eliminate SongDetail flash"
```

---

### Task 8: Fix `ActiveSongLyricsForShare` — prime cache in playlist share view

**Files:**
- Modify: `features/playlist-sharing/components/playlist-share-view.tsx`

**Step 1: Call `useAllUserSongSettings` when user is authenticated**

The `ActiveSongLyricsForShare` component only matters for authenticated users. Call `useAllUserSongSettings` in `PlaylistShareView` so settings are pre-loaded before any song drawer opens:

```typescript
import { useAllUserSongSettings, ... } from "@/features/songs"

export function PlaylistShareView({ playlist }: PlaylistShareViewProps) {
  const { data: user } = useUser()
  useAllUserSongSettings() // no-op for unauthenticated users (returns [])
  // ... rest of component unchanged
}
```

The server action already returns `[]` for unauthenticated users, so this is safe to call unconditionally.

Also remove the `settingsKey` remount trick from `ActiveSongLyricsForShare`:

```typescript
function ActiveSongLyricsForShare({ song, onClose, isAuthenticated }: ActiveSongLyricsForShareProps) {
  const { data: userSettings } = useUserSongSettings(song)
  const effectiveSettings = useEffectiveSongSettings(song)
  const { mutate: upsertSettings } = useUpsertUserSongSettings(song)
  // settingsKey trick removed — cache is pre-populated by useAllUserSongSettings

  return (
    <LyricsView
      mode="panel"
      readOnly
      song={{ ... }}
      onClose={onClose}
      initialSettings={effectiveSettings}
      onSettingsChange={isAuthenticated ? upsertSettings : undefined}
    />
  )
}
```

**Step 2: Run lint + typecheck**

```bash
pnpm lint && pnpm typecheck
```
Expected: no errors.

**Step 3: Commit**

```bash
git add features/playlist-sharing/components/playlist-share-view.tsx
git commit -m "feat: prime user settings cache in PlaylistShareView to eliminate drawer flash"
```

---

### Task 9: Run full test suite + push

**Step 1: Run all tests**

```bash
pnpm test
```
Expected: all 31 suites, 246 tests pass.

**Step 2: Run lint and typecheck**

```bash
pnpm lint && pnpm typecheck
```
Expected: no errors.

**Step 3: Push**

```bash
git push
```
