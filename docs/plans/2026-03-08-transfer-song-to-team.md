# Transfer Song to Team — Implementation Plan

**Date:** 2026-03-08
**GitHub Issue:** #40
**Status:** Pending

## Problem

Songs created under a personal account can't be moved to a team. Users who start using the app individually and then join/create a team need a way to migrate their personal songs to the shared team library without re-creating them.

## Approach

Add a "Transfer to team" option in the song context menu (`SongItem` / `SongDetail`). A server action updates `songs.team_id` (setting it) and `songs.user_id` (clearing or keeping for attribution). A dialog lets the user pick which team to transfer to.

---

### Task 1: Verify DB schema for song ownership

Check `supabase/migrations/` to confirm `songs` has both `user_id` and `team_id` columns. The app context filter likely uses one or the other. If a song has `team_id` set, it belongs to the team. If it has only `user_id`, it's personal.

RLS policy: ensure only team admins (or any member) can receive transferred songs. Define the permission boundary.

---

### Task 2: Create `transferSongToTeamAction` server action

**Files:**
- Modify: `features/songs/api/actions.ts`

```typescript
export async function transferSongToTeamAction(
  songId: string,
  teamId: string
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Verify the song belongs to this user
  const { data: song, error: fetchError } = await supabase
    .from("songs")
    .select("id, user_id, team_id")
    .eq("id", songId)
    .single()

  if (fetchError || !song) throw new Error("Song not found")
  if (song.user_id !== user.id) throw new Error("Unauthorized")
  if (song.team_id) throw new Error("Song is already in a team")

  // Verify user is a member of the target team
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!membership) throw new Error("Not a member of this team")

  const { error } = await supabase
    .from("songs")
    .update({ team_id: teamId, user_id: null })
    .eq("id", songId)

  if (error) throw error
}
```

---

### Task 3: Create `TransferToTeamDialog` component

**Files:**
- Create: `features/songs/components/transfer-to-team-dialog.tsx`

```tsx
"use client"

import { useState } from "react"
import { useTeams } from "@/features/teams"
import { transferSongToTeamAction } from "../api/actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface TransferToTeamDialogProps {
  songId: string
  songTitle: string
  open: boolean
  onClose: () => void
  onTransferred: () => void
}

export function TransferToTeamDialog({
  songId,
  songTitle,
  open,
  onClose,
  onTransferred
}: TransferToTeamDialogProps) {
  const { data: teams = [] } = useTeams()
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [pending, setPending] = useState(false)

  const handleTransfer = async () => {
    if (!selectedTeamId) return
    setPending(true)
    try {
      await transferSongToTeamAction(songId, selectedTeamId)
      toast.success(`"${songTitle}" transferred to team`)
      onTransferred()
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transfer failed")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer "{songTitle}" to a team</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          The song will be moved to the selected team and removed from your personal library.
          This cannot be undone.
        </p>
        {teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">You are not a member of any team.</p>
        ) : (
          <RadioGroup value={selectedTeamId} onValueChange={setSelectedTeamId}>
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-2">
                <RadioGroupItem value={team.id} id={team.id} />
                <Label htmlFor={team.id}>{team.name}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!selectedTeamId || pending || teams.length === 0}
            onClick={handleTransfer}
          >
            {pending ? "Transferring…" : "Transfer song"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Task 4: Add "Transfer to team" option to song menu

**Files:**
- Modify: `features/songs/components/song-item.tsx` or the song context menu component

Add a "Transfer to team" menu item that opens `<TransferToTeamDialog>`. Only show it if:
- The song is personal (no `team_id`)
- The user belongs to at least one team

---

### Task 5: Invalidate queries after transfer

After a successful transfer, invalidate:
- `songsKeys.list()` — to remove the song from the personal list
- `songsKeys.detail(songId)` — stale detail data

---

### Task 6: Tests

- Unit test `transferSongToTeamAction`: mock Supabase, verify authorization checks
- Test: transferring a song that already has a `team_id` throws an error
- Test: transferring a song the user doesn't own throws an error
- Test: successful transfer calls the correct Supabase update

---

### Task 7: i18n

```json
{
  "song": {
    "transferToTeam": "Transfer to team",
    "transferDialog": {
      "title": "Transfer to a team",
      "description": "This song will be moved to the selected team and removed from your personal library.",
      "confirm": "Transfer song",
      "noTeams": "You are not a member of any team."
    }
  }
}
```

---

### Verification

```bash
pnpm lint && pnpm typecheck && pnpm test
```
