"use client"

import { PlaylistDraft, usePlaylistDraft } from "@/features/playlist-draft"
import {
  usePlaylists,
  useCreatePlaylist,
  useAddSongsToPlaylist
} from "@/features/playlists"
import { useUser } from "@/features/auth"
import type { Playlist } from "@/features/playlists"

/**
 * Client component that handles playlist draft state.
 * Extracted from dashboard layout to keep layout as a Server Component.
 */
export function DraftIndicator() {
  const { playlistDraft, isDraftOpen, setIsDraftOpen, clearDraft, removeFromDraft, reorderDraft } =
    usePlaylistDraft()
  const { data: playlists = [] } = usePlaylists()
  const { data: user } = useUser()
  const createPlaylistMutation = useCreatePlaylist()
  const addSongsMutation = useAddSongsToPlaylist()

  const isSubmitting = createPlaylistMutation.isPending || addSongsMutation.isPending

  const handleSubmit = async (
    selection: { type: "new"; name: string } | { type: "existing"; playlistId: string }
  ) => {
    if (!user?.id) return

    if (selection.type === "new") {
      const playlist: Playlist = {
        id: "",
        name: selection.name,
        songs: playlistDraft.map((s) => s.id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      await createPlaylistMutation.mutateAsync({ playlist, userId: user.id })
    } else {
      await addSongsMutation.mutateAsync({
        playlistId: selection.playlistId,
        songIds: playlistDraft.map((s) => s.id)
      })
    }

    clearDraft()
    setIsDraftOpen(false)
  }

  return (
    <PlaylistDraft
      songs={playlistDraft}
      playlists={playlists}
      isOpen={isDraftOpen}
      onOpenChange={setIsDraftOpen}
      onClear={clearDraft}
      onRemove={removeFromDraft}
      onReorder={reorderDraft}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  )
}
