"use client"

import { PlaylistDraft, usePlaylistDraft } from "@/features/playlist-draft"

/**
 * Client component that handles playlist draft state.
 * Extracted from dashboard layout to keep layout as a Server Component.
 */
export function DraftIndicator() {
  const { playlistDraft, isDraftOpen, setIsDraftOpen, clearDraft, removeFromDraft, reorderDraft } =
    usePlaylistDraft()

  return (
    <PlaylistDraft
      songs={playlistDraft}
      isOpen={isDraftOpen}
      onOpenChange={setIsDraftOpen}
      onClear={clearDraft}
      onRemove={removeFromDraft}
      onReorder={reorderDraft}
    />
  )
}
