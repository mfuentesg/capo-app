# Real-time Playlist Collaboration — Implementation Plan

**Date:** 2026-03-08
**Status:** Pending

## Context

Stub hooks already exist in the codebase:
- `features/playlists/hooks/use-playlist-collaboration.ts`
- `features/playlists/hooks/use-playlist-presence.ts`

Both contain commented-out Supabase Realtime channel code. This plan implements them fully.

## Problem

Multiple team members can edit a shared playlist simultaneously, but changes aren't reflected in real time — users must refresh to see updates. There's also no indicator of who else is viewing the playlist.

## Approach

Use Supabase Realtime:
- **Postgres Changes** listener on `playlist_songs` and `playlists` tables → update React Query cache on INSERT/UPDATE/DELETE
- **Presence** channel → show avatars of users currently viewing the playlist

---

### Task 1: Implement `usePlaylistCollaboration`

**Files:**
- Modify: `features/playlists/hooks/use-playlist-collaboration.ts`

```typescript
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { playlistsKeys } from "./query-keys"
import type { PlaylistWithSongs } from "../types"

export function usePlaylistCollaboration(playlistId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`playlist:${playlistId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "playlist_songs",
          filter: `playlist_id=eq.${playlistId}`
        },
        () => {
          // Invalidate the playlist detail query — simplest correct approach
          queryClient.invalidateQueries({
            queryKey: playlistsKeys.detail(playlistId)
          })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "playlists",
          filter: `id=eq.${playlistId}`
        },
        (payload) => {
          // Optimistically update name/description without a full refetch
          queryClient.setQueryData<PlaylistWithSongs>(
            playlistsKeys.detail(playlistId),
            (old) => (old ? { ...old, ...(payload.new as Partial<PlaylistWithSongs>) } : old)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [playlistId, queryClient])
}
```

---

### Task 2: Implement `usePlaylistPresence`

**Files:**
- Modify: `features/playlists/hooks/use-playlist-presence.ts`

```typescript
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/features/auth"

export interface PresenceUser {
  userId: string
  displayName: string
  avatarUrl?: string
  onlineAt: string
}

export function usePlaylistPresence(playlistId: string) {
  const [presentUsers, setPresentUsers] = useState<PresenceUser[]>([])
  const { data: user } = useUser()

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const channel = supabase.channel(`presence:playlist:${playlistId}`, {
      config: { presence: { key: user.id } }
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>()
        const users = Object.values(state).flat()
        setPresentUsers(users)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId: user.id,
            displayName: user.user_metadata?.full_name ?? user.email ?? "Unknown",
            avatarUrl: user.user_metadata?.avatar_url,
            onlineAt: new Date().toISOString()
          } satisfies PresenceUser)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [playlistId, user])

  return { presentUsers }
}
```

---

### Task 3: Add presence avatars to `PlaylistDetail`

**Files:**
- Modify: `features/playlists/components/playlist-detail.tsx`

```tsx
import { usePlaylistCollaboration } from "../hooks/use-playlist-collaboration"
import { usePlaylistPresence } from "../hooks/use-playlist-presence"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// In PlaylistDetail component:
usePlaylistCollaboration(playlist.id)
const { presentUsers } = usePlaylistPresence(playlist.id)

// In JSX, render presence indicators in the playlist header:
<div className="flex -space-x-2">
  {presentUsers.map((u) => (
    <Avatar key={u.userId} className="h-7 w-7 border-2 border-background" title={u.displayName}>
      <AvatarImage src={u.avatarUrl} />
      <AvatarFallback>{u.displayName[0]?.toUpperCase()}</AvatarFallback>
    </Avatar>
  ))}
</div>
```

---

### Task 4: Enable Realtime on affected tables

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_enable_realtime_playlist_collaboration.sql`

```sql
-- Enable Realtime replication for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlist_songs;
```

```bash
pnpm supabase migration new "enable_realtime_playlist_collaboration"
# Write the SQL above, then:
pnpm supabase migration up --local
```

---

### Task 5: RLS for Realtime

Ensure RLS policies on `playlists` and `playlist_songs` allow the authenticated user to receive change events for playlists they're allowed to view (team member or playlist owner).

---

### Task 6: Export from feature index

**Files:**
- Modify: `features/playlists/index.ts`

```typescript
export { usePlaylistCollaboration } from "./hooks/use-playlist-collaboration"
export { usePlaylistPresence, type PresenceUser } from "./hooks/use-playlist-presence"
```

---

### Task 7: Tests

- Unit test `usePlaylistCollaboration`: mock Supabase channel, verify `invalidateQueries` is called on postgres change event
- Unit test `usePlaylistPresence`: mock presence state sync, verify `presentUsers` is updated

---

### Task 8: i18n

```json
{
  "playlist": {
    "presentUsers": "{{count}} viewing",
    "youAndOthers": "You and {{count}} others"
  }
}
```

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
